import retryWithBackoff from '../utils/retryWithBackoff.js';
import genAI from '../config/gemini.js';
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

  const prompt = `Generate 20 multiple choice questions about ${mainTopic} including these subtopics: ${subtopicsString}. The language should be ${lang || 'English'
    }. 
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

    let examData;
    try {
      examData = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error:", text);
      throw new Error('Invalid JSON format received from AI');
    }

    // Process questions: Shuffle options and ensure answer key is set
    examData = examData.map((q, index) => {
      // Normalize options to objects for internal consistency (optional, but good for id assignment later in frontend)
      // Actually frontend handles strings. Let's just shuffle the strings.

      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

      return {
        id: index + 1,
        question: q.question,
        options: shuffledOptions, // Frontend will map these to {id: 'a', text: '...'}
        answer: q.correctAnswer // Pass the text directly
      };
    });

    res.json({
      success: true,
      message: JSON.stringify(examData)
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
