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

const normalizeGeminiModel = (model) => {
  const normalized = typeof model === 'string' ? model.trim().replace(/^models\//i, '') : '';
  if (!normalized) return DEFAULT_GEMINI_MODEL;

  const legacyAliases = new Set([
    'gemini-2.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-latest'
  ]);

  return legacyAliases.has(normalized) ? DEFAULT_GEMINI_MODEL : normalized;
};

const isGeminiModelNotFoundError = (error) => {
  const message = error?.message?.toLowerCase?.() || '';
  const status = error?.status;

  return (
    status === 404 ||
    (message.includes('404') &&
      (message.includes('model') || message.includes('generatecontent'))) ||
    message.includes('model is not found') ||
    message.includes('models/') ||
    message.includes('not found') ||
    message.includes('unsupported model')
  );
};

const isGeminiServiceUnavailable = (error) => {
  const message = error?.message?.toLowerCase?.() || '';
  const status = error?.status;
  
  return (
    status === 503 ||
    message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('high demand') ||
    message.includes('temporary') ||
    message.includes('busy') ||
    message.includes('overloaded')
  );
};

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
    status === 404 ||
    status === 429 ||
    status === 503 ||
    status >= 500 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('api key') ||
    message.includes('model unavailable') ||
    message.includes('not found') ||
    message.includes('unsupported model') ||
    message.includes('missing gemini') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('high demand') ||
    message.includes('service unavailable')
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
    status === 503 ||
    status >= 500 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('api key') ||
    message.includes('model') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('high demand') ||
    message.includes('service unavailable')
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
    const sanitizeSchemaForOpenAI = (schema) => {
      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return schema;
      }

      const normalized = { ...schema };

      if (normalized.type === 'object') {
        normalized.additionalProperties = false;
      }

      if (normalized.properties && typeof normalized.properties === 'object') {
        normalized.properties = Object.fromEntries(
          Object.entries(normalized.properties).map(([key, value]) => [
            key,
            sanitizeSchemaForOpenAI(value)
          ])
        );
      }

      if (normalized.items) {
        normalized.items = sanitizeSchemaForOpenAI(normalized.items);
      }

      if (Array.isArray(normalized.anyOf)) {
        normalized.anyOf = normalized.anyOf.map(sanitizeSchemaForOpenAI);
      }

      if (Array.isArray(normalized.oneOf)) {
        normalized.oneOf = normalized.oneOf.map(sanitizeSchemaForOpenAI);
      }

      if (Array.isArray(normalized.allOf)) {
        normalized.allOf = normalized.allOf.map(sanitizeSchemaForOpenAI);
      }

      return normalized;
    };

    return {
      type: 'json_schema',
      json_schema: {
        name: 'structured_output',
        strict: true,
        schema: sanitizeSchemaForOpenAI(responseSchema)
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
  maxOutputTokens = 8192,
  retryAttempts = 2
}) => {
  const settings = await getAISettings();
  if (!settings.openaiApiKey) {
    const error = new Error('Missing OpenAI API Key. Please configure it in settings.');
    error.status = 401;
    throw error;
  }

  let lastError = null;
  
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
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

      let response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify(body)
      });

      let data = await parseJsonSafely(response);
      
      if (!response.ok) {
        const message = data?.error?.message || data?.raw || 'OpenAI API request failed.';
        const canRetryWithoutSchema =
          response.status === 400 &&
          responseMimeType === 'application/json' &&
          !!responseSchema &&
          (
            message.toLowerCase().includes('json_schema') ||
            message.toLowerCase().includes('response_format') ||
            message.toLowerCase().includes('schema') ||
            message.toLowerCase().includes('additionalproperties')
          );

        if (canRetryWithoutSchema) {
          const fallbackBody = {
            ...body,
            response_format: { type: 'json_object' }
          };

          response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${settings.openaiApiKey}`
            },
            body: JSON.stringify(fallbackBody)
          });

          data = await parseJsonSafely(response);
        }
      }

      if (!response.ok) {
        const error = new Error(data?.error?.message || data?.raw || 'OpenAI API request failed.');
        error.status = response.status;
        throw error;
      }

      const content = data?.choices?.[0]?.message?.content;
      const usage = data?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      
      let text = '';
      if (Array.isArray(content)) {
        text = cleanText(content.map((item) => item.text || '').join(''));
      } else {
        text = cleanText(content || '');
      }

      return {
        text,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          provider: 'openai'
        }
      };
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      const isNonRetryable = error.status === 401 || error.status === 403;
      if (isNonRetryable || attempt === retryAttempts) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`OpenAI retry ${attempt + 1} after ${delay}ms due to: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

const generateWithGemini = async ({
  prompt,
  systemInstruction,
  responseMimeType,
  responseSchema,
  maxOutputTokens = 8192,
  safetySettings,
  retryAttempts = 3
}) => {
  const settings = await getAISettings();
  const genAI = await getGenAI();
  const configuredModel = normalizeGeminiModel(settings.geminiModel);
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const modelOptions = {
        model: configuredModel
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

      const runWithModel = async (modelName) => {
        const model = genAI.getGenerativeModel({
          ...modelOptions,
          model: modelName
        });
        const result = await retryWithBackoff(() => model.generateContent(prompt));
        const response = await result.response;
        const metadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
        
        return {
          text: cleanText(await response.text()),
          usage: {
            promptTokens: metadata.promptTokenCount,
            completionTokens: metadata.candidatesTokenCount,
            totalTokens: metadata.totalTokenCount,
            provider: 'gemini'
          }
        };
      };

      try {
        return await runWithModel(configuredModel);
      } catch (error) {
        if (configuredModel !== DEFAULT_GEMINI_MODEL && isGeminiModelNotFoundError(error)) {
          console.warn(
            `Gemini model "${configuredModel}" is unavailable. Retrying with fallback "${DEFAULT_GEMINI_MODEL}".`
          );
          return runWithModel(DEFAULT_GEMINI_MODEL);
        }
        throw error;
      }
      
    } catch (error) {
      lastError = error;
      
      // Check if this is a service unavailable error (503/high demand)
      const isServiceUnavailable = isGeminiServiceUnavailable(error);
      
      if (isServiceUnavailable && attempt < retryAttempts) {
        // Exponential backoff with longer delays for service unavailable
        const delay = Math.min(2000 * Math.pow(2, attempt), 15000);
        console.log(`Gemini service unavailable (attempt ${attempt + 1}/${retryAttempts + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry on certain errors
      const isNonRetryable = error.status === 401 || error.status === 403;
      if (isNonRetryable || attempt === retryAttempts) {
        throw error;
      }
      
      // Exponential backoff for other errors
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`Gemini retry ${attempt + 1} after ${delay}ms due to: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const generateAIText = async (options) => {
  const settings = await getAISettings();
  
  // Track if we've already tried fallback to prevent infinite loops
  let attemptedFallback = false;
  
  const tryWithFallback = async (primaryProvider, fallbackProvider) => {
    try {
      if (primaryProvider === 'openai') {
        return await generateWithOpenAI(options);
      } else {
        return await generateWithGemini(options);
      }
    } catch (error) {
      // If we haven't tried fallback yet and conditions are right, try fallback
      if (!attemptedFallback) {
        const shouldFallback = primaryProvider === 'openai' 
          ? shouldFallbackToGemini(settings, error)
          : shouldFallbackToOpenAI(settings, error);
        
        if (shouldFallback) {
          attemptedFallback = true;
          console.warn(`${primaryProvider === 'openai' ? 'OpenAI' : 'Gemini'} failed (${error.message}), falling back to ${fallbackProvider === 'openai' ? 'OpenAI' : 'Gemini'}...`);
          
          try {
            if (fallbackProvider === 'openai') {
              return await generateWithOpenAI(options);
            } else {
              return await generateWithGemini(options);
            }
          } catch (fallbackError) {
            console.error(`Fallback to ${fallbackProvider === 'openai' ? 'OpenAI' : 'Gemini'} also failed:`, fallbackError.message);
            // Throw the original error if fallback also fails
            throw error;
          }
        }
      }
      throw error;
    }
  };
  
  if (settings.provider === 'openai') {
    return tryWithFallback('openai', 'gemini');
  }
  
  return tryWithFallback('gemini', 'openai');
};

export const chatWithAI = async ({
  messages,
  context,
  systemInstruction,
  maxOutputTokens = 4096
}) => {
  const settings = await getAISettings();
  let attemptedFallback = false;

  const tryChatWithFallback = async (primaryProvider, fallbackProvider) => {
    try {
      if (primaryProvider === 'openai') {
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

        const usage = data?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

        return {
          text: cleanText(data?.choices?.[0]?.message?.content || ''),
          usage: {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
            provider: 'openai'
          }
        };
      } else {
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
        const response = await result.response;
        const metadata = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
        
        return {
          text: cleanText(await response.text()),
          usage: {
            promptTokens: metadata.promptTokenCount,
            completionTokens: metadata.candidatesTokenCount,
            totalTokens: metadata.totalTokenCount,
            provider: 'gemini'
          }
        };
      }
    } catch (error) {
      if (!attemptedFallback) {
        const shouldFallback = primaryProvider === 'openai'
          ? shouldFallbackToGemini(settings, error)
          : shouldFallbackToOpenAI(settings, error);
        
        if (shouldFallback) {
          attemptedFallback = true;
          console.warn(`${primaryProvider === 'openai' ? 'OpenAI' : 'Gemini'} chat failed (${error.message}), falling back to ${fallbackProvider === 'openai' ? 'OpenAI' : 'Gemini'}...`);
          return tryChatWithFallback(fallbackProvider, primaryProvider);
        }
      }
      throw error;
    }
  };

  if (settings.provider === 'openai') {
    return tryChatWithFallback('openai', 'gemini');
  }
  
  return tryChatWithFallback('gemini', 'openai');
};

export const getChatModel = async (systemInstruction) => ({
  generateContent: async (prompt) => {
    const { text, usage } = await generateAIText({
      prompt,
      systemInstruction,
      maxOutputTokens: 4096
    });

    console.log(`--- AI TOKEN USAGE (Chat Fallback) ---`);
    console.log(`Provider: ${usage.provider} | Prompt: ${usage.promptTokens} | Completion: ${usage.completionTokens} | Total: ${usage.totalTokens}`);

    return {
      response: {
        text: () => text
      }
    };
  }
});
