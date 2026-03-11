import { getGenAI } from '../config/gemini.js';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import { getPlanLimits, isPlanActive } from '../config/planLimits.js';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
import showdown from 'showdown';
import gis from 'g-i-s';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';
import { getUnsplashApi } from '../config/unsplash.js';



// export const generatePrompt = async (req, res) => {
//   const { prompt } = req.body;

//   const model = genAI.getGenerativeModel({
//     model: 'gemini-1.5-flash',
//     safetySettings: [
//       {
//         category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
//       },
//       {
//         category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//         threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
//       }
//     ]
//   });

//   try {
//     const result = await retryWithBackoff(() =>
//       model.generateContent(prompt)
//     );

//     const generatedText = await result.response.text();

//     res.json({ success: true, generatedText });
//   } catch (error) {
//     console.log('Gemini error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


export const generatePrompt = async (req, res) => {
  const { prompt } = req.body;

  try {
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: "You are an expert educational course architect. Design highly structured, coherent, and comprehensive course outlines.",
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            course_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtopics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        theory: { type: "string" },
                        youtube: { type: "string" },
                        image: { type: "string" },
                        done: { type: "boolean" }
                      },
                      required: ["title"]
                    }
                  }
                },
                required: ["title", "subtopics"]
              }
            }
          },
          required: ["course_topics"]
        }
      }
    });

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const generatedText = await result.response.text();

    res.status(200).json({
      success: true,
      generatedText
    });
  } catch (error) {
    const isRateLimit =
      error.message?.includes('429') ||
      error.message?.includes('quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Internal server error';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message ? `Gemini API Error: ${error.message}` : 'Invalid Gemini API Key or Model unavailable. Please verify it in settings.';
    } else if (isRateLimit) {
      status = 429;
      message = 'API rate limit or quota exceeded.';
    }

    res.status(status).json({
      success: false,
      message
    });
  }
};


/**
 * GENERATE BATCH SUBTOPIC CONTENT (all subtopics of a topic in ONE API call)
 */
export const generateBatchSubtopics = async (req, res) => {
  const { mainTopic, topicTitle, subtopics, lang, userId } = req.body;

  if (!mainTopic || !topicTitle || !subtopics || !subtopics.length) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: mainTopic, topicTitle, subtopics'
    });
  }

  // ── PLAN SUBTOPIC LIMIT CHECK ─────────────────────────────────────────────
  if (userId) {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      if (user) {
        const planType = user.type || 'free';
        const limits = getPlanLimits(planType);

        // Expiry check
        if (!isPlanActive(planType, user.subscriptionEnd)) {
          return res.status(403).json({
            success: false,
            message: 'Your subscription has expired. Please renew your plan.',
            planExpired: true
          });
        }

        // Subtopic count check
        if (subtopics.length > limits.maxSubtopics) {
          return res.status(403).json({
            success: false,
            message: `Your ${planType} plan allows a maximum of ${limits.maxSubtopics} subtopics per topic. Please upgrade your plan for more.`,
            subtopicLimitReached: true
          });
        }
      }
    } catch (planCheckErr) {
      console.log('Plan check error (non-blocking):', planCheckErr.message);
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
  ];

  const subtopicList = subtopics.map((s, i) => `${i + 1}. ${s}`).join('\n');

  const systemInstruction = `Strictly in ${lang || 'English'}, you are a specialized educational content writer. 
Your goal is to provide thorough, in-depth, and "large" explanations for course subtopics.
For each subtopic, provide a detailed explanation (approx 500-1000 words if possible) with rich examples and clear definitions.
Use valid HTML formatting for the "theory" field (paragraphs, bold text, lists).
Do NOT include images, external links, or additional resource suggestions.
ONLY respond with a valid JSON object.`;

  const prompt = `Course: "${mainTopic}"
Chapter: "${topicTitle}"

Generate comprehensive educational content for these subtopics:
${subtopicList}

Response Format (JSON):
{
  "subtopics": [
    { "title": "Subtopic Title", "theory": "Detailed HTML Content" }
  ]
}`;

  try {
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings,
      systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            subtopics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  theory: { type: "string" }
                },
                required: ["title", "theory"]
              }
            }
          },
          required: ["subtopics"]
        }
      }
    });

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const rawText = await result.response.text();

    const parsed = JSON.parse(rawText);

    res.status(200).json({
      success: true,
      subtopics: parsed.subtopics
    });

  } catch (error) {
    console.log('Batch generation error:', error);

    const isRateLimitError =
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Internal server error';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message ? `Gemini API Error: ${error.message}` : 'Invalid Gemini API Key or Model unavailable. Please verify it in settings.';
    } else if (isRateLimitError) {
      status = 429;
      message = 'API rate limit or quota exceeded. Please try again later.';
    }

    res.status(status).json({
      success: false,
      message,
      error: error.message
    });
  }
};


/**
 * GENERATE AI CONTENT (MARKDOWN → HTML)
 */
export const generateHtml = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required'
    });
  }

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
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings,
      systemInstruction: 'You are a helpful educational assistant. Provide thorough and interesting explanations with examples. Use markdown formatting.'
    });

    const result = await retryWithBackoff(() =>
      model.generateContent(prompt)
    );

    const markdown = await result.response.text();

    const converter = new showdown.Converter();
    const html = converter.makeHtml(markdown);

    res.status(200).json({
      success: true,
      generatedText: html
    });
  } catch (error) {
    console.log('Generate HTML error:', error);

    const isRateLimitError =
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Internal server error';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message ? `Gemini API Error: ${error.message}` : 'Invalid Gemini API Key or Model unavailable. Please verify it in settings.';
    } else if (isRateLimitError) {
      status = 429;
      message = 'API rate limit or quota exceeded. Please try again later.';
    }

    res.status(status).json({
      success: false,
      message,
      error: error.message
    });
  }
};

/**
 * GET IMAGE FROM UNSPLASH (WITH GOOGLE FALLBACK)
 */
export const generateImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required'
    });
  }

  try {
    const unsplash = await getUnsplashApi();
    if (unsplash) {
      const result = await unsplash.search.getPhotos({
        query: prompt,
        perPage: 1,
      });

      if (result.response && result.response.results.length > 0) {
        return res.status(200).json({
          success: true,
          url: result.response.results[0].urls.regular
        });
      }
    }

    // Fallback to GIS with unsplash.com constraint if API fails or no results
    gis(`${prompt} site:unsplash.com`, (error, results) => {
      if (error || !results || results.length === 0) {
        // Ultimate fallback: broad search
        gis(prompt, (err2, res2) => {
          if (err2 || !res2 || res2.length === 0) {
            return res.status(500).json({ success: false, message: 'Image search failed' });
          }
          res.status(200).json({ success: true, url: res2[0].url });
        });
        return;
      }

      res.status(200).json({
        success: true,
        url: results[0].url
      });
    });
  } catch (error) {
    console.error('Unsplash search error:', error);
    // Final fallback
    gis(prompt, (err, results) => {
      if (err || !results || results.length === 0) {
        return res.status(500).json({ success: false, message: 'Image search failed' });
      }
      res.status(200).json({ success: true, url: results[0].url });
    });
  }
};

/**
 * GET YOUTUBE VIDEO ID
 */
export const generateVideo = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required'
    });
  }

  try {
    const video = await youtubesearchapi.GetListByKeyword(
      prompt,
      false,
      1,
      [{ type: 'video' }]
    );

    if (!video?.items || video.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No videos found'
      });
    }

    const videoId = video.items[0].id;

    res.status(200).json({
      success: true,
      url: videoId
    });
  } catch (error) {
    console.log('YouTube search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


/**
 * GET YOUTUBE TRANSCRIPT
 */
// export const generateTranscript = async (req, res) => {
//   const { prompt } = req.body;

//   if (!prompt) {
//     return res.status(400).json({
//       success: false,
//       message: 'Video ID or URL is required'
//     });
//   }

//   try {
//     const transcript = await YoutubeTranscript.fetchTranscript(prompt);

//     res.status(200).json({
//       success: true,
//       transcript
//     });
//   } catch (error) {
//     console.log('Transcript error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch transcript'
//     });
//   }
// };


export const generateTranscript = async (req, res) => {
  const { prompt } = req.body;

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(prompt);

    res.status(200).json({
      success: true,
      transcript
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Transcript unavailable'
    });
  }
};

/**
 * GENERATE AI EXAM (MCQs)
 */
export const generateAIExam = async (req, res) => {
  const { courseId, mainTopic, subtopicsString, lang } = req.body;

  if (!mainTopic || !subtopicsString) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
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

    const genAI = await getGenAI();
    const systemInstruction = `Strictly in ${lang || 'English'}, you are an academic assessor.
Generate 10 high-quality multiple choice questions (MCQs) for the given course material.
Ensure questions cover all provided subtopics.
Each question must have 4 options and 1 correct answer (0-indexed).
ONLY respond with a valid JSON array.`;

    const prompt = `Course: "${mainTopic}"
Topics: ${subtopicsString}

Generate 10 MCQs in JSON format:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0
  }
]`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings,
      systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { type: "number" }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });

    const result = await retryWithBackoff(() =>
      model.generateContent(prompt)
    );

    const response = result.response;
    const text = await response.text();

    const cleanedText = text.trim();

    res.status(200).json({
      success: true,
      exam: cleanedText
    });

  } catch (error) {
    console.log('AI Exam Error:', error);

    const isRateLimitError =
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Failed to generate exam';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message ? `Gemini API Error: ${error.message}` : 'Invalid Gemini API Key or Model unavailable. Please verify it in settings.';
    } else if (isRateLimitError) {
      status = 429;
      message = 'API rate limit or quota exceeded. Please try again later.';
    }

    res.status(status).json({
      success: false,
      message,
      error: error.message
    });
  }
};
