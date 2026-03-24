import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Course from '../models/Course.js';
import OrgCourse from '../models/OrgCourse.js';
import User from '../models/User.js';
import Lang from '../models/Lang.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import QuizRetakeRequest from '../models/QuizRetakeRequest.js';
import { sendMail } from '../services/mail.service.js';
import { createNotification } from './notification.controller.js';

const CERTIFICATE_PASS_PERCENTAGE = 70;

const DEFAULT_QUIZ_SETTINGS = {
  examMode: true,
  attemptLimit: 2,
  cooldownMinutes: 60,
  passPercentage: 50,
  questionCount: 10,
  difficultyMode: 'mixed',
  shuffleQuestions: true,
  shuffleOptions: true,
  proctoring: {
    requireCamera: true,
    requireMicrophone: true,
    detectFullscreenExit: true,
    detectTabSwitch: true,
    detectCopyPaste: true,
    detectContextMenu: true,
    detectNoise: true
  }
};

const mergeQuizSettings = (settings = {}) => ({
  ...DEFAULT_QUIZ_SETTINGS,
  ...settings,
  proctoring: {
    ...DEFAULT_QUIZ_SETTINGS.proctoring,
    ...(settings?.proctoring || {})
  }
});

const shuffleArray = (items = []) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const normalizeUserId = async (providedUserId, fallbackCourse = null) => {
  let userId = providedUserId || (fallbackCourse ? fallbackCourse.user : null);
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    const userObj = await User.findOne({ email: userId });
    if (userObj) userId = userObj._id;
  }
  return userId ? String(userId) : null;
};

const assertUserOrgAccess = async ({ userId, organizationId, allowedRoles = [] }) => {
  if (!userId || !organizationId) {
    return { ok: false, status: 400, message: 'Missing userId or organizationId' };
  }

  const user = await User.findById(userId).select('_id role organization isBlocked');
  if (!user) return { ok: false, status: 404, message: 'User not found' };
  if (user.isBlocked) return { ok: false, status: 403, message: 'User is blocked' };

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return { ok: false, status: 403, message: 'Access denied' };
  }

  if (!user.organization || String(user.organization) !== String(organizationId)) {
    return { ok: false, status: 403, message: 'User does not belong to this organization' };
  }

  return { ok: true, user };
};

const buildOrgQuizSummary = (attempts, settings) => {
  const orderedAttempts = [...attempts].sort((a, b) => new Date(b.startedAt || b.date) - new Date(a.startedAt || a.date));
  const latestAttempt = orderedAttempts[0] || null;
  const passed = orderedAttempts.some((attempt) => attempt.passed);
  const attemptLimit = settings.attemptLimit || DEFAULT_QUIZ_SETTINGS.attemptLimit;
  const attemptCount = orderedAttempts.length;
  const remainingAttempts = Math.max(attemptLimit - attemptCount, 0);
  const nextAttemptAvailableAt = latestAttempt?.nextAttemptAvailableAt || null;
  const maxAttemptsReached = attemptCount >= attemptLimit;

  return {
    passed,
    attemptCount,
    attemptLimit,
    remainingAttempts,
    nextAttemptAvailableAt,
    latestAttempt: latestAttempt
      ? {
          id: latestAttempt._id,
          percentage: latestAttempt.percentage || 0,
          score: latestAttempt.score || 0,
          totalQuestions: latestAttempt.totalQuestions || 0,
          passed: latestAttempt.passed,
          malpracticeFlag: !!latestAttempt.malpracticeFlag,
          status: latestAttempt.status,
          attemptNumber: latestAttempt.attemptNumber || 1,
          submittedAt: latestAttempt.submittedAt,
          startedAt: latestAttempt.startedAt || latestAttempt.date
        }
      : null,
    maxAttemptsReached
  };
};

const pickQuestionsFromBank = (quizBank, settings) => {
  const normalizedQuestions = Array.isArray(quizBank)
    ? quizBank
        .filter((question) => question?.question && Array.isArray(question?.options) && question.options.length >= 2)
        .map((question, index) => ({
          sourceId: String(index + 1),
          question: question.question,
          explanation: question.explanation || '',
          difficulty: question.difficulty || 'medium',
          options: question.options.map((option, optionIndex) => ({
            id: String.fromCharCode(97 + optionIndex),
            text: option
          })),
          answer: question.answer
        }))
    : [];

  let pool = normalizedQuestions;
  if (settings.difficultyMode && settings.difficultyMode !== 'mixed') {
    const filtered = normalizedQuestions.filter((question) => question.difficulty === settings.difficultyMode);
    pool = filtered.length > 0 ? filtered : normalizedQuestions;
  }

  const orderedPool = settings.shuffleQuestions ? shuffleArray(pool) : pool;
  const targetCount = Math.min(settings.questionCount || orderedPool.length, orderedPool.length);
  const selected = orderedPool.slice(0, targetCount).map((question, index) => {
    const options = settings.shuffleOptions ? shuffleArray(question.options) : question.options;
    const rawAnswer = String(question.answer || '').trim().toLowerCase();
    const correctOption =
      options.find((option) => option.id === rawAnswer) ||
      options.find((option) => option.text.trim().toLowerCase() === rawAnswer) ||
      options.find((option) => rawAnswer.includes(option.text.trim().toLowerCase())) ||
      options[0];

    return {
      id: `q${index + 1}`,
      question: question.question,
      explanation: question.explanation,
      difficulty: question.difficulty,
      options,
      correctAnswer: correctOption?.id || options[0]?.id || 'a'
    };
  });

  return selected;
};

const sanitizeAttemptQuestions = (questions = []) =>
  questions.map((question) => ({
    id: question.id,
    question: question.question,
    difficulty: question.difficulty,
    options: question.options
  }));

const notifyOrgAdminsOfMalpractice = async (attempt, details) => {
  if (!attempt?.organizationId) return;

  const orgAdmins = await User.find({
    organization: attempt.organizationId,
    role: 'org_admin'
  }).select('_id');

  await Promise.all(
    orgAdmins.map((admin) =>
      createNotification({
        user: admin._id,
        type: 'warning',
        message: `Malpractice flagged for quiz attempt in ${attempt.topic || 'course quiz'}: ${details}`,
        link: '/dashboard/org?tab=courses'
      })
    )
  );
};

const buildLegacyQuizSummary = ({ attempts = [], latestRequest = null, certificateId = null }) => {
  const orderedAttempts = [...attempts].sort(
    (a, b) => new Date(b.submittedAt || b.date || b.startedAt) - new Date(a.submittedAt || a.date || a.startedAt)
  );
  const latestAttempt = orderedAttempts[0] || null;
  const passedAttempt = orderedAttempts.find((attempt) => attempt.passed);
  const requestStatus = latestRequest?.status || 'none';
  const approvedRetake = requestStatus === 'approved';
  const canStart = !passedAttempt && (orderedAttempts.length === 0 || approvedRetake);

  return {
    passed: !!passedAttempt,
    certificateIssued: !!certificateId,
    certificateId,
    certificateThreshold: CERTIFICATE_PASS_PERCENTAGE,
    attemptCount: orderedAttempts.length,
    latestAttempt: latestAttempt
      ? {
          id: latestAttempt._id,
          score: latestAttempt.score || 0,
          totalQuestions: latestAttempt.totalQuestions || 0,
          percentage: latestAttempt.percentage || 0,
          passed: !!latestAttempt.passed,
          submittedAt: latestAttempt.submittedAt || latestAttempt.date || latestAttempt.startedAt
        }
      : null,
    retakeRequest: latestRequest
      ? {
          id: latestRequest._id,
          status: latestRequest.status,
          requestReason: latestRequest.requestReason || '',
          adminComment: latestRequest.adminComment || '',
          reviewedAt: latestRequest.reviewedAt || null,
          createdAt: latestRequest.createdAt || null
        }
      : null,
    canStart,
    canRequestRetake:
      !passedAttempt &&
      orderedAttempts.length > 0 &&
      !['pending', 'approved'].includes(requestStatus),
    retakeApproved: approvedRetake,
    needsAdminApproval:
      !passedAttempt &&
      orderedAttempts.length > 0 &&
      !approvedRetake
  };
};

const notifyPlatformAdminsOfRetakeRequest = async (requestDoc, courseTitle, studentName) => {
  const admins = await User.find({ role: 'admin' }).select('_id');

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        user: admin._id,
        type: 'info',
        message: `Retake request submitted for ${courseTitle || 'course quiz'} by ${studentName || 'a student'}.`,
        link: '/admin/quiz-retake-requests'
      })
    )
  );
};

/**
 * UPDATE RESULT & ISSUE CERTIFICATE
 */
export const updateResult = async (req, res) => {
  const {
    courseId,
    marksString,
    userId: providedUserId,
    score = 0,
    totalQuestions = 0,
    percentage: providedPercentage
  } = req.body;

  try {
    const course = await Course.findById(courseId);
    const userId = await normalizeUserId(providedUserId, course);
    const normalizedMarks = Number(marksString || 0);
    const normalizedTotalQuestions = Number(totalQuestions || 0);
    const normalizedScore = Number(score || 0);
    const normalizedPercentage = Number.isFinite(Number(providedPercentage))
      ? Number(providedPercentage)
      : normalizedMarks;
    const passed = normalizedPercentage >= CERTIFICATE_PASS_PERCENTAGE;

    const newExam = new Exam({
      course: courseId,
      userId: userId,
      marks: String(normalizedMarks),
      examType: 'legacy',
      passed,
      score: normalizedScore,
      totalQuestions: normalizedTotalQuestions,
      percentage: normalizedPercentage,
      passPercentage: CERTIFICATE_PASS_PERCENTAGE,
      submittedAt: new Date()
    });
    await newExam.save();

    // Only update course as completed if it's the creator taking it and the quiz is passed
    if (passed && course && String(course.user) === String(userId)) {
      await Course.findOneAndUpdate(
        { _id: courseId },
        { $set: { completed: true, end: Date.now() } }
      );
    }

    let studentName = 'Student';
    const userObj = await User.findById(userId);
    if (userObj) {
      studentName = userObj.mName;
    }

    let issuedCert = await IssuedCertificate.findOne({
      user: userId,
      course: courseId
    });

    if (passed && !issuedCert) {
      const certificateId =
        'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      issuedCert = new IssuedCertificate({
        certificateId,
        user: userId,
        course: courseId,
        studentName,
        courseName: course ? course.mainTopic : 'Course'
      });

      await issuedCert.save();
    }

    const approvedRetakeRequest = await QuizRetakeRequest.findOne({
      course: courseId,
      userId,
      status: 'approved'
    }).sort({ reviewedAt: -1, createdAt: -1 });

    if (approvedRetakeRequest) {
      approvedRetakeRequest.status = 'consumed';
      approvedRetakeRequest.consumedAt = new Date();
      await approvedRetakeRequest.save();
    }

    const attempts = await Exam.find({
      course: courseId,
      userId,
      examType: 'legacy'
    }).sort({ submittedAt: -1, date: -1 });
    const latestRetakeRequest = await QuizRetakeRequest.findOne({
      course: courseId,
      userId
    }).sort({ createdAt: -1 });
    const legacySummary = buildLegacyQuizSummary({
      attempts,
      latestRequest: latestRetakeRequest,
      certificateId: issuedCert?.certificateId || null
    });

    res.json({
      success: true,
      message: passed
        ? 'Quiz passed and certificate issued'
        : 'Quiz submitted. Retake approval is required for another attempt.',
      passed,
      certificateId: issuedCert?.certificateId || null,
      certificateIssued: !!issuedCert,
      certificateThreshold: CERTIFICATE_PASS_PERCENTAGE,
      quizStatus: legacySummary
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * BATCH: GET QUIZ RESULTS FOR MULTIPLE COURSES AT ONCE
 * Replaces N individual /api/getmyresult calls with a single query.
 */
export const getMyResultsBatch = async (req, res) => {
  const { courseIds, userId: providedUserId } = req.body;

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return res.json({ success: true, results: [] });
  }

  try {
    const userId = await normalizeUserId(providedUserId);
    const exams = await Exam.find({
      course: { $in: courseIds },
      ...(userId ? { userId } : {})
    }).sort({ startedAt: -1, date: -1 });

    const orgCourses = await OrgCourse.find({ _id: { $in: courseIds } }).select('_id quizSettings');
    const settingsMap = new Map(
      orgCourses.map((course) => [String(course._id), mergeQuizSettings(course.quizSettings || {})])
    );

    const grouped = exams.reduce((acc, exam) => {
      const key = String(exam.course);
      if (!acc[key]) acc[key] = [];
      acc[key].push(exam);
      return acc;
    }, {});

    const results = courseIds.map((courseId) => {
      const attempts = grouped[String(courseId)] || [];
      const settings = settingsMap.get(String(courseId)) || DEFAULT_QUIZ_SETTINGS;
      const summary = buildOrgQuizSummary(attempts, settings);

      return {
        courseId,
        passed: summary.passed,
        attemptCount: summary.attemptCount,
        attemptLimit: summary.attemptLimit,
        remainingAttempts: summary.remainingAttempts,
        nextAttemptAvailableAt: summary.nextAttemptAvailableAt,
        latestAttempt: summary.latestAttempt,
        maxAttemptsReached: summary.maxAttemptsReached
      };
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error('getMyResultsBatch error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET MY RESULT
 */
export const getMyResult = async (req, res) => {
  const { courseId, userId: providedUserId } = req.body;

  try {
    const course = await Course.findById(courseId);
    const userId = await normalizeUserId(providedUserId, course);

    const orgCourse = await OrgCourse.findById(courseId).select('quizSettings');
    const quizSettings = mergeQuizSettings(orgCourse?.quizSettings || {});
    const attempts = userId
      ? await Exam.find({ course: courseId, userId }).sort({ startedAt: -1, date: -1 })
      : [];
    const orgSummary = buildOrgQuizSummary(attempts, quizSettings);

    let exam = await Exam.findOne({
      course: courseId,
      userId: userId,
      passed: true
    });

    // Fallback for legacy exams (without userId) if the user is the course creator
    if (!exam && userId && course && String(course.user) === String(userId)) {
      exam = await Exam.findOne({
        course: courseId,
        userId: { $exists: false },
        passed: true
      });
    }

    const langObj = await Lang.findOne({ course: courseId });
    const language = langObj ? langObj.lang : 'English';

    if (!exam) {
      return res.json({
        success: true,
        message: false,
        lang: language,
        attemptCount: orgSummary.attemptCount,
        attemptLimit: orgSummary.attemptLimit,
        remainingAttempts: orgSummary.remainingAttempts,
        nextAttemptAvailableAt: orgSummary.nextAttemptAvailableAt,
        latestAttempt: orgSummary.latestAttempt,
        maxAttemptsReached: orgSummary.maxAttemptsReached
      });
    }

    let certificateId = null;
    if (userId) {
      const cert = await IssuedCertificate.findOne({
        course: courseId,
        user: userId
      });
      if (cert) certificateId = cert.certificateId;
    }

    res.json({
      success: true,
      message: true,
      lang: language,
      certificateId,
      attemptCount: orgSummary.attemptCount,
      attemptLimit: orgSummary.attemptLimit,
      remainingAttempts: orgSummary.remainingAttempts,
      nextAttemptAvailableAt: orgSummary.nextAttemptAvailableAt,
      latestAttempt: orgSummary.latestAttempt,
      maxAttemptsReached: orgSummary.maxAttemptsReached
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
/**
 * SIMPLE: GET RESULT (OLD LOGIC)
 */
export const getMyResultSimple = async (req, res) => {
  const { courseId } = req.body;

  try {
    const existingExam = await Exam.findOne({ course: courseId });
    const langObj = await Lang.findOne({ course: courseId });

    const language = langObj ? langObj.lang : 'English';

    if (existingExam) {
      return res.json({
        success: true,
        message: existingExam.passed,
        lang: language
      });
    }

    return res.json({
      success: false,
      message: false,
      lang: language
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * SIMPLE: UPDATE RESULT (OLD LOGIC)
 */
export const updateResultSimple = async (req, res) => {
  const { courseId, marksString } = req.body;

  try {
    const passed = Number(marksString || 0) >= CERTIFICATE_PASS_PERCENTAGE;
    await Exam.findOneAndUpdate(
      { course: courseId },
      { $set: { marks: marksString, passed, passPercentage: CERTIFICATE_PASS_PERCENTAGE } },
      { upsert: true }
    );

    res.json({ success: true, passed, certificateThreshold: CERTIFICATE_PASS_PERCENTAGE });
  } catch (error) {
    console.log('Error', error);
    res.status(500).send('Internal Server Error');
  }
};

export const getLegacyQuizRetakeStatus = async (req, res) => {
  const { courseId, userId: providedUserId } = req.body;

  try {
    const course = await Course.findById(courseId).select('_id mainTopic');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userId = await normalizeUserId(providedUserId, course);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const attempts = await Exam.find({
      course: courseId,
      userId,
      examType: 'legacy'
    }).sort({ submittedAt: -1, date: -1 });
    const latestRequest = await QuizRetakeRequest.findOne({
      course: courseId,
      userId
    }).sort({ createdAt: -1 });
    const certificate = await IssuedCertificate.findOne({
      course: courseId,
      user: userId
    }).select('certificateId');

    return res.json({
      success: true,
      topic: course.mainTopic,
      ...buildLegacyQuizSummary({
        attempts,
        latestRequest,
        certificateId: certificate?.certificateId || null
      })
    });
  } catch (error) {
    console.error('getLegacyQuizRetakeStatus error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createLegacyQuizRetakeRequest = async (req, res) => {
  const { courseId, userId: providedUserId, requestReason = '' } = req.body;

  try {
    const course = await Course.findById(courseId).select('_id mainTopic');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const userId = await normalizeUserId(providedUserId, course);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const attempts = await Exam.find({
      course: courseId,
      userId,
      examType: 'legacy'
    }).sort({ submittedAt: -1, date: -1 });

    if (attempts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Retake request can be created only after the first quiz attempt.'
      });
    }

    if (attempts.some((attempt) => attempt.passed)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz already passed. Retake request is not allowed.'
      });
    }

    const latestRequest = await QuizRetakeRequest.findOne({
      course: courseId,
      userId
    }).sort({ createdAt: -1 });

    if (latestRequest && ['pending', 'approved'].includes(latestRequest.status)) {
      return res.status(409).json({
        success: false,
        message:
          latestRequest.status === 'pending'
            ? 'A retake request is already pending admin approval.'
            : 'Your retake request is already approved. You can proceed with the quiz.',
        retakeRequest: latestRequest
      });
    }

    const latestAttempt = attempts[0];
    const requestDoc = await QuizRetakeRequest.create({
      course: courseId,
      userId,
      requestReason: String(requestReason || '').trim(),
      latestScore: latestAttempt?.score || 0,
      latestPercentage: latestAttempt?.percentage || 0
    });

    const student = await User.findById(userId).select('mName');
    await notifyPlatformAdminsOfRetakeRequest(requestDoc, course.mainTopic, student?.mName || 'Student');

    return res.json({
      success: true,
      message: 'Retake request sent to admin for approval.',
      retakeRequest: {
        id: requestDoc._id,
        status: requestDoc.status,
        requestReason: requestDoc.requestReason,
        createdAt: requestDoc.createdAt
      }
    });
  } catch (error) {
    console.error('createLegacyQuizRetakeRequest error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getLegacyQuizRetakeRequests = async (req, res) => {
  try {
    const requests = await QuizRetakeRequest.find()
      .sort({ createdAt: -1 })
      .lean();

    const userIds = [...new Set(requests.map((request) => request.userId).filter(Boolean))];
    const courseIds = [...new Set(requests.map((request) => request.course).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('_id mName email').lean();
    const courses = await Course.find({ _id: { $in: courseIds } }).select('_id mainTopic').lean();
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const courseMap = new Map(courses.map((course) => [String(course._id), course]));

    return res.json({
      success: true,
      requests: requests.map((request) => ({
        ...request,
        studentName: userMap.get(String(request.userId))?.mName || 'Student',
        studentEmail: userMap.get(String(request.userId))?.email || '',
        courseTitle: courseMap.get(String(request.course))?.mainTopic || 'Course'
      }))
    });
  } catch (error) {
    console.error('getLegacyQuizRetakeRequests error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const reviewLegacyQuizRetakeRequest = async (req, res) => {
  const { requestId, status, adminComment = '', reviewerId = '' } = req.body;

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid request status' });
    }

    const requestDoc = await QuizRetakeRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({ success: false, message: 'Retake request not found' });
    }

    requestDoc.status = status;
    requestDoc.adminComment = String(adminComment || '').trim();
    requestDoc.reviewedBy = String(reviewerId || '').trim();
    requestDoc.reviewedAt = new Date();
    if (status === 'approved') {
      requestDoc.consumedAt = null;
    }
    await requestDoc.save();

    const course = await Course.findById(requestDoc.course).select('mainTopic');
    await createNotification({
      user: requestDoc.userId,
      type: status === 'approved' ? 'success' : 'warning',
      message:
        status === 'approved'
          ? `Your retake request for ${course?.mainTopic || 'the quiz'} has been approved.`
          : `Your retake request for ${course?.mainTopic || 'the quiz'} was rejected.`,
      link: `/course/${requestDoc.course}/quiz`
    });

    return res.json({
      success: true,
      message: `Retake request ${status} successfully.`,
      request: requestDoc
    });
  } catch (error) {
    console.error('reviewLegacyQuizRetakeRequest error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOrgQuizStatus = async (req, res) => {
  const { courseId, userId: providedUserId } = req.body;

  try {
    const orgCourse = await OrgCourse.findById(courseId).select('title quizSettings quizzes organizationId');
    if (!orgCourse) {
      return res.status(404).json({ success: false, message: 'Organization quiz not found' });
    }

    const userId = await normalizeUserId(providedUserId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const access = await assertUserOrgAccess({
      userId,
      organizationId: orgCourse.organizationId,
      allowedRoles: ['student', 'org_admin', 'dept_admin']
    });
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const settings = mergeQuizSettings(orgCourse.quizSettings || {});
    const attempts = userId
      ? await Exam.find({ course: String(courseId), userId, examType: 'org_exam' }).sort({ startedAt: -1, date: -1 })
      : [];
    const summary = buildOrgQuizSummary(attempts, settings);
    const latestAttempt = attempts[0] || null;

    res.json({
      success: true,
      topic: orgCourse.title,
      quizAvailable: Array.isArray(orgCourse.quizzes) && orgCourse.quizzes.length > 0,
      quizSettings: settings,
      ...summary,
      resumeAttemptId: latestAttempt?.status === 'in_progress' ? latestAttempt._id : null
    });
  } catch (error) {
    console.error('getOrgQuizStatus error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const startOrgQuizAttempt = async (req, res) => {
  const { courseId, userId: providedUserId } = req.body;

  try {
    const orgCourse = await OrgCourse.findById(courseId);
    if (!orgCourse) {
      return res.status(404).json({ success: false, message: 'Organization quiz not found' });
    }

    const userId = await normalizeUserId(providedUserId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const access = await assertUserOrgAccess({
      userId,
      organizationId: orgCourse.organizationId,
      allowedRoles: ['student', 'org_admin', 'dept_admin']
    });
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const settings = mergeQuizSettings(orgCourse.quizSettings || {});
    const attempts = await Exam.find({
      course: String(courseId),
      userId,
      examType: 'org_exam'
    }).sort({ startedAt: -1, date: -1 });

    const passedAttempt = attempts.find((attempt) => attempt.passed);
    if (passedAttempt) {
      return res.status(403).json({
        success: false,
        message: 'Quiz already passed. Further attempts are locked.',
        code: 'QUIZ_ALREADY_PASSED',
        summary: buildOrgQuizSummary(attempts, settings)
      });
    }

    const activeAttempt = attempts.find((attempt) => attempt.status === 'in_progress');
    if (activeAttempt) {
      const storedQuestions = JSON.parse(activeAttempt.exam || '[]');
      return res.json({
        success: true,
        resumed: true,
        attemptId: activeAttempt._id,
        attemptNumber: activeAttempt.attemptNumber || 1,
        quizSettings: settings,
        questions: sanitizeAttemptQuestions(storedQuestions),
        summary: buildOrgQuizSummary(attempts, settings)
      });
    }

    if (attempts.length >= settings.attemptLimit) {
      return res.status(403).json({
        success: false,
        message: 'Maximum quiz attempts reached.',
        code: 'MAX_ATTEMPTS_REACHED',
        summary: buildOrgQuizSummary(attempts, settings)
      });
    }

    const latestAttempt = attempts[0];
    if (latestAttempt?.nextAttemptAvailableAt && new Date(latestAttempt.nextAttemptAvailableAt) > new Date()) {
      return res.status(429).json({
        success: false,
        message: 'Next attempt is locked until the cooldown ends.',
        code: 'COOLDOWN_ACTIVE',
        summary: buildOrgQuizSummary(attempts, settings)
      });
    }

    const selectedQuestions = pickQuestionsFromBank(orgCourse.quizzes || [], settings);
    if (selectedQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'No quiz questions available for this course' });
    }

    const attemptNumber = attempts.length + 1;
    const attempt = await Exam.create({
      course: String(courseId),
      userId,
      examType: 'org_exam',
      organizationId: String(orgCourse.organizationId || ''),
      topic: orgCourse.title,
      attemptNumber,
      status: 'in_progress',
      startedAt: new Date(),
      totalQuestions: selectedQuestions.length,
      passPercentage: settings.passPercentage,
      difficultyMode: settings.difficultyMode,
      questionOrder: selectedQuestions.map((question) => question.id),
      exam: JSON.stringify(selectedQuestions)
    });

    const updatedAttempts = [attempt, ...attempts];

    res.json({
      success: true,
      resumed: false,
      attemptId: attempt._id,
      attemptNumber,
      quizSettings: settings,
      questions: sanitizeAttemptQuestions(selectedQuestions),
      summary: buildOrgQuizSummary(updatedAttempts, settings)
    });
  } catch (error) {
    console.error('startOrgQuizAttempt error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const logOrgQuizSecurityEvent = async (req, res) => {
  const { attemptId, userId: providedUserId, eventType, severity = 'low', details = '' } = req.body;

  try {
    const userId = await normalizeUserId(providedUserId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const attempt = await Exam.findOne({
      _id: attemptId,
      userId,
      examType: 'org_exam'
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const access = await assertUserOrgAccess({
      userId,
      organizationId: attempt.organizationId,
      allowedRoles: ['student', 'org_admin', 'dept_admin']
    });
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (attempt.status !== 'in_progress') {
      return res.json({ success: true, message: 'Attempt already closed' });
    }

    attempt.securityEvents.push({
      type: eventType || 'info',
      severity,
      details
    });

    if (severity === 'medium' || severity === 'high') {
      attempt.malpracticeFlag = true;
    }

    if ((severity === 'high' || eventType === 'camera_denied' || eventType === 'microphone_denied') && !attempt.adminNotified) {
      await notifyOrgAdminsOfMalpractice(attempt, details || eventType);
      attempt.adminNotified = true;
    }

    await attempt.save();

    res.json({ success: true });
  } catch (error) {
    console.error('logOrgQuizSecurityEvent error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const abandonOrgQuizAttempt = async (req, res) => {
  const { attemptId, userId: providedUserId, reason = 'page_exit' } = req.body;

  try {
    const userId = await normalizeUserId(providedUserId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    const attempt = await Exam.findOne({
      _id: attemptId,
      userId,
      examType: 'org_exam'
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const access = await assertUserOrgAccess({
      userId,
      organizationId: attempt.organizationId,
      allowedRoles: ['student', 'org_admin', 'dept_admin']
    });
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (attempt.status !== 'in_progress') {
      return res.json({ success: true, message: 'Attempt already closed' });
    }

    const orgCourse = await OrgCourse.findById(attempt.course).select('quizSettings');
    const settings = mergeQuizSettings(orgCourse?.quizSettings || {});

    attempt.status = 'abandoned';
    attempt.submittedAt = new Date();
    attempt.score = 0;
    attempt.percentage = 0;
    attempt.passed = false;
    attempt.marks = '0';
    attempt.securityEvents.push({
      type: 'attempt_abandoned',
      severity: 'medium',
      details: `Attempt closed before submit: ${reason}`
    });
    attempt.malpracticeFlag = true;

    if (attempt.attemptNumber < settings.attemptLimit) {
      attempt.nextAttemptAvailableAt = new Date(Date.now() + settings.cooldownMinutes * 60 * 1000);
    } else {
      attempt.nextAttemptAvailableAt = null;
    }

    if (!attempt.adminNotified) {
      await notifyOrgAdminsOfMalpractice(attempt, `Attempt abandoned (${reason})`);
      attempt.adminNotified = true;
    }

    await attempt.save();

    return res.json({ success: true });
  } catch (error) {
    console.error('abandonOrgQuizAttempt error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const submitOrgQuizAttempt = async (req, res) => {
  const { attemptId, userId: providedUserId, answers = {}, clientSummary = {} } = req.body;

  try {
    const userId = await normalizeUserId(providedUserId);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }
    const attempt = await Exam.findOne({
      _id: attemptId,
      userId,
      examType: 'org_exam'
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    const access = await assertUserOrgAccess({
      userId,
      organizationId: attempt.organizationId,
      allowedRoles: ['student', 'org_admin', 'dept_admin']
    });
    if (!access.ok) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Attempt already submitted' });
    }

    const orgCourse = await OrgCourse.findById(attempt.course).select('quizSettings title organizationId');
    const settings = mergeQuizSettings(orgCourse?.quizSettings || {});
    const storedQuestions = JSON.parse(attempt.exam || '[]');
    const evaluatedAnswers = storedQuestions.map((question) => {
      const selectedOptionId = answers[question.id] || '';
      const correctOptionId = question.correctAnswer;
      return {
        questionId: question.id,
        selectedOptionId,
        correctOptionId,
        isCorrect: String(selectedOptionId) === String(correctOptionId)
      };
    });

    const score = evaluatedAnswers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = storedQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = percentage >= settings.passPercentage;

    attempt.answers = evaluatedAnswers;
    attempt.score = score;
    attempt.totalQuestions = totalQuestions;
    attempt.percentage = percentage;
    attempt.marks = String(percentage);
    attempt.passPercentage = settings.passPercentage;
    attempt.passed = passed;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.difficultyMode = settings.difficultyMode;

    if (!passed && attempt.attemptNumber < settings.attemptLimit) {
      attempt.nextAttemptAvailableAt = new Date(Date.now() + settings.cooldownMinutes * 60 * 1000);
    } else {
      attempt.nextAttemptAvailableAt = null;
    }

    if (clientSummary?.noiseWarnings > 0 || clientSummary?.tabWarnings > 0) {
      attempt.malpracticeFlag = attempt.malpracticeFlag || clientSummary.noiseWarnings > 0 || clientSummary.tabWarnings > 0;
    }

    if (attempt.malpracticeFlag && !attempt.adminNotified) {
      await notifyOrgAdminsOfMalpractice(attempt, 'Attempt submitted with malpractice indicators');
      attempt.adminNotified = true;
    }

    await attempt.save();

    const allAttempts = await Exam.find({
      course: String(attempt.course),
      userId,
      examType: 'org_exam'
    }).sort({ startedAt: -1, date: -1 });

    res.json({
      success: true,
      result: {
        passed,
        score,
        totalQuestions,
        percentage,
        attemptNumber: attempt.attemptNumber,
        nextAttemptAvailableAt: attempt.nextAttemptAvailableAt,
        malpracticeFlag: attempt.malpracticeFlag,
        answers: evaluatedAnswers
      },
      summary: buildOrgQuizSummary(allAttempts, settings)
    });
  } catch (error) {
    console.error('submitOrgQuizAttempt error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOrgQuizReports = async (req, res) => {
  const { organizationId, requesterId } = req.query;

  try {
    if (!organizationId) {
      return res.status(400).json({ success: false, message: 'organizationId is required' });
    }

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'requesterId is required' });
    }

    const requester = await User.findById(requesterId).select('_id role organization isBlocked');
    if (!requester) {
      return res.status(404).json({ success: false, message: 'Requester not found' });
    }
    if (requester.isBlocked) {
      return res.status(403).json({ success: false, message: 'Requester is blocked' });
    }
    if (!['org_admin', 'dept_admin'].includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!requester.organization || String(requester.organization) !== String(organizationId)) {
      return res.status(403).json({ success: false, message: 'Requester does not belong to this organization' });
    }

    const orgCourses = await OrgCourse.find({ organizationId }).select('_id title quizSettings quizzes');
    const courseMap = new Map(orgCourses.map((course) => [String(course._id), course]));
    const courseIds = orgCourses.map((course) => String(course._id));

    const attempts = await Exam.find({
      examType: 'org_exam',
      course: { $in: courseIds }
    }).sort({ submittedAt: -1, startedAt: -1 });

    const userIds = [...new Set(attempts.map((attempt) => attempt.userId).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('_id mName email');
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    const grouped = attempts.reduce((acc, attempt) => {
      const key = String(attempt.course);
      if (!acc[key]) acc[key] = [];
      acc[key].push(attempt);
      return acc;
    }, {});

    const reports = courseIds.map((courseId) => {
      const course = courseMap.get(courseId);
      const courseAttempts = grouped[courseId] || [];
      const flaggedCount = courseAttempts.filter((attempt) => attempt.malpracticeFlag).length;
      const passedCount = courseAttempts.filter((attempt) => attempt.passed).length;

      return {
        courseId,
        title: course?.title || 'Course',
        questionCount: course?.quizzes?.length || 0,
        quizSettings: mergeQuizSettings(course?.quizSettings || {}),
        attemptCount: courseAttempts.length,
        passedCount,
        flaggedCount,
        attempts: courseAttempts.map((attempt) => {
          const user = userMap.get(String(attempt.userId));
          const securityEvents = Array.isArray(attempt.securityEvents) ? attempt.securityEvents : [];
          const eventSummary = securityEvents.reduce((acc, event) => {
            const key = event.type || 'info';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          return {
            attemptId: attempt._id,
            studentId: attempt.userId,
            studentName: user?.mName || 'Student',
            studentEmail: user?.email || '',
            attemptNumber: attempt.attemptNumber || 1,
            percentage: attempt.percentage || 0,
            score: attempt.score || 0,
            totalQuestions: attempt.totalQuestions || 0,
            passed: attempt.passed,
            malpracticeFlag: !!attempt.malpracticeFlag,
            securityEventCount: securityEvents.length,
            eventSummary,
            securityEvents: securityEvents.map((event) => ({
              type: event.type || 'info',
              severity: event.severity || 'low',
              details: event.details || '',
              timestamp: event.timestamp
            })),
            nextAttemptAvailableAt: attempt.nextAttemptAvailableAt,
            submittedAt: attempt.submittedAt,
            startedAt: attempt.startedAt || attempt.date
          };
        })
      };
    });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('getOrgQuizReports error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
/**
 * SEND EXAM EMAIL
 */
export const sendExamMail = async (req, res) => {
  const { html, email, subjects } = req.body;

  if (!html || !email || !subjects) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    await sendMail({
      to: email,
      subject: subjects,
      html
    });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.log('Error sending exam mail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};
