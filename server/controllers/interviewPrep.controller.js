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

const buildFallbackDailyAptitudes = (concept) => {
  const fallbackQuestions = [
    {
      question: `A train travels 60 km in 1.5 hours. What is its average speed?`,
      options: ['30 km/h', '40 km/h', '50 km/h', '60 km/h'],
      answer: '40 km/h'
    },
    {
      question: `If the ratio of boys to girls is 3:5 and there are 40 students, how many girls are there?`,
      options: ['20', '24', '25', '30'],
      answer: '25'
    },
    {
      question: `What is 15% of 200?`,
      options: ['20', '25', '30', '35'],
      answer: '30'
    },
    {
      question: `If a product costs 800 and is sold at a 10% profit, what is the selling price?`,
      options: ['840', '860', '880', '900'],
      answer: '880'
    },
    {
      question: `A number is increased by 20% and then decreased by 20%. What is the net change?`,
      options: ['0%', '2% decrease', '4% decrease', '4% increase'],
      answer: '4% decrease'
    },
    {
      question: `What comes next in the sequence: 2, 6, 12, 20, ?`,
      options: ['28', '30', '32', '36'],
      answer: '30'
    },
    {
      question: `If all roses are flowers and some flowers fade quickly, which statement is definitely true?`,
      options: [
        'All roses fade quickly',
        'Some flowers fade quickly',
        'No roses are flowers',
        'All flowers are roses'
      ],
      answer: 'Some flowers fade quickly'
    },
    {
      question: `Which word is most nearly opposite to "expand"?`,
      options: ['Increase', 'Enlarge', 'Contract', 'Extend'],
      answer: 'Contract'
    },
    {
      question: `A shop offers 2 for 1 on items priced at 150 each. What is the effective price per item?`,
      options: ['50', '75', '100', '125'],
      answer: '75'
    },
    {
      question: `If 8 workers complete a task in 12 days, how many days will 12 workers take, assuming equal efficiency?`,
      options: ['6', '8', '10', '12'],
      answer: '8'
    },
    {
      question: `Which of the following is a prime number?`,
      options: ['21', '27', '29', '35'],
      answer: '29'
    },
    {
      question: `A and B can do a work in 10 days together. If A alone does it in 15 days, how long will B take alone?`,
      options: ['20 days', '24 days', '30 days', '45 days'],
      answer: '30 days'
    },
    {
      question: `What is the next letter in the pattern: A, C, F, J, ?`,
      options: ['L', 'M', 'N', 'O'],
      answer: 'N'
    },
    {
      question: `If a triangle has sides 3, 4, and 5, what type of triangle is it?`,
      options: ['Equilateral', 'Isosceles', 'Right-angled', 'Obtuse'],
      answer: 'Right-angled'
    },
    {
      question: `A sum doubles in 5 years at simple interest. What is the annual rate of interest?`,
      options: ['10%', '15%', '20%', '25%'],
      answer: '20%'
    }
  ];

  return [{
    _id: `apt-${getTodayDateString()}`,
    title: `Daily ${concept}`,
    description: `Today's 15 aptitude questions on ${concept}. Test your skills and sharpen your reasoning!`,
    date: new Date(),
    questions: fallbackQuestions.slice(0, 15).map((question, index) => ({
      ...question,
      id: index + 1
    }))
  }];
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

    const result = await retryWithBackoff(() => model.generateContent(prompt), 2, 600);
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
    const status = error?.status || error?.response?.status;
    console.warn(`Daily Aptitude generation fallback engaged (status=${status || 'unknown'})`);
    // Fallback to DB
    try {
      const tests = await DailyAptitude.find({ isActive: true }).sort({ date: -1 }).limit(1);
      // Limit questions to 15 from DB too
      const limited = tests.map(t => ({
        ...t.toObject(),
        questions: t.questions.slice(0, 15)
      }));
      if (limited.length > 0) {
        aptitudeCache = { date: getTodayDateString(), data: limited };
        return res.status(200).json({ success: true, data: limited });
      }
      const fallbackData = buildFallbackDailyAptitudes(getTodaysConcept());
      aptitudeCache = { date: getTodayDateString(), data: fallbackData };
      return res.status(200).json({ success: true, data: fallbackData });
    } catch (dbError) {
      const fallbackData = buildFallbackDailyAptitudes(getTodaysConcept());
      aptitudeCache = { date: getTodayDateString(), data: fallbackData };
      return res.status(200).json({ success: true, data: fallbackData });
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
