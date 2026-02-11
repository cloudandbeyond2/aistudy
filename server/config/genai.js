import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
import Admin from '../models/Admin.js';

export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

export const getChatModel = async () => {
  const admin = await Admin.findOne({ type: 'main' });
  const key = admin?.geminiApiKey || process.env.API_KEY;
  const genAI = new GoogleGenerativeAI(key);

  return genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    safetySettings
  });
};
