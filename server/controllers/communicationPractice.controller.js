import CommunicationPractice from '../models/CommunicationPractice.js';
import User from '../models/User.js';
import { getGenAI } from '../config/gemini.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import mongoose from 'mongoose';

const XP_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2500];

const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const recalculateLevel = (xp) => {
  let level = 1;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) { level = i + 1; break; }
  }
  return Math.min(level, 10);
};

const updateStreak = (profile) => {
  const todayStr = getTodayDateString();
  if (profile.lastActiveDate === todayStr) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (profile.lastActiveDate === yesterdayStr) {
    profile.streak = (profile.streak || 0) + 1;
  } else if (profile.lastActiveDate !== todayStr) {
    profile.streak = 1; // reset
  }
  profile.lastActiveDate = todayStr;
};

const getSafetySettings = () => [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];

const FALLBACK_SCENARIOS = {
  Professional: [
    { scenario: "A client is upset about a delayed delivery. Write an email to apologize and offer a solution.", tips: ["Use a professional tone", "Apologize sincerely", "Propose a concrete next step"] },
    { scenario: "You need to ask your manager for a deadline extension on a high-priority project.", tips: ["Explain the reason clearly", "Suggest a new, realistic deadline", "Reiterate your commitment to quality"] },
    { scenario: "Write a summary of a successful team meeting to be shared with stakeholders.", tips: ["Highlight key decisions", "List action items with owners", "Keep it concise and objective"] }
  ],
  Informal: [
    { scenario: "You missed a friend's birthday party. Write a text message to apologize and suggest a coffee meetup.", tips: ["Be sincere but casual", "Don't over-explain", "Focus on the future meetup"] },
    { scenario: "Ask a neighbor if they can look after your plants while you are away next weekend.", tips: ["Be polite and neighborly", "Provide clear instructions", "Offer to return the favor"] }
  ],
  Academic: [
    { scenario: "Write an introductory paragraph for an essay about the impact of technology on communication.", tips: ["Start with a strong hook", "Provide context", "Include a clear thesis statement"] },
    { scenario: "Summarize a research finding regarding language acquisition in adults.", tips: ["Use formal academic language", "Cite evidence-based trends", "Stay objective"] }
  ]
};

const FALLBACK_VOCABULARY = [
  { word: "Diligent", meaning: "Having or showing care and conscientiousness in one's work or duties.", example: "He was a diligent worker who always met his deadlines." },
  { word: "Resilient", meaning: "Able to withstand or recover quickly from difficult conditions. ", example: "The company's resilient strategy helped it survive the economic downturn." },
  { word: "Pragmatic", meaning: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.", example: "We need a pragmatic solution to this complex problem." },
  { word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing.", example: "She gave an eloquent speech that moved the entire audience." }
];

const FALLBACK_GRAMMAR_TESTS = [
  {
    question: "Choose the correct form: 'Neither the manager nor the employees ___ aware of the change.'",
    options: ["is", "are", "was", "be"],
    correctAnswerIndex: 1,
    explanation: "When subjects are joined by 'neither/nor', the verb agrees with the closer subject ('employees', which is plural)."
  },
  {
    question: "Identify the professional way to start an email to someone you don't know.",
    options: ["Hey you,", "To whom it may concern,", "Dear [Name or Title],", "What's up,"],
    correctAnswerIndex: 2,
    explanation: "'Dear [Name or Title]' is the standard professional greeting."
  }
];

// ─────────────────────────────────────────────────
// GET or CREATE profile
// ─────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    let profile = await CommunicationPractice.findOne({ userId });
    if (!profile) {
      profile = new CommunicationPractice({ userId });
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GENERATE Daily Scenario
// ─────────────────────────────────────────────────
export const generateDailyScenario = async (req, res) => {
  try {
    const { userId, tone = "Professional" } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    let scenarioData;
    try {
      const genAI = await getGenAI();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash', 
        safetySettings: getSafetySettings(),
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Generate a daily communication/language practice scenario. 
      The tone should be: ${tone}. 
      It should be a realistic situation requiring a written response.
      Return ONLY a raw JSON object (no markdown, no code blocks) with exactly this format:
      {
        "scenario": "A brief description...",
        "tips": ["Tip 1", "Tip 2"]
      }`;

      const result = await retryWithBackoff(() => model.generateContent(prompt), 1, 1500);
      let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      scenarioData = JSON.parse(text);
    } catch (aiError) {
      console.warn('AI Scenario Generation failed, using fallback:', aiError.message);
      const bank = FALLBACK_SCENARIOS[tone] || FALLBACK_SCENARIOS.Professional;
      scenarioData = bank[Math.floor(Math.random() * bank.length)];
    }

    res.status(200).json({ success: true, data: scenarioData });
  } catch (error) {
    console.error('generateDailyScenario error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// SUBMIT Scenario Response
// ─────────────────────────────────────────────────
export const submitScenario = async (req, res) => {
  try {
    const { userId, scenario, userResponse } = req.body;
    if (!userId || !scenario || !userResponse) {
      return res.status(400).json({ success: false, message: 'userId, scenario, and userResponse are required' });
    }

    let profile = await CommunicationPractice.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      safetySettings: getSafetySettings(),
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Act as an expert communication and language coach. Evaluate the user's response to the given scenario.
Scenario: "${scenario}"
User's Response: "${userResponse}"

Evaluate the response for grammar, tone, clarity, and effectiveness. Score it from 0 to 100.
Return ONLY a raw JSON object (no markdown, no code blocks) with exactly this format:
{
  "score": 85,
  "feedback": "Your feedback here, pointing out strengths and specific areas to improve (like grammar mistakes or tone adjustments).",
  "improvedVersion": "A slightly rewritten version of their response that sounds more professional/native."
}`;

    const result = await retryWithBackoff(() => model.generateContent(prompt), 1, 1500);
    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    let evaluation;
    try {
      evaluation = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from AI');
    }

    const xpAwarded = Math.round(evaluation.score / 2); // max 50 XP per scenario

    const newLog = {
      date: getTodayDateString(),
      scenario,
      userResponse,
      feedback: evaluation.feedback,
      score: evaluation.score || 0,
      xpAwarded
    };

    profile.practiceLogs.unshift(newLog);
    if (profile.practiceLogs.length > 50) profile.practiceLogs = profile.practiceLogs.slice(0, 50);

    profile.xp = (profile.xp || 0) + xpAwarded;
    profile.level = recalculateLevel(profile.xp);
    updateStreak(profile);

    await profile.save();

    res.status(200).json({ success: true, data: { evaluation, xpAwarded, newLevel: profile.level, streak: profile.streak } });
  } catch (error) {
    console.error('submitScenario error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GENERATE Vocabulary
// ─────────────────────────────────────────────────
export const generateVocabulary = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    let vocabData;
    try {
      const genAI = await getGenAI();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash', 
        safetySettings: getSafetySettings(),
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Generate a set of 3 useful, intermediate-to-advanced vocabulary words for professional or daily communication.
      Return ONLY a raw JSON array (no markdown, no code blocks) with exactly this format:
      [
        {
          "word": "Diligent",
          "meaning": "...",
          "example": "..."
        }
      ]`;

      const result = await retryWithBackoff(() => model.generateContent(prompt), 1, 1500);
      let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      vocabData = JSON.parse(text);
    } catch (aiError) {
      console.warn('AI Vocab Generation failed, using fallback:', aiError.message);
      // Shuffle and take 3
      vocabData = [...FALLBACK_VOCABULARY]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    }

    res.status(200).json({ success: true, data: vocabData || FALLBACK_VOCABULARY.slice(0, 3) });
  } catch (error) {
    console.error('generateVocabulary error:', error);
    // Final fallback to ensure it NEVER returns 500
    res.status(200).json({ success: true, data: FALLBACK_VOCABULARY.slice(0, 3) });
  }
};

// ─────────────────────────────────────────────────
// TOGGLE Vocabulary Mastery
// ─────────────────────────────────────────────────
export const toggleVocabularyMastery = async (req, res) => {
  try {
    const { userId, wordId, mastered } = req.body;
    if (!userId || !wordId) return res.status(400).json({ success: false, message: 'userId and wordId are required' });

    let profile = await CommunicationPractice.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const wordIndex = profile.vocabularyBank.findIndex(v => v._id.toString() === wordId);
    if (wordIndex === -1) return res.status(404).json({ success: false, message: 'Word not found in bank' });

    const becomingMastered = mastered && !profile.vocabularyBank[wordIndex].mastered;
    profile.vocabularyBank[wordIndex].mastered = mastered;

    if (becomingMastered) {
      profile.xp = (profile.xp || 0) + 10; // 10 XP bonus for mastery
      profile.level = recalculateLevel(profile.xp);
    }

    await profile.save();
    res.status(200).json({ success: true, data: profile.vocabularyBank[wordIndex], totalXP: profile.xp });
  } catch (error) {
    console.error('toggleVocabularyMastery error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// DELETE Vocabulary
// ─────────────────────────────────────────────────
export const deleteVocabulary = async (req, res) => {
  try {
    const { userId, wordId } = req.body;
    if (!userId || !wordId) return res.status(400).json({ success: false, message: 'userId and wordId are required' });

    let profile = await CommunicationPractice.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    profile.vocabularyBank = profile.vocabularyBank.filter(v => v._id.toString() !== wordId);
    await profile.save();

    res.status(200).json({ success: true, message: 'Word removed from bank' });
  } catch (error) {
    console.error('deleteVocabulary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// SAVE Vocabulary
// ─────────────────────────────────────────────────
export const saveVocabulary = async (req, res) => {
  try {
    const { userId, word, meaning, example } = req.body;
    if (!userId || !word) return res.status(400).json({ success: false, message: 'userId and word are required' });

    let profile = await CommunicationPractice.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // Check if word already exists
    if (!profile.vocabularyBank.some(v => v.word.toLowerCase() === word.toLowerCase())) {
      profile.vocabularyBank.unshift({ word, meaning, example });
      
      // small xp bump
      profile.xp = (profile.xp || 0) + 2;
      profile.level = recalculateLevel(profile.xp);
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile.vocabularyBank });
  } catch (error) {
    console.error('saveVocabulary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GENERATE Grammar Test
// ─────────────────────────────────────────────────
export const generateGrammarTest = async (req, res) => {
  try {
    const { userId } = req.query;
    let testData;

    try {
      const genAI = await getGenAI();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash', 
        safetySettings: getSafetySettings(),
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Generate a 5-question multiple-choice grammar and communication test for English learners. Cover topics like tenses, subject-verb agreement, and professional tone.
      Return ONLY a raw JSON array (no markdown, no code blocks) with exactly this format:
      [
        {
          "question": "...",
          "options": ["...", "..."],
          "correctAnswerIndex": 1,
          "explanation": "..."
        }
      ]`;

      const result = await retryWithBackoff(() => model.generateContent(prompt), 1, 1500);
      let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      testData = JSON.parse(text);
    } catch (aiError) {
      console.warn('AI Grammar Test Generation failed, using fallback:', aiError.message);
      testData = FALLBACK_GRAMMAR_TESTS;
    }

    res.status(200).json({ success: true, data: testData || FALLBACK_GRAMMAR_TESTS });
  } catch (error) {
    console.error('generateGrammarTest fatal error:', error);
    res.status(200).json({ success: true, data: FALLBACK_GRAMMAR_TESTS });
  }
};

// ─────────────────────────────────────────────────
// SUBMIT Grammar Test
// ─────────────────────────────────────────────────
export const submitGrammarTest = async (req, res) => {
  try {
    const { userId, score, totalQuestions } = req.body;
    if (!userId || score === undefined || !totalQuestions) {
      return res.status(400).json({ success: false, message: 'userId, score, and totalQuestions are required' });
    }

    let profile = await CommunicationPractice.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const xpAwarded = score * 5; // 5 XP per correct answer

    profile.testScores.unshift({
      score,
      totalQuestions,
      xpAwarded
    });

    profile.xp = (profile.xp || 0) + xpAwarded;
    profile.level = recalculateLevel(profile.xp);
    updateStreak(profile);

    await profile.save();

    res.status(200).json({ success: true, data: { score, xpAwarded, newLevel: profile.level, streak: profile.streak } });
  } catch (error) {
    console.error('submitGrammarTest error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
