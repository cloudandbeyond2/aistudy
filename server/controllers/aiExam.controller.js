import { generateAIText } from '../config/aiProvider.js';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';

/**
 * AI EXAM GENERATION
 */
const buildFallbackExam = (
  mainTopic,
  subtopicsString,
  lang = 'English',
  excludeQuestionTexts = [],
  questionCount = 20
) => {
  const topics = String(subtopicsString || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const uniqueTopics = [...new Set(topics)];
  const fallbackTopics = uniqueTopics.length > 0 ? uniqueTopics : [mainTopic || 'Core topic'];
  const blockedQuestions = new Set(
    (Array.isArray(excludeQuestionTexts) ? excludeQuestionTexts : [])
      .map((item) => String(item || '').trim().toLowerCase())
      .filter(Boolean)
  );
  const templates = [
    (subtopic) => ({
      question: `Which option best represents the main focus of "${subtopic}" in ${mainTopic}?`,
      correct: `Understanding the purpose and workflow of ${subtopic}`,
      distractors: [
        `Ignoring ${subtopic} while studying ${mainTopic}`,
        `Memorizing only unrelated facts outside ${mainTopic}`,
        `Skipping the practical use of ${subtopic}`
      ]
    }),
    (subtopic) => ({
      question: `When reviewing "${subtopic}", what should a learner mainly look for?`,
      correct: `Key ideas, application steps, and examples connected to ${subtopic}`,
      distractors: [
        `Only course pricing and enrollment details`,
        `Only certificate design and branding`,
        `Only random facts unrelated to ${mainTopic}`
      ]
    }),
    (subtopic) => ({
      question: `Which outcome shows that "${subtopic}" has been understood correctly?`,
      correct: `The learner can explain and apply ${subtopic} in a practical ${mainTopic} scenario`,
      distractors: [
        `The learner avoids using ${subtopic} completely`,
        `The learner focuses only on unrelated tools`,
        `The learner skips examples and practice`
      ]
    }),
    (subtopic) => ({
      question: `In a real exam situation, why is "${subtopic}" important within ${mainTopic}?`,
      correct: `${subtopic} supports practical reasoning and applied problem solving in ${mainTopic}`,
      distractors: [
        `${subtopic} is useful only for course marketing`,
        `${subtopic} has no connection to practical understanding`,
        `${subtopic} should be ignored during revision`
      ]
    }),
    (subtopic) => ({
      question: `Which revision method is best for mastering "${subtopic}" in ${mainTopic}?`,
      correct: `Reviewing concepts, practicing examples, and testing applied understanding of ${subtopic}`,
      distractors: [
        `Skipping all exercises related to ${subtopic}`,
        `Studying only unrelated external trivia`,
        `Memorizing random definitions without context`
      ]
    })
  ];

  const items = [];
  let index = 0;
  let safetyCounter = 0;
  while (items.length < questionCount && safetyCounter < questionCount * 50) {
    const subtopic = fallbackTopics[index % fallbackTopics.length];
    const template = templates[index % templates.length](subtopic);
    const questionText =
      index < fallbackTopics.length
        ? template.question
        : `${template.question} Variant ${Math.floor(index / fallbackTopics.length) + 1}`;

    if (blockedQuestions.has(questionText.trim().toLowerCase())) {
      index += 1;
      safetyCounter += 1;
      continue;
    }

    const options = [template.correct, ...template.distractors].sort(() => Math.random() - 0.5);
    items.push({
      id: items.length + 1,
      question: `${questionText} (${lang})`,
      options,
      answer: template.correct
    });
    index += 1;
    safetyCounter += 1;
  }

  if (items.length === 0) {
    throw new Error('Fallback exam generation failed');
  }

  while (items.length < questionCount) {
    const baseItem = items[items.length % items.length];
    items.push({
      ...baseItem,
      id: items.length + 1,
      question: `${baseItem.question} Extra ${items.length + 1}`
    });
  }

  return items;
};

const normalizeGeneratedExam = (examData = []) =>
  (Array.isArray(examData) ? examData : []).map((q, index) => {
    const shuffledOptions = Array.isArray(q?.options) ? [...q.options].sort(() => Math.random() - 0.5) : [];

    return {
      id: index + 1,
      question: q?.question || `Question ${index + 1}`,
      options: shuffledOptions,
      answer: q?.correctAnswer || q?.answer || shuffledOptions[0] || ''
    };
  });

const QUIZ_RESPONSE_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      options: {
        type: 'array',
        items: { type: 'string' }
      },
      correctAnswer: { type: 'string' }
    },
    required: ['question', 'options', 'correctAnswer']
  }
};

const stripCodeFences = (text = '') =>
  String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

const extractTopLevelJsonArray = (text = '') => {
  const source = stripCodeFences(text);
  const start = source.indexOf('[');
  if (start < 0) return source;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  return source.slice(start);
};

const sanitizeJsonLikeString = (text = '') => {
  const input = extractTopLevelJsonArray(text);
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inString) {
      if (escaped) {
        output += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        output += char;
        escaped = true;
        continue;
      }

      if (char === '\r') {
        continue;
      }

      if (char === '\n') {
        output += '\\n';
        continue;
      }

      if (char === '"') {
        let j = i + 1;
        while (j < input.length && /\s/.test(input[j])) j += 1;

        const likelyStringTerminator =
          j >= input.length ||
          [',', '}', ']', ':'].includes(input[j]);

        if (likelyStringTerminator) {
          inString = false;
          output += char;
        } else {
          output += '\\"';
        }
        continue;
      }

      output += char;
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if ((char === ',' || char === '}') && next && /[\]}]/.test(next)) {
      output += char;
      continue;
    }

    output += char;
  }

  return output.trim();
};

const isValidGeneratedQuestion = (item) =>
  !!item &&
  typeof item.question === 'string' &&
  item.question.trim().length > 0 &&
  Array.isArray(item.options) &&
  item.options.length >= 2 &&
  item.options.every((option) => typeof option === 'string' && option.trim().length > 0) &&
  typeof (item.correctAnswer || item.answer) === 'string' &&
  String(item.correctAnswer || item.answer).trim().length > 0;

const salvageQuestionsFromPartialArray = (rawText = '') => {
  const source = sanitizeJsonLikeString(rawText);
  const start = source.indexOf('[');
  if (start < 0) return [];

  const salvaged = [];
  let objectStart = -1;
  let objectDepth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (objectDepth === 0) {
        objectStart = i;
      }
      objectDepth += 1;
      continue;
    }

    if (char === '}') {
      if (objectDepth > 0) {
        objectDepth -= 1;
        if (objectDepth === 0 && objectStart >= 0) {
          const candidate = source.slice(objectStart, i + 1);
          try {
            const parsed = JSON.parse(candidate);
            if (isValidGeneratedQuestion(parsed)) {
              salvaged.push(parsed);
            }
          } catch {
            // Ignore malformed partial objects and keep scanning.
          }
          objectStart = -1;
        }
      }
    }
  }

  return salvaged;
};

const parseGeneratedExamResponse = (rawText = '') => {
  const candidates = [
    stripCodeFences(rawText),
    extractTopLevelJsonArray(rawText),
    sanitizeJsonLikeString(rawText)
  ].filter(Boolean);

  let lastError = null;
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      lastError = error;
    }
  }

  const salvaged = salvageQuestionsFromPartialArray(rawText);
  if (salvaged.length > 0) {
    return salvaged;
  }

  const preview = String(rawText || '').slice(0, 500);
  throw new Error(
    `Invalid quiz JSON returned from AI provider. ${lastError?.message || 'Unknown parse error'}. Preview: ${preview}`
  );
};

const buildQuizPrompt = ({
  mainTopic,
  subtopicsString,
  lang = 'English',
  blockedQuestions = [],
  questionCount = 20,
  compact = false
}) => `Generate ${questionCount} multiple choice questions about ${mainTopic} including these subtopics: ${subtopicsString}. The language should be ${lang || 'English'}.
CRITICAL: Randomize the correct answer position.
CRITICAL: Do not repeat or closely paraphrase any previous question from the blocked list.
CRITICAL: Prefer fresh scenarios, new wording, and different correct-answer phrasing for each retake.
${compact ? 'CRITICAL: Keep each question and option concise. Avoid long explanations inside options.' : ''}

Blocked previous questions:
${blockedQuestions.length > 0 ? blockedQuestions.map((item, index) => `${index + 1}. ${item}`).join('\n') : 'None'}

Return ONLY a raw JSON array (no markdown, no code blocks) with this exact format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option C"
  }
]
IMPORTANT: "correctAnswer" must match exactly one of the strings in "options".`;

export const generateQuizQuestionSet = async ({
  mainTopic,
  subtopicsString,
  lang = 'English',
  excludeQuestionTexts = [],
  questionCount = 20
}) => {
  const cleanedExcludedQuestions = (Array.isArray(excludeQuestionTexts) ? excludeQuestionTexts : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 30);

  const safetySettings = [
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

  try {
    const { text: rawText, usage } = await generateAIText({
      prompt: buildQuizPrompt({
        mainTopic,
        subtopicsString,
        lang,
        blockedQuestions: cleanedExcludedQuestions,
        questionCount
      }),
      responseMimeType: 'application/json',
      responseSchema: QUIZ_RESPONSE_SCHEMA,
      maxOutputTokens: 8192,
      safetySettings
    });

    console.log(`--- AI TOKEN USAGE (Quiz - Initial) ---`);
    console.log(`Provider: ${usage.provider} | Prompt: ${usage.promptTokens} | Completion: ${usage.completionTokens} | Total: ${usage.totalTokens}`);

    let text = stripCodeFences(rawText);
    let examData = normalizeGeneratedExam(parseGeneratedExamResponse(text));
    let totalUsage = usage;

    if (examData.length < questionCount) {
      const missingCount = questionCount - examData.length;
      const retryBlockedQuestions = [
        ...cleanedExcludedQuestions,
        ...examData.map((item) => item.question)
      ].slice(0, 50);

      try {
        const { text: rawRetryText, usage: retryUsage } = await generateAIText({
          prompt: buildQuizPrompt({
            mainTopic,
            subtopicsString,
            lang,
            blockedQuestions: retryBlockedQuestions,
            questionCount: missingCount,
            compact: true
          }),
          responseMimeType: 'application/json',
          responseSchema: QUIZ_RESPONSE_SCHEMA,
          maxOutputTokens: 4096,
          safetySettings
        });

        console.log(`--- AI TOKEN USAGE (Quiz - Retry) ---`);
        console.log(`Provider: ${retryUsage.provider} | Prompt: ${retryUsage.promptTokens} | Completion: ${retryUsage.completionTokens} | Total: ${retryUsage.totalTokens}`);

        totalUsage = {
          promptTokens: usage.promptTokens + retryUsage.promptTokens,
          completionTokens: usage.completionTokens + retryUsage.completionTokens,
          totalTokens: usage.totalTokens + retryUsage.totalTokens
        };

        let retryText = stripCodeFences(rawRetryText);
        const retryData = normalizeGeneratedExam(parseGeneratedExamResponse(retryText));
        examData = [...examData, ...retryData];
      } catch (retryError) {
        console.warn('generateQuizQuestionSet partial recovery retry failed:', retryError?.message || retryError);
      }
    }

    if (examData.length >= questionCount) {
      return { questions: examData.slice(0, questionCount), usage: totalUsage };
    }

    const generatedQuestionTexts = examData.map((item) => item.question);
    const fallbackSupplement = buildFallbackExam(
      mainTopic,
      subtopicsString,
      lang,
      [...excludeQuestionTexts, ...generatedQuestionTexts],
      questionCount - examData.length
    );

    return { questions: [...examData, ...fallbackSupplement].slice(0, questionCount), usage: totalUsage };
  } catch (e) {
    console.error('generateQuizQuestionSet fallback triggered:', e);
    const fallbackExam = buildFallbackExam(mainTopic, subtopicsString, lang, excludeQuestionTexts, questionCount);
    if (fallbackExam.length > 0) {
      return { questions: fallbackExam, usage: null };
    }

    throw new Error('Failed to generate quiz question set');
  }
};

export const generateAIExam = async (req, res) => {
  const { mainTopic, subtopicsString, lang, excludeQuestionTexts = [], questionCount = 20 } = req.body;

  try {
    const { questions, usage } = await generateQuizQuestionSet({
      mainTopic,
      subtopicsString,
      lang,
      excludeQuestionTexts,
      questionCount
    });

    res.json({
      success: true,
      questions,
      usage
    });
  } catch (error) {
    console.error('AI exam error:', error);
    const fallbackExam = buildFallbackExam(mainTopic, subtopicsString, lang, excludeQuestionTexts, questionCount);
    if (fallbackExam.length > 0) {
      return res.json({
        success: true,
        fallback: true,
        message: JSON.stringify(fallbackExam)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate exam',
      error: error.message
    });
  }
};
