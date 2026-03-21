import { getGenAI } from './gemini.js';
import Admin from '../models/Admin.js';
import retryWithBackoff from '../utils/retryWithBackoff.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const cleanText = (value) =>
  typeof value === 'string'
    ? value.replace(/```json/g, '').replace(/```/g, '').trim()
    : '';

const parseJsonSafely = async (response) => {
  const raw = await response.text();

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
};

const shouldFallbackToOpenAI = (settings, error) => {
  if (settings.provider !== 'gemini') return false;
  if (!settings.openaiApiKey) return false;

  const message = error?.message?.toLowerCase?.() || '';
  const status = error?.status;

  return (
    status === 401 ||
    status === 403 ||
    status === 429 ||
    status >= 500 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('api key') ||
    message.includes('model unavailable') ||
    message.includes('missing gemini') ||
    message.includes('network') ||
    message.includes('fetch')
  );
};

const shouldFallbackToGemini = (settings, error) => {
  if (settings.provider !== 'openai') return false;
  if (!settings.geminiApiKey) return false;

  const message = error?.message?.toLowerCase?.() || '';
  const status = error?.status;

  return (
    status === 401 ||
    status === 403 ||
    status === 429 ||
    status >= 500 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('api key') ||
    message.includes('model') ||
    message.includes('network') ||
    message.includes('fetch')
  );
};

export const getAISettings = async () => {
  const admin = await Admin.findOne({ type: 'main' });

  return {
    provider: admin?.aiProvider || 'gemini',
    geminiApiKey: admin?.geminiApiKey || process.env.API_KEY || '',
    geminiModel: admin?.geminiModel || DEFAULT_GEMINI_MODEL,
    openaiApiKey: admin?.openaiApiKey || process.env.OPENAI_API_KEY || '',
    openaiModel: admin?.openaiModel || DEFAULT_OPENAI_MODEL
  };
};

const buildOpenAIResponseFormat = (responseMimeType, responseSchema) => {
  if (responseMimeType === 'application/json' && responseSchema) {
    return {
      type: 'json_schema',
      json_schema: {
        name: 'structured_output',
        strict: true,
        schema: responseSchema
      }
    };
  }

  if (responseMimeType === 'application/json') {
    return { type: 'json_object' };
  }

  return undefined;
};

const generateWithOpenAI = async ({
  prompt,
  systemInstruction,
  responseMimeType,
  responseSchema,
  maxOutputTokens = 8192
}) => {
  const settings = await getAISettings();
  if (!settings.openaiApiKey) {
    const error = new Error('Missing OpenAI API Key. Please configure it in settings.');
    error.status = 401;
    throw error;
  }

  const body = {
    model: settings.openaiModel,
    messages: [
      ...(systemInstruction ? [{ role: 'developer', content: systemInstruction }] : []),
      { role: 'user', content: prompt }
    ],
    max_tokens: maxOutputTokens
  };

  const responseFormat = buildOpenAIResponseFormat(responseMimeType, responseSchema);
  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.openaiApiKey}`
    },
    body: JSON.stringify(body)
  });

  const data = await parseJsonSafely(response);
  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.raw || 'OpenAI API request failed.');
    error.status = response.status;
    throw error;
  }

  const content = data?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    return cleanText(content.map((item) => item.text || '').join(''));
  }

  return cleanText(content || '');
};

const generateWithGemini = async ({
  prompt,
  systemInstruction,
  responseMimeType,
  responseSchema,
  maxOutputTokens = 8192,
  safetySettings
}) => {
  const settings = await getAISettings();
  const genAI = await getGenAI();
  const modelOptions = {
    model: settings.geminiModel || DEFAULT_GEMINI_MODEL
  };

  if (systemInstruction) {
    modelOptions.systemInstruction = systemInstruction;
  }

  if (safetySettings) {
    modelOptions.safetySettings = safetySettings;
  }

  const generationConfig = { maxOutputTokens };
  if (responseMimeType) generationConfig.responseMimeType = responseMimeType;
  if (responseSchema) generationConfig.responseSchema = responseSchema;
  if (Object.keys(generationConfig).length) {
    modelOptions.generationConfig = generationConfig;
  }

  const model = genAI.getGenerativeModel(modelOptions);
  const result = await retryWithBackoff(() => model.generateContent(prompt));
  return cleanText(await result.response.text());
};

export const generateAIText = async (options) => {
  const settings = await getAISettings();
  if (settings.provider === 'openai') {
    try {
      return await generateWithOpenAI(options);
    } catch (error) {
      if (shouldFallbackToGemini(settings, error)) {
        console.warn('OpenAI failed, falling back to Gemini:', error.message);
        return generateWithGemini(options);
      }
      throw error;
    }
  }

  try {
    return await generateWithGemini(options);
  } catch (error) {
    if (shouldFallbackToOpenAI(settings, error)) {
      console.warn('Gemini failed, falling back to OpenAI:', error.message);
      return generateWithOpenAI(options);
    }
    throw error;
  }
};

export const chatWithAI = async ({
  messages,
  context,
  systemInstruction,
  maxOutputTokens = 4096
}) => {
  const settings = await getAISettings();

  if (settings.provider === 'openai') {
    try {
      if (!settings.openaiApiKey) {
        const error = new Error('Missing OpenAI API Key. Please configure it in settings.');
        error.status = 401;
        throw error;
      }

      const normalizedMessages = [
        ...(systemInstruction ? [{ role: 'developer', content: systemInstruction }] : []),
        ...(context ? [{ role: 'developer', content: `Context:\n${context}` }] : []),
        ...messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: settings.openaiModel,
          messages: normalizedMessages,
          max_tokens: maxOutputTokens
        })
      });

      const data = await parseJsonSafely(response);
      if (!response.ok) {
        const error = new Error(data?.error?.message || data?.raw || 'OpenAI API request failed.');
        error.status = response.status;
        throw error;
      }

      return cleanText(data?.choices?.[0]?.message?.content || '');
    } catch (error) {
      if (shouldFallbackToGemini(settings, error)) {
        console.warn('OpenAI chat failed, falling back to Gemini:', error.message);
      } else {
        throw error;
      }
    }
  }

  try {
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({
      model: settings.geminiModel || DEFAULT_GEMINI_MODEL
    });

    let promptPrefix = '';
    if (systemInstruction) {
      promptPrefix += `${systemInstruction}\n\n`;
    }
    if (context) {
      promptPrefix += `Use the following sources as context. If needed, you may supplement with general knowledge, but prioritize the context.\n\nContext:\n${context}\n\n`;
    }

    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    const chatSession = model.startChat({ history });
    const latestMessage = messages[messages.length - 1]?.content || '';
    const result = await chatSession.sendMessage(`${promptPrefix}${latestMessage}`);
    return cleanText(await result.response.text());
  } catch (error) {
    if (shouldFallbackToOpenAI(settings, error)) {
      console.warn('Gemini chat failed, falling back to OpenAI:', error.message);

      const normalizedMessages = [
        ...(systemInstruction ? [{ role: 'developer', content: systemInstruction }] : []),
        ...(context ? [{ role: 'developer', content: `Context:\n${context}` }] : []),
        ...messages.map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: settings.openaiModel,
          messages: normalizedMessages,
          max_tokens: maxOutputTokens
        })
      });

      const data = await parseJsonSafely(response);
      if (!response.ok) {
        const fallbackError = new Error(data?.error?.message || data?.raw || 'OpenAI API request failed.');
        fallbackError.status = response.status;
        throw fallbackError;
      }

      return cleanText(data?.choices?.[0]?.message?.content || '');
    }

    throw error;
  }
};

export const getChatModel = async (systemInstruction) => ({
  generateContent: async (prompt) => {
    const text = await generateAIText({
      prompt,
      systemInstruction,
      maxOutputTokens: 4096
    });

    return {
      response: {
        text: () => text
      }
    };
  }
});
