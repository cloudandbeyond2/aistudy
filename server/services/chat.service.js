import showdown from 'showdown';
import { getChatModel } from '../config/genai.js';

const converter = new showdown.Converter();

export const generateChatResponse = async (prompt) => {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  const chatModel = await getChatModel();
  const result = await chatModel.generateContent(prompt);
  const response = result.response;
  const text = await response.text();

  return {
    html: converter.makeHtml(text),
    usage: response.usageMetadata ? {
      promptTokens: response.usageMetadata.promptTokenCount,
      completionTokens: response.usageMetadata.candidatesTokenCount,
      totalTokens: response.usageMetadata.totalTokenCount,
      provider: 'gemini'
    } : null
  };
};
