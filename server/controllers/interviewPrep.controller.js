import InterviewCurrentAffair from '../models/InterviewCurrentAffair.js';
import DailyAptitude from '../models/DailyAptitude.js';
import User from '../models/User.js';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import { getGenAI } from '../config/gemini.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import axios from 'axios';
import mongoose from "mongoose";

// Middleware to check if user is paid
// export const checkPaidUser = async (req, res, next) => {
//   try {
//     // const userId = req.body.userId || req.query.userId || req.headers['user-id'];
//     const user = await User.findById(userId);
//     console.log(`[checkPaidUser] Attempt for userId: ${userId}`);
//     console.log(`[checkPaidUser] Headers:`, JSON.stringify(req.headers));
    
//     if (!userId) {
//       console.warn(`[checkPaidUser] Missing User ID`);
//       return res.status(401).json({ success: false, message: 'User ID is required' });
//     }

//     // const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     const PAID_TYPES = ['monthly', 'yearly', 'forever'];
//     const isPaid = PAID_TYPES.includes(user.type);
//     const isOrgUser = !!user.organizationId || user.isOrganization;

//     if (!isPaid && !isOrgUser) {
//       return res.status(403).json({ success: false, message: 'This feature is only available to paid users.' });
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const checkPaidUser = async (req, res, next) => {
  try {
    const userId =
      req?.body?.userId ||
      req?.query?.userId ||
      req?.headers?.["user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const PAID_TYPES = ["monthly", "yearly", "forever"];
    const isPaid = PAID_TYPES.includes(user.type);
    const isOrgUser = !!user.organizationId || !!user.organization || user.isOrganization;

    if (!isPaid && !isOrgUser) {
      return res.status(403).json({
        success: false,
        message: "This feature is only available to paid users.",
      });
    }

    next();
  } catch (error) {
    console.error("checkPaidUser error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

// Helper: Check if a date is today in IST
const isTodayIST = (dateObj) => {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // +5:30 in ms
  const nowIST = new Date(Date.now() + IST_OFFSET);
  const dateIST = new Date(dateObj.getTime() + IST_OFFSET);
  return (
    nowIST.getUTCFullYear() === dateIST.getUTCFullYear() &&
    nowIST.getUTCMonth() === dateIST.getUTCMonth() &&
    nowIST.getUTCDate() === dateIST.getUTCDate()
  );
};

export const getCurrentAffairs = async (req, res) => {
  try {
    const rssUrl = 'https://news.google.com/rss/search?q=Current+Affairs+Technology+India+when:2h&hl=en-IN&gl=IN&ceid=IN:en';
    const response = await axios.get(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const xml = response.data;
    
    const itemsRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const descRegex = /<description>([\s\S]*?)<\/description>/;
    const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
    
    let match;
    const affairs = [];
    
    // Parse RSS items — include recent news from last 2 hours, up to 15 items
    while ((match = itemsRegex.exec(xml)) !== null && affairs.length < 15) {
      const itemXml = match[1];
      const titleMatch = titleRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);
      
      if (titleMatch) {
         const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
         
         // Clean HTML from description
         let content = "Click to read more details on the given topic.";
         if (descMatch) {
           const decodedDesc = descMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
           content = decodedDesc.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
         }
         
         // Clean title (remove CDATA wrappers)
         let title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
         title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
         title = title.split(' - ')[0]; // remove source name suffix
         
         affairs.push({
           _id: Math.random().toString(36).substring(2, 10),
           title: title,
           content: content,
           category: "Latest News",
           date: pubDate
         });
      }
    }
    
    res.status(200).json({ success: true, data: affairs });
  } catch (error) {
    console.error("Google News Fetch Error:", error.message);
    // Fallback to DB — today only
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const dbAffairs = await InterviewCurrentAffair.find({ 
        isActive: true, 
        date: { $gte: todayStart, $lte: todayEnd } 
      }).sort({ date: -1 });
      res.status(200).json({ success: true, data: dbAffairs });
    } catch (dbError) {
      res.status(500).json({ success: false, message: error.message });
    }
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

// In-memory cache for daily aptitude — resets each calendar day
let aptitudeCache = { date: null, data: null };

// Rotating concepts for daily aptitude
const APTITUDE_CONCEPTS = [
  'Logical Reasoning',
  'Quantitative Aptitude',
  'Verbal Ability',
  'Data Interpretation',
  'Number Series',
  'Percentage & Profit-Loss',
  'Time & Work'
];

const getTodaysConcept = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return APTITUDE_CONCEPTS[dayOfYear % APTITUDE_CONCEPTS.length];
};

const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getDailyAptitudes = async (req, res) => {
  try {
    const todayStr = getTodayDateString();

    // Return cached data if it's for today
    if (aptitudeCache.date === todayStr && aptitudeCache.data) {
      return res.status(200).json({ success: true, data: aptitudeCache.data });
    }

    const concept = getTodaysConcept();

    const genAI = await getGenAI();
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
    ];
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', safetySettings });

    const prompt = `Generate exactly 15 multiple choice aptitude questions on the concept "${concept}". 
    These should be suitable for competitive exam and interview preparation. Mix easy, medium, and hard difficulty.
    
    Return ONLY a raw JSON array (no markdown, no code blocks) with this exact format:
    [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option C"
      }
    ]
    IMPORTANT: Generate exactly 15 questions. "answer" must match exactly one of the strings in "options".`;

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let text = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let questions;
    try {
      questions = JSON.parse(text);
    } catch (e) {
      console.error("Daily Aptitude JSON Parse Error:", text);
      throw new Error('Invalid JSON format received from AI');
    }

    // Enforce 15 question limit and shuffle options
    questions = questions.slice(0, 15).map((q, index) => {
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      return {
        id: index + 1,
        question: q.question,
        options: shuffledOptions,
        answer: q.answer
      };
    });

    const dailyData = [{
      _id: `apt-${todayStr}`,
      title: `Daily ${concept}`,
      description: `Today's 15 aptitude questions on ${concept}. Test your skills and sharpen your reasoning!`,
      date: new Date(),
      questions: questions
    }];

    // Cache for the day
    aptitudeCache = { date: todayStr, data: dailyData };

    res.status(200).json({ success: true, data: dailyData });
  } catch (error) {
    console.error('Daily Aptitude generation error:', error);
    // Fallback to DB
    try {
      const tests = await DailyAptitude.find({ isActive: true }).sort({ date: -1 }).limit(1);
      // Limit questions to 15 from DB too
      const limited = tests.map(t => ({
        ...t.toObject(),
        questions: t.questions.slice(0, 15)
      }));
      res.status(200).json({ success: true, data: limited });
    } catch (dbError) {
      res.status(500).json({ success: false, message: error.message });
    }
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', safetySettings });

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
