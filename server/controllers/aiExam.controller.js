import retryWithBackoff from '../utils/retryWithBackoff.js';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';

/**
 * AI EXAM GENERATION
 */
export const generateAIExam = async (req, res) => {
  const { mainTopic, subtopicsString, lang } = req.body;

  // (Optional) Debug logging – safe to remove later
  try {
    const fs = await import('fs');
    fs.writeFileSync(
      'debug_req.json',
      JSON.stringify(req.body, null, 2)
    );
  } catch (e) {
    console.error('Log error', e);
  }

  const prompt = `Generate 10 multiple choice questions about ${mainTopic} including these subtopics: ${subtopicsString}. The language should be ${
    lang || 'English'
  }. Return ONLY a raw JSON array (no markdown, no code blocks) with this exact format:
[
  {
    "id": 1,
    "question": "Question text",
    "options": [
      { "id": "0", "text": "Option A" },
      { "id": "1", "text": "Option B" },
      { "id": "2", "text": "Option C" },
      { "id": "3", "text": "Option D" }
    ],
    "correctAnswer": "0"
  }
]
IMPORTANT: "correctAnswer" must match the option "id" exactly.`;

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
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      safetySettings
    });

    // ✅ reuse retryWithBackoff (important)
    const result = await retryWithBackoff(() =>
      model.generateContent(prompt)
    );

    let text = result.response.text();

    // Clean markdown if AI leaks it
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    if (!text.startsWith('[')) {
      throw new Error('Invalid JSON format received from AI');
    }

    res.json({
      success: true,
      message: text
    });
  } catch (error) {
    console.error('AI exam error:', error);

    const isRateLimit =
      error.message?.includes('429') ||
      error.message?.includes('quota');

    res.status(isRateLimit ? 429 : 500).json({
      success: false,
      message: isRateLimit
        ? 'AI rate limit exceeded. Please try again.'
        : 'Failed to generate exam',
      error: error.message
    });
  }
};
