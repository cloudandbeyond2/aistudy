import { GoogleGenerativeAI } from '@google/generative-ai';
import Admin from '../models/Admin.js';

export const getGenAI = async () => {
    const admin = await Admin.findOne({ type: 'main' });
    const key = admin?.geminiApiKey || process.env.API_KEY;
    return new GoogleGenerativeAI(key);
};
