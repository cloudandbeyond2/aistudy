import MockInterviewDrive from '../models/MockInterviewDrive.js';
import MockApplication from '../models/MockApplication.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import GlobalSettings from '../models/GlobalSettings.js';
import { getGenAI } from '../config/gemini.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import mongoose from 'mongoose';
import OrgCourse from '../models/OrgCourse.js';

const normalizeForMatch = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const extractOrgCourseTopicTitles = (courses = []) => {
  const titles = [];
  for (const course of courses) {
    const topics = Array.isArray(course?.topics) ? course.topics : [];
    for (const topic of topics) {
      if (topic?.title) titles.push(topic.title);
      const subtopics = Array.isArray(topic?.subtopics) ? topic.subtopics : [];
      for (const sub of subtopics) {
        if (sub?.title) titles.push(sub.title);
      }
    }
  }

  // De-dup while preserving order.
  const seen = new Set();
  return titles.filter((t) => {
    const key = normalizeForMatch(t);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getAllowedTopicsForInterview = async ({ organizationId, driveSkills }) => {
  if (!organizationId) return [];

  const courses = await OrgCourse.find({ organizationId }).select('topics');
  const allTitles = extractOrgCourseTopicTitles(courses);

  if (!allTitles.length) return [];

  const keywords = Array.isArray(driveSkills)
    ? driveSkills.map(normalizeForMatch).filter(Boolean)
    : [];

  if (!keywords.length) return allTitles.slice(0, 30);

  const filtered = allTitles.filter((title) => {
    const t = normalizeForMatch(title);
    return keywords.some((k) => t.includes(k) || k.includes(t));
  });

  return (filtered.length ? filtered : allTitles).slice(0, 30);
};

const buildFallbackNextQuestion = ({ allowedTopics, targetRole, skills, aiTurnCount }) => {
  const topicPool = Array.isArray(allowedTopics) && allowedTopics.length
    ? allowedTopics
    : String(skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const topic = topicPool.length
    ? topicPool[aiTurnCount % topicPool.length]
    : targetRole || 'software development';

  return `Great. Next question: Can you explain ${topic} with one real project example and your exact implementation steps?`;
};

// --- MOCK DRIVE MANAGEMENT (Admin/Staff) ---

export const createMockDrive = async (req, res) => {
  try {
    const { title, description, skills, targetRole, experienceLevel, settings, difficulty, personaMood } = req.body;
    const userId = req.headers['user-id'];
    
    console.log(`[MockDrive:Auth] Start check for userId: ${userId} (Drive: ${title})`);
    
    let dbUser = await User.findById(userId);
    let dbOrg = null;
    let dbAdmin = null;
    let isAuthorized = false;
    let roleFound = 'none';

    if (dbUser) {
        console.log(`[MockDrive:Auth] Found in User collection. Role: ${dbUser.role}, isOrg: ${dbUser.isOrganization}`);
        const allowedRoles = ['org_admin', 'dept_admin', 'staff', 'superadmin'];
        if (allowedRoles.includes(dbUser.role) || dbUser.isOrganization) {
            isAuthorized = true;
            roleFound = dbUser.role || 'organization_user';
        }
    } else {
        dbOrg = await Organization.findById(userId);
        if (dbOrg) {
            console.log(`[MockDrive:Auth] Found in Organization collection: ${dbOrg.name}`);
            isAuthorized = true;
            roleFound = 'organization_entity';
        } else {
            const AdminModel = mongoose.model('Admin');
            dbAdmin = await AdminModel.findById(userId);
            if (dbAdmin) {
                console.log(`[MockDrive:Auth] Found in Admin collection: ${dbAdmin.email}`);
                isAuthorized = true;
                roleFound = 'superadmin_entity';
            }
        }
    }

    if (!isAuthorized) {
      console.warn(`[MockDrive:Auth] 403 Rejected. userId: ${userId}, UserFound: ${!!dbUser}, OrgFound: ${!!dbOrg}, AdminFound: ${!!dbAdmin}`);
      return res.status(403).json({ success: false, message: 'Unauthorized to create training drives' });
    }

    const finalSettings = {
        difficulty: settings?.difficulty || difficulty || 'Medium',
        personaMood: settings?.personaMood || personaMood || 'Professional',
        enableVoice: settings?.enableVoice ?? true
    };

    const targetOrgId = dbOrg ? dbOrg._id : (dbUser?.organization || dbUser?.organizationId || dbUser?._id);

    const drive = new MockInterviewDrive({
      title,
      description,
      skills,
      targetRole,
      experienceLevel: experienceLevel || 'Entry',
      organizationId: targetOrgId,
      createdBy: userId,
      settings: finalSettings
    });

    await drive.save();
    console.log(`[MockDrive:Auth] Success. Created drive ${drive._id} for Org ${targetOrgId}`);
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    console.error(`[MockDrive:Error]`, error);
    const msg = error.name === 'ValidationError' ? 
      Object.values(error.errors).map(val => val.message).join(', ') : 
      error.message;
    res.status(400).json({ success: false, message: msg });
  }
};

export const getMockDrives = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    console.log(`[MockDrive] Fetch request from userId: ${userId}`);
    
    let user = await User.findById(userId);
    let isAdmin = false;
    let isOrg = false;

    if (!user) {
        user = await Organization.findById(userId);
        if (user) isOrg = true;
    }

    if (!user) {
      const Admin = mongoose.model('Admin');
      user = await Admin.findById(userId);
      if (user) isAdmin = true;
    }

    if (!user) {
      console.warn(`[MockDrive] 404: User ${userId} not found`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let query = { isActive: true };

    if (isAdmin) {
      // Super Admin sees everything
    } else if (user.role === 'student' || user.role === 'user') {
      // Students see drives from their organization
      query.organizationId = user.organization || user.organizationId;
    } else {
      // Org Admins and Staff see drives for their org
      query.organizationId = isOrg ? user._id : (user.organization || user.organizationId || user._id);
    }

    const drives = await MockInterviewDrive.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- MOCK INTERVIEW CORE (User/Student) ---

const checkDailyLimit = async (user) => {
  const settings = await GlobalSettings.findOne();
  const limit = user.type === 'free' ? 
    (settings?.interviewModule?.dailyMockLimitFree || 2) : 
    (settings?.interviewModule?.dailyMockLimitPremium || 10);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.mockAttempts) {
    user.mockAttempts = { count: 0, lastResetAt: today };
  }

  if (new Date(user.mockAttempts.lastResetAt) < today) {
    user.mockAttempts.count = 0;
    user.mockAttempts.lastResetAt = today;
  }

  return { isOverLimit: user.mockAttempts.count >= limit, remaining: limit - user.mockAttempts.count };
};

export const startMockSession = async (req, res) => {
  try {
    const { driveId } = req.body;
    const userId = req.headers['user-id'];
    const user = await User.findById(userId);

    const { isOverLimit } = await checkDailyLimit(user);
    if (isOverLimit && user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Daily mock interview limit reached. Upgrade for more.' });
    }

    let drive = null;
    if (driveId) {
      drive = await MockInterviewDrive.findById(driveId);
      if (!drive) return res.status(404).json({ success: false, message: 'Training drive not found' });
    }

    const application = new MockApplication({
      userId,
      driveId: drive?._id || null,
      type: driveId ? 'Assigned' : 'Self',
      organizationId: user.organizationId || null,
      status: 'Started'
    });

    await application.save();

    // Increment attempt count
    user.mockAttempts.count += 1;
    await user.save();

    res.status(200).json({ success: true, data: application, drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chatWithAiInterviewer = async (req, res) => {
  try {
    const { applicationId, message, isArrival = false } = req.body;
    const application = await MockApplication.findById(applicationId).populate('driveId');
    if (!application) return res.status(404).json({ success: false, message: 'Session not found' });

    const drive = application.driveId;
    const persona = drive?.settings?.personaMood || 'Professional';
    const targetRole = drive?.targetRole || 'Software Professional';
    const skills = drive?.skills?.join(', ') || 'General Technical Skills';

    const genAI = await getGenAI();

    // Restrict interviewer topics to the org's training modules only.
    // Admin chooses `drive.skills`, but we still clamp to topics that exist in OrgCourse for that org.
    const allowedTopicsDrive = await getAllowedTopicsForInterview({
      organizationId: drive?.organizationId || null,
      driveSkills: drive?.skills || []
    });
    const allowedTopicsApp = allowedTopicsDrive.length
      ? []
      : await getAllowedTopicsForInterview({
          organizationId: application?.organizationId || null,
          driveSkills: drive?.skills || []
        });

    const allowedTopics = allowedTopicsDrive.length ? allowedTopicsDrive : allowedTopicsApp;

    const allowedTopicsText =
      allowedTopics.length > 0 ? allowedTopics.join(', ') : `(${skills})`;

    const systemPrompt = `You are a high-end ${persona} technical interviewer conducting a MOCK INTERVIEW for a ${targetRole} trainee.
    Your goal is to help them prepare for a real face-to-face interview.
    
    Context:
    - Target Role: ${targetRole}
    - Allowed Topics (ONLY from the organisation training modules):
      ${allowedTopicsText}
    - Atmosphere: ${persona} but helpful for training.
    
    Instructions:
    1. Ask one technical or behavioral question at a time.
    2. Respond briefly to their answer (acknowledge it) and then ALWAYS ask the next single question in the SAME message.
    3. Keep a professional tone.
    4. Only ask questions that are grounded in the Allowed Topics list. Never use topics outside this list.
    5. If the user gives a very short or poor answer, provide a small hint or ask for clarification once before moving on.
    6. After exactly 5-6 questions, wrap up by saying exactly: "Thank you for the session. I will now generate your performance blueprint."
    
    Output rule:
    - Unless you are wrapping up, your message MUST end with exactly one clear question mark (?) and it must be the next question.
    - When wrapping up, output ONLY the wrap-up sentence above and do NOT include any question marks (?).
    
    IMPORTANT: This is a MOCK interview for training. Do NOT mention job offers.`;

    // Use a model known to be supported by the current Gemini API setup.
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    // Defensive init for legacy/partial documents where nested paths may be missing.
    if (!application.genAiFeedback) {
      application.genAiFeedback = {};
    }
    if (!Array.isArray(application.genAiFeedback.transcript)) {
      application.genAiFeedback.transcript = [];
    }

    const history = application.genAiFeedback.transcript.map(t => ({
      role: t.role === 'ai' ? 'model' : 'user',
      parts: [{ text: t.message }]
    }));
    // Gemini requires the first history entry to be a 'user' message.
    // Some legacy sessions may start with an AI greeting; normalize it.
    if (history.length > 0 && history[0].role === 'model') {
      history.unshift({
        role: 'user',
        parts: [{ text: '(Start the mock interview.)' }]
      });
    }

    const chat = model.startChat({
      history: history,
      generationConfig: { maxOutputTokens: 500 }
    });

    let prompt = message;
    if (isArrival) {
      prompt = `(First Round) Hello, I am ready for the mock interview for ${targetRole}. Please start.`;
    }

    const result = await retryWithBackoff(() => chat.sendMessage(prompt), 2, 600);
    let aiResponse = String(result.response.text() || '').trim();

    const wrapUpPhrase = 'Thank you for the session. I will now generate your performance blueprint.';
    const lowerWrapUp = wrapUpPhrase.toLowerCase();
    const aiTurnsBeforeSave = application.genAiFeedback.transcript.filter(t => t.role === 'ai').length;
    const canWrapUpNow = aiTurnsBeforeSave >= 4; // current response will be at least the 5th AI turn
    const hasWrapUpText = aiResponse.toLowerCase().includes(lowerWrapUp);
    const hasQuestionMark = aiResponse.includes('?');

    // Guardrail 1: prevent early closure (before question cycle completes).
    if (hasWrapUpText && !canWrapUpNow) {
      aiResponse = buildFallbackNextQuestion({
        allowedTopics,
        targetRole,
        skills,
        aiTurnCount: aiTurnsBeforeSave
      });
    }

    // Guardrail 2: always continue with a next question unless this is final wrap-up.
    const willWrapNow = aiResponse.toLowerCase().includes(lowerWrapUp) && canWrapUpNow && !aiResponse.includes('?');
    if (!willWrapNow && !aiResponse.includes('?')) {
      aiResponse = `${aiResponse}\n\n${buildFallbackNextQuestion({
        allowedTopics,
        targetRole,
        skills,
        aiTurnCount: aiTurnsBeforeSave
      })}`.trim();
    }

    // Save history
    // Ensure transcript always starts with a user message (Gemini chat history requirement).
    if (isArrival) {
      application.genAiFeedback.transcript.push({ role: 'user', message: prompt, timestamp: new Date() });
    } else {
      application.genAiFeedback.transcript.push({ role: 'user', message, timestamp: new Date() });
    }
    application.genAiFeedback.transcript.push({ role: 'ai', message: aiResponse, timestamp: new Date() });
    
    // Determine if the session should be finalized. We gate this to prevent
    // accidental early termination when the model mentions the wrap-up phrase too soon.
    const aiResponseLower = String(aiResponse || '').toLowerCase();
    const existingAiTurns = application.genAiFeedback.transcript.filter(t => t.role === 'ai').length;
    const nextAiTurns = existingAiTurns + 1;
    const shouldFinalize =
      aiResponseLower.includes(lowerWrapUp) &&
      nextAiTurns >= 5 &&
      !aiResponseLower.includes('?');

    await application.save();

    res.status(200).json({ success: true, aiResponse, shouldFinalize });
  } catch (error) {
    console.error('[MockInterview:chatWithAiInterviewer] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const finalizeMockRound = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const application = await MockApplication.findById(applicationId).populate('driveId');
    if (!application) return res.status(404).json({ success: false, message: 'Session not found' });

    const transcript = application.genAiFeedback.transcript
      .map(t => `${t.role.toUpperCase()}: ${t.message}`)
      .join('\n');

    const genAI = await getGenAI();
    // Keep final evaluation on a supported model.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const analysisPrompt = `Analyze the following MOCK INTERVIEW transcript for a ${application.driveId?.targetRole || 'Technical Candidate'}.
    Provide a detailed performance blueprint for training purposes.
    
    Transcript:
    ${transcript}
    
    Return ONLY a JSON object with this format:
    {
      "score": (Number 1-100),
      "strengths": ["string"],
      "weaknesses": ["string"],
      "technicalGaps": ["topics the user struggled with"],
      "overallAnalysis": "A constructive 3-4 sentence paragraph for the trainee."
    }`;

    const result = await model.generateContent(analysisPrompt);
    let analysisText = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parseAnalysis = (raw) => {
      const cleaned = String(raw || '').trim();
      if (!cleaned) return null;

      try {
        return JSON.parse(cleaned);
      } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
          const candidate = cleaned.slice(start, end + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            return null;
          }
        }
      }
      return null;
    };

    let analysis = parseAnalysis(analysisText);

    if (!analysis) {
      const repairPrompt = `Convert the following response into STRICT JSON only with keys:
score (1-100 number), strengths (string[]), weaknesses (string[]), technicalGaps (string[]), overallAnalysis (string).

Response:
${analysisText}`;

      const repairResult = await model.generateContent(repairPrompt);
      analysis = parseAnalysis(repairResult.response.text());
    }

    if (!analysis) {
      analysis = {
        score: 60,
        strengths: ['Participated actively in the mock interview session'],
        weaknesses: ['Some answers lacked depth and structure'],
        technicalGaps: ['Needs stronger fundamentals for role-specific concepts'],
        overallAnalysis:
          'You completed the mock interview session. Your responses show potential, but you should improve answer structure, depth, and role-specific technical clarity for better performance.'
      };
    }

    const normalizedAnalysis = {
      score: Number.isFinite(Number(analysis.score))
        ? Math.max(1, Math.min(100, Number(analysis.score)))
        : 60,
      strengths: Array.isArray(analysis.strengths) && analysis.strengths.length
        ? analysis.strengths.map(String)
        : ['Participated actively in the mock interview session'],
      weaknesses: Array.isArray(analysis.weaknesses) && analysis.weaknesses.length
        ? analysis.weaknesses.map(String)
        : ['Some answers lacked depth and structure'],
      technicalGaps: Array.isArray(analysis.technicalGaps) && analysis.technicalGaps.length
        ? analysis.technicalGaps.map(String)
        : ['Needs stronger fundamentals for role-specific concepts'],
      overallAnalysis: String(analysis.overallAnalysis || '').trim() ||
        'You completed the mock interview session. Keep practicing to improve technical depth and communication clarity.'
    };

    application.genAiFeedback.score = normalizedAnalysis.score;
    application.genAiFeedback.strengths = normalizedAnalysis.strengths;
    application.genAiFeedback.weaknesses = normalizedAnalysis.weaknesses;
    application.genAiFeedback.technicalGaps = normalizedAnalysis.technicalGaps;
    application.genAiFeedback.overallAnalysis = normalizedAnalysis.overallAnalysis;
    application.status = 'AI_Completed';
    application.currentRound = 'TMR_Mock'; // Move to TMR Mock round
    application.updatedAt = Date.now();

    await application.save();

    res.status(200).json({ success: true, message: 'Evaluation generated', data: application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to generate evaluation' });
  }
};

// --- ORG ADMIN / STAFF ACTIONS ---

export const updateTmrMockFeedback = async (req, res) => {
  try {
    const { applicationId, communication, technical, notes } = req.body;
    const userId = req.headers['user-id'];

    console.log(`[TMR Feedback] incoming from user-id: ${userId} for application: ${applicationId}`);

    const application = await MockApplication.findById(applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.tmrFeedback = {
      communication,
      technical,
      notes,
      evaluatedBy: userId,
      evaluatedAt: Date.now()
    };
    application.status = 'Finalized';
    application.currentRound = 'Completed';
    application.updatedAt = Date.now();

    await application.save();

    console.log(`[TMR Feedback] saved for application ${applicationId} by ${userId}:`, application.tmrFeedback);

    res.status(200).json({ success: true, message: 'TMR Mock feedback saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- STUDENT UTILS ---

export const getStudentMockStats = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const stats = await checkDailyLimit(user);
    
    // Average competency from previous applications (include AI_Completed until TMR finalization)
    const apps = await MockApplication.find({ userId, status: { $in: ['Finalized', 'AI_Completed'] } });
    const avgScore = apps.length > 0 
      ? Math.round(apps.reduce((acc, app) => acc + (app.genAiFeedback?.score || 0), 0) / apps.length)
      : 0;

    res.status(200).json({ 
      success: true, 
      attemptsToday: user.mockAttempts?.count || 0,
      limit: (user.type === 'free' ? 2 : 10), // Matching checkDailyLimit logic
      avgCompetency: avgScore
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignedDrives = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Students only see assigned drives if they are "Placement Ready" or if the drive is public to their org
    if (user.role === 'student' && !user.studentDetails?.isPlacementReady) {
      return res.status(200).json({ success: true, data: [], message: 'Not yet placement ready' });
    }

    const drives = await MockInterviewDrive.find({ 
      organizationId: user.organizationId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMockApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await MockApplication.findById(id).populate('driveId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrganizationApplications = async (req, res) => {
  try {
    const orgId = req.headers['user-id'];
    let applications = await MockApplication.find({ organizationId: orgId })
      .populate('userId', 'mName name email')
      .populate('driveId', 'title targetRole')
      .sort({ updatedAt: -1 });

    if (applications.length === 0) {
      // Fallback: check if the user is a staff/dept_admin or Org Admin and find apps for their org
      const user = await User.findById(orgId) || await Organization.findById(orgId);
      if (user) {
        const targetOrgId = user.organizationId || user.organization || user._id;
        const orgApps = await MockApplication.find({ organizationId: targetOrgId })
          .populate('userId', 'mName name email')
          .populate('driveId', 'title targetRole')
          .sort({ updatedAt: -1 });
        return res.status(200).json({ success: true, data: orgApps });
      }
    }

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const applications = await MockApplication.find({ userId })
      .populate('driveId', 'title targetRole')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
