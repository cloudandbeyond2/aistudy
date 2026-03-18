import { GoogleGenerativeAI } from '@google/generative-ai';
import Admin from '../models/Admin.js';

export const getGenAI = async () => {
    try {
        const admin = await Admin.findOne({ type: 'main' });
        const key = admin?.geminiApiKey || process.env.API_KEY;

        if (!key) {
            const error = new Error('Missing Gemini API Key. Please configure it in settings.');
            error.status = 401;
            throw error;
        }

        return new GoogleGenerativeAI(key);
    } catch (error) {
        console.error('Error in getGenAI:', error.message);
        // Fallback to environment variable if DB fails
        if (process.env.API_KEY) {
            return new GoogleGenerativeAI(process.env.API_KEY);
        }
        throw error;
    }
};
