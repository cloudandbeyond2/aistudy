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
  questionCount = 30
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

export const generateQuizQuestionSet = async ({
  mainTopic,
  subtopicsString,
  lang = 'English',
  excludeQuestionTexts = [],
  questionCount = 30
}) => {
  const cleanedExcludedQuestions = (Array.isArray(excludeQuestionTexts) ? excludeQuestionTexts : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 30);

  const prompt = `Generate ${questionCount} multiple choice questions about ${mainTopic} including these subtopics: ${subtopicsString}. The language should be ${lang || 'English'}. 
CRITICAL: Randomize the correct answer position.
CRITICAL: Do not repeat or closely paraphrase any previous question from the blocked list.
CRITICAL: Prefer fresh scenarios, new wording, and different correct-answer phrasing for each retake.

Blocked previous questions:
${cleanedExcludedQuestions.length > 0 ? cleanedExcludedQuestions.map((item, index) => `${index + 1}. ${item}`).join('\n') : 'None'}

Return ONLY a raw JSON array (no markdown, no code blocks) with this exact format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option C"
  }
]
IMPORTANT: "correctAnswer" must match exactly one of the strings in "options".`;

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
    let text = await generateAIText({
      prompt,
      maxOutputTokens: 4096,
      safetySettings
    });

    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const examData = normalizeGeneratedExam(JSON.parse(text));
    if (examData.length >= questionCount) {
      return examData.slice(0, questionCount);
    }

    const generatedQuestionTexts = examData.map((item) => item.question);
    const fallbackSupplement = buildFallbackExam(
      mainTopic,
      subtopicsString,
      lang,
      [...excludeQuestionTexts, ...generatedQuestionTexts],
      questionCount - examData.length
    );

    return [...examData, ...fallbackSupplement].slice(0, questionCount);
  } catch (e) {
    console.error('generateQuizQuestionSet fallback triggered:', e);
    const fallbackExam = buildFallbackExam(mainTopic, subtopicsString, lang, excludeQuestionTexts, questionCount);
    if (fallbackExam.length > 0) {
      return fallbackExam;
    }

    throw new Error('Failed to generate quiz question set');
  }
};

export const generateAIExam = async (req, res) => {
  const { mainTopic, subtopicsString, lang, excludeQuestionTexts = [], questionCount = 30 } = req.body;

  try {
    const fs = await import('fs');
    fs.writeFileSync(
      'debug_req.json',
      JSON.stringify(req.body, null, 2)
    );
  } catch (e) {
    console.error('Log error', e);
  }

  try {
    const examData = await generateQuizQuestionSet({
      mainTopic,
      subtopicsString,
      lang,
      excludeQuestionTexts,
      questionCount
    });

    res.json({
      success: true,
      message: JSON.stringify(examData)
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
