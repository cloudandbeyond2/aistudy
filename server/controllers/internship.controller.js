import Internship from '../models/Internship.js';
import User from '../models/User.js';
import { generateAIText } from '../config/aiProvider.js';

const pickPreferredInternship = (internships = []) => {
    if (!internships.length) {
        return null;
    }

    return internships.find((internship) => internship.status === 'active')
        || internships.find((internship) => internship.status === 'requested')
        || internships[0];
};

export const createInternship = async (req, res) => {
    try {
        const { studentId, organizationId, title, description, domain, internshipType, startDate, endDate, status, tasks, studyPlan, exerciseTopics, resources } = req.body;
        
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
            exerciseTopics: exerciseTopics || [],
            resources: resources || []
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
        const studentId = String(req.params.studentId || '').trim();
        const { organizationId } = req.query;
        let query = { studentId };
        if (organizationId) query.organizationId = organizationId;

        const internships = await Internship.find(query)
            .populate('studentId', 'mName email studentDetails')
            .populate('organizationId', 'institutionName')
            .sort({ createdAt: -1 });

        const internship = pickPreferredInternship(internships);

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
        const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
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
            { returnDocument: 'after' }
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
            { returnDocument: 'after' }
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
            { returnDocument: 'after' }
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
        Format the response in JSON ONLY with exactly these keys: "title", "description", "roadmap", "exerciseTopics", and "resources".
        - "title": A professional internship title (e.g., "Associate Cloud Engineer Intern").
        - "description": A detailed, MNC-style work nature description (1-2 paragraphs).
        - "roadmap": An array of objects: { title, tasks: [{ title, description, suggestedDuration }] }
        - "exerciseTopics": A flat array of technical topics.
        - "resources": A list of 3-5 high-quality reference links: [{ title, link }]. Use real domains like docs.microsoft.com, react.dev, developer.mozilla.org, etc.`;

        const prompt = `Generate a comprehensive internship plan for a ${domain} internship. 
        Return a JSON object containing:
        "title": String,
        "description": String,
        "roadmap": Array of ${weeks} weeks,
        "exerciseTopics": Array of technical topics,
        "resources": Array of objects { title, link }
        
        Domain: ${domain}`;

        const generatedText = await generateAIText({
            prompt,
            systemInstruction,
            responseMimeType: 'application/json'
        });

        const data = JSON.parse(generatedText);

        res.status(200).json({
            success: true,
            title: data.title,
            description: data.description,
            roadmap: data.roadmap,
            exerciseTopics: data.exerciseTopics,
            resources: data.resources
        });
    } catch (error) {
        console.error('AI Roadmap Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate AI roadmap' });
    }
};
