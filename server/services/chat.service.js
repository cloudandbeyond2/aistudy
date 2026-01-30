import showdown from 'showdown';
import { chatModel } from '../config/genai.js';

const converter = new showdown.Converter();

export const generateChatResponse = async (prompt) => {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  const result = await chatModel.generateContent(prompt);
  const response = result.response;
  const text = await response.text();

  return converter.makeHtml(text);
};
