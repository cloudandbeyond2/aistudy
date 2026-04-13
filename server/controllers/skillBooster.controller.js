import SkillBooster from '../models/SkillBooster.js';
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

// ─────────────────────────────────────────────────
// GET or CREATE profile
// ─────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    let profile = await SkillBooster.findOne({ userId });
    if (!profile) {
      profile = new SkillBooster({ userId });
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// SET/UPDATE topic
// ─────────────────────────────────────────────────
export const setTopic = async (req, res) => {
  try {
    const { userId, topic, customTopic } = req.body;
    if (!userId || !topic) {
      return res.status(400).json({ success: false, message: 'userId and topic are required' });
    }

    let profile = await SkillBooster.findOne({ userId });
    if (!profile) profile = new SkillBooster({ userId });

    const topicChanged = profile.topic !== topic || profile.customTopic !== customTopic;
    profile.topic = topic;
    profile.customTopic = customTopic || '';

    // Reset roadmap if topic changed
    if (topicChanged) {
      profile.roadmap = [];
      profile.currentMilestoneIndex = 0;
    }

    await profile.save();
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('setTopic error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GENERATE AI Roadmap
// ─────────────────────────────────────────────────
export const generateRoadmap = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    let profile = await SkillBooster.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const topicLabel = profile.topic === 'Custom' ? (profile.customTopic || 'Personal Growth') : profile.topic;

    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', safetySettings: getSafetySettings() });

    const prompt = `Create a 10-milestone skill development roadmap for the topic: "${topicLabel}".
Each milestone should be actionable, progressive, and practical.

Return ONLY a raw JSON array (no markdown, no code blocks) with exactly this format:
[
  {
    "order": 1,
    "title": "Short milestone title",
    "description": "2-3 sentence description of what to learn/do",
    "estimatedDays": 7,
    "skillTags": ["tag1", "tag2"]
  }
]
Generate exactly 10 milestones, ordered from beginner to advanced. Each estimatedDays between 5 and 21.`;

    const result = await retryWithBackoff(() => model.generateContent(prompt), 1, 1500);
    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    let milestones;
    try {
      milestones = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from AI: ' + text.substring(0, 200));
    }

    profile.roadmap = milestones.slice(0, 10).map((m, i) => ({
      order: i + 1,
      title: m.title || `Milestone ${i + 1}`,
      description: m.description || '',
      estimatedDays: m.estimatedDays || 7,
      skillTags: Array.isArray(m.skillTags) ? m.skillTags : [],
      completed: false
    }));
    profile.currentMilestoneIndex = 0;

    await profile.save();
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('generateRoadmap error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GET Daily Tip (cached per user per day)
// ─────────────────────────────────────────────────
export const getDailyTip = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    let profile = await SkillBooster.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found. Set a topic first.' });

    const todayStr = getTodayDateString();
    const existing = profile.dailyTips.find(t => t.date === todayStr);
    if (existing) return res.status(200).json({ success: true, data: existing, cached: true });

    const topicLabel = profile.topic === 'Custom' ? (profile.customTopic || 'Personal Growth') : profile.topic;

    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', safetySettings: getSafetySettings() });

    const prompt = `Generate a daily skill booster for the topic: "${topicLabel}".

Return ONLY a raw JSON object (no markdown, no code blocks) with exactly this format:
{
  "tip": "One actionable tip (2-3 sentences) relevant to ${topicLabel}",
  "trick": "One quick trick or shortcut to improve faster in ${topicLabel}",
  "practiceIdea": "One specific 10-minute practice activity for today",
  "category": "${topicLabel}"
}`;

    const result = await retryWithBackoff(() => model.generateContent(prompt), 1, 1500);
    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    let tipData;
    try {
      tipData = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from AI');
    }

    const newTip = {
      date: todayStr,
      tip: tipData.tip || '',
      trick: tipData.trick || '',
      practiceIdea: tipData.practiceIdea || '',
      category: tipData.category || topicLabel
    };

    // Keep last 30 days of tips only
    profile.dailyTips = [newTip, ...profile.dailyTips].slice(0, 30);
    await profile.save();

    res.status(200).json({ success: true, data: newTip, cached: false });
  } catch (error) {
    console.error('getDailyTip error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// LOG Practice Task
// ─────────────────────────────────────────────────
export const logPractice = async (req, res) => {
  try {
    const { userId, task, notes } = req.body;
    if (!userId || !task) {
      return res.status(400).json({ success: false, message: 'userId and task are required' });
    }

    let profile = await SkillBooster.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const XP_PER_TASK = 10;

    const newLog = {
      task,
      completed: true,
      notes: notes || '',
      xpAwarded: XP_PER_TASK,
      completedAt: new Date()
    };

    profile.practiceLog.unshift(newLog);
    // Keep last 100 entries
    if (profile.practiceLog.length > 100) profile.practiceLog = profile.practiceLog.slice(0, 100);

    // Award XP
    profile.xp = (profile.xp || 0) + XP_PER_TASK;
    profile.level = recalculateLevel(profile.xp);

    // Update streak
    updateStreak(profile);

    await profile.save();
    res.status(200).json({ success: true, data: { level: profile.level, xp: profile.xp, streak: profile.streak, xpAwarded: XP_PER_TASK } });
  } catch (error) {
    console.error('logPractice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// GET Practice Log
// ─────────────────────────────────────────────────
export const getPracticeLog = async (req, res) => {
  try {
    const userId = req.query.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const profile = await SkillBooster.findOne({ userId });
    if (!profile) return res.status(200).json({ success: true, data: [] });

    const log = profile.practiceLog.slice(0, limit);
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error('getPracticeLog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// COMPLETE Milestone
// ─────────────────────────────────────────────────
export const completeMilestone = async (req, res) => {
  try {
    const { userId, milestoneIndex } = req.body;
    if (!userId || milestoneIndex === undefined) {
      return res.status(400).json({ success: false, message: 'userId and milestoneIndex are required' });
    }

    let profile = await SkillBooster.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    if (profile.roadmap[milestoneIndex]) {
      profile.roadmap[milestoneIndex].completed = true;
      profile.currentMilestoneIndex = Math.min(milestoneIndex + 1, profile.roadmap.length - 1);
      // Milestone completion awards 50 XP
      profile.xp = (profile.xp || 0) + 50;
      profile.level = recalculateLevel(profile.xp);
      updateStreak(profile);
      await profile.save();
    }

    res.status(200).json({ success: true, data: { level: profile.level, xp: profile.xp, streak: profile.streak } });
  } catch (error) {
    console.error('completeMilestone error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
