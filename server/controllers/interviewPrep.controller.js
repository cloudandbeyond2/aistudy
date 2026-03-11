import InterviewCurrentAffair from '../models/InterviewCurrentAffair.js';
import DailyAptitude from '../models/DailyAptitude.js';
import User from '../models/User.js';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import { getGenAI } from '../config/gemini.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Middleware to check if user is paid
export const checkPaidUser = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.query.userId || req.headers['user-id'];
    console.log(`[checkPaidUser] Attempt for userId: ${userId}`);
    console.log(`[checkPaidUser] Headers:`, JSON.stringify(req.headers));
    
    if (!userId) {
      console.warn(`[checkPaidUser] Missing User ID`);
      return res.status(401).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const PAID_TYPES = ['monthly', 'yearly', 'forever'];
    const isPaid = PAID_TYPES.includes(user.type);
    const isOrgUser = !!user.organizationId || user.isOrganization;

    if (!isPaid && !isOrgUser) {
      return res.status(403).json({ success: false, message: 'This feature is only available to paid users.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- CURRENT AFFAIRS ----------------
export const createCurrentAffair = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const newAffair = new InterviewCurrentAffair({ title, content, category });
    await newAffair.save();
    res.status(201).json({ success: true, message: 'Current affair created', data: newAffair });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentAffairs = async (req, res) => {
  try {
    const affairs = await InterviewCurrentAffair.find({ isActive: true }).sort({ date: -1 });
    res.status(200).json({ success: true, data: affairs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- DAILY APTITUDE ----------------
export const createDailyAptitude = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const newTest = new DailyAptitude({ title, description, questions });
    await newTest.save();
    res.status(201).json({ success: true, message: 'Daily aptitude created', data: newTest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDailyAptitudes = async (req, res) => {
  try {
    const tests = await DailyAptitude.find({ isActive: true }).sort({ date: -1 });
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- CATEGORY WISE QUIZ CREATION ----------------
export const generateCategoryQuiz = async (req, res) => {
  try {
    const { category, numQuestions = 10 } = req.body;
    
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const genAI = await getGenAI();
    
    const prompt = `Generate ${numQuestions} multiple choice questions about the category "${category}". 
    The questions should be appropriate for interview preparation or general knowledge testing.
    
    Return ONLY a raw JSON array (no markdown, no code blocks) with this exact format:
    [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option C"
      }
    ]
    IMPORTANT: "answer" must match exactly one of the strings in "options".`;

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
    ];

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    
    let text = result.response.text();
    // Improved cleanup to remove markdown and whitespace, but KEEP quotes
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let quizData;
    try {
      quizData = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", text);
      throw new Error('Invalid JSON format received from AI');
    }

    // Shuffle options
    quizData = quizData.map((q, index) => {
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      return {
        id: index + 1,
        question: q.question,
        options: shuffledOptions,
        answer: q.answer
      };
    });

    res.status(200).json({ success: true, data: quizData });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate quiz' });
  }
};
