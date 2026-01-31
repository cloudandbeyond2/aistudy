import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

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

export const chatModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  safetySettings
});
