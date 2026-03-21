import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
import { getChatModel as getUnifiedChatModel } from './aiProvider.js';

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

export const getChatModel = async () =>
  getUnifiedChatModel(
    'You are an AI assistant for an educational platform. You answer questions about course materials (theory, videos, images) in a concise, accurate, and teaching manner. Use markdown.'
  );
