import Internship from '../models/Internship.js';
import User from '../models/User.js';
import { generateAIText } from '../config/aiProvider.js';

export const createInternship = async (req, res) => {
    try {
        const { studentId, organizationId, title, description, domain, internshipType, startDate, endDate, status, tasks, studyPlan, exerciseTopics } = req.body;
        
        if (!studentId || !organizationId || !title) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newInternship = new Internship({
            studentId,
            organizationId,
            title,
            domain: domain || 'General',
            internshipType: internshipType || 'general',
            description,
            startDate: startDate || new Date(),
            endDate,
            status: status || 'active',
            tasks: tasks || [],
            studyPlan: studyPlan || [],
            exerciseTopics: exerciseTopics || []
        });

        await newInternship.save();
        res.status(201).json({ success: true, internship: newInternship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInternships = async (req, res) => {
    try {
        const { organizationId, studentId } = req.query;
        let query = {};
        if (organizationId) query.organizationId = organizationId;
        if (studentId) query.studentId = studentId;

        const internships = await Internship.find(query)
            .populate('studentId', 'mName email studentDetails')
            .populate('organizationId', 'institutionName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, internships });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStudentInternship = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { organizationId } = req.query;
        let query = { studentId };
        if (organizationId) query.organizationId = organizationId;

        const internship = await Internship.findOne(query)
            .populate('studentId', 'mName email studentDetails')
            .populate('organizationId', 'institutionName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate('studentId', 'mName email studentDetails')
            .populate('organizationId', 'institutionName');

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateInternship = async (req, res) => {
    try {
        const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Task Operations
export const addTask = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

        internship.tasks.push({ title, description, dueDate });
        await internship.save();
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        
        // Prepare dot notation updates
        const updateFields = {};
        for (const [key, value] of Object.entries(updates)) {
            updateFields[`tasks.$.${key}`] = value;
        }

        const internship = await Internship.findOneAndUpdate(
            { _id: req.params.id, 'tasks._id': taskId },
            { $set: updateFields },
            { new: true }
        );

        if (!internship) return res.status(404).json({ success: false, message: 'Internship or task not found' });
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Daily Follow-up Operations
export const addFollowup = async (req, res) => {
    try {
        const { log } = req.body;
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

        internship.dailyFollowups.push({ log });
        await internship.save();
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateFollowup = async (req, res) => {
    try {
        const { followupId } = req.params;
        const updates = req.body;

        const updateFields = {};
        for (const [key, value] of Object.entries(updates)) {
            updateFields[`dailyFollowups.$.${key}`] = value;
        }

        const internship = await Internship.findOneAndUpdate(
            { _id: req.params.id, 'dailyFollowups._id': followupId },
            { $set: updateFields },
            { new: true }
        );

        if (!internship) return res.status(404).json({ success: false, message: 'Internship or followup not found' });
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Study Plan Operations
export const updateStudyPlan = async (req, res) => {
    try {
        const { studyPlan } = req.body;
        const internship = await Internship.findByIdAndUpdate(
            req.params.id,
            { $set: { studyPlan } },
            { new: true }
        );
        res.status(200).json({ success: true, internship });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const generateRoadmap = async (req, res) => {
    try {
        const { domain, level = 'beginner', weeks = 4 } = req.body;

        if (!domain) {
            return res.status(400).json({ success: false, message: 'Domain is required' });
        }

        const systemInstruction = `You are an expert MNC Internship Mentor. Your goal is to generate a structured, professional, practical-oriented ${weeks}-week training roadmap for a ${domain} internship at a ${level} level. 
        Each week should have 1-2 key tasks that mirror real-world corporate workflows (e.g., Code Review, Unit Testing, Documentation, Scalability). 
        Format the response in JSON ONLY with keys "roadmap" and "exerciseTopics".
        roadmap should be an array of objects: { title, tasks: [{ title, description, suggestedDuration }] }
        exerciseTopics should be a flat array of strings.`;

        const prompt = `Generate a JSON object with a key "roadmap" containing an array of ${weeks} weeks. 
        Each week object should have:
        "title": String (e.g., "Week 1: Foundations & Setup"),
        "tasks": Array of objects, each with:
            "title": String,
            "description": String (detailed MNC-style instructions),
            "suggestedDuration": String
        Also include a key "exerciseTopics" which is an array of 5-8 related technical topics the student should learn.
        
        Domain: ${domain}`;

        const generatedText = await generateAIText({
            prompt,
            systemInstruction,
            responseMimeType: 'application/json'
        });

        const roadmapData = JSON.parse(generatedText);

        res.status(200).json({
            success: true,
            roadmap: roadmapData.roadmap,
            exerciseTopics: roadmapData.exerciseTopics
        });
    } catch (error) {
        console.error('AI Roadmap Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate AI roadmap' });
    }
};
