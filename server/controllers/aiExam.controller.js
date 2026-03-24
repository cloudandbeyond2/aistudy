import { generateAIText } from '../config/aiProvider.js';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';

/**
 * AI EXAM GENERATION
 */
const buildFallbackExam = (mainTopic, subtopicsString, lang = 'English') => {
  const topics = String(subtopicsString || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const uniqueTopics = [...new Set(topics)];
  const fallbackTopics = uniqueTopics.length > 0 ? uniqueTopics : [mainTopic || 'Core topic'];
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
    })
  ];

  const items = fallbackTopics.slice(0, 20).map((subtopic, index) => {
    const template = templates[index % templates.length](subtopic);
    const options = [template.correct, ...template.distractors].sort(() => Math.random() - 0.5);
    return {
      id: index + 1,
      question: `${template.question} (${lang})`,
      options,
      answer: template.correct
    };
  });

  return items;
};

export const generateAIExam = async (req, res) => {
  const { mainTopic, subtopicsString, lang } = req.body;

  try {
    const fs = await import('fs');
    fs.writeFileSync(
      'debug_req.json',
      JSON.stringify(req.body, null, 2)
    );
  } catch (e) {
    console.error('Log error', e);
  }

  const prompt = `Generate 20 multiple choice questions about ${mainTopic} including these subtopics: ${subtopicsString}. The language should be ${lang || 'English'}. 
CRITICAL: Randomize the correct answer position.

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

    let examData;
    try {
      examData = JSON.parse(text);
    } catch (e) {
      console.error('JSON Parse Error:', text);
      throw new Error('Invalid JSON format received from AI');
    }

    examData = examData.map((q, index) => {
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

      return {
        id: index + 1,
        question: q.question,
        options: shuffledOptions,
        answer: q.correctAnswer
      };
    });

    res.json({
      success: true,
      message: JSON.stringify(examData)
    });
  } catch (error) {
    console.error('AI exam error:', error);
    const fallbackExam = buildFallbackExam(mainTopic, subtopicsString, lang);
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
