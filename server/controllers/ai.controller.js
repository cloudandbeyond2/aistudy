import { getGenAI } from '../config/gemini.js';
import { generateAIText } from '../config/aiProvider.js';
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
//     model: 'gemini-2.5-flash',
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
  const { prompt, systemInstruction, responseMimeType, responseSchema } = req.body;

  try {
    const generatedText = await generateAIText({
      prompt,
      systemInstruction,
      responseMimeType,
      responseSchema,
      maxOutputTokens: 8192
    });

    console.log('--- AI RESPONSE SUCCESS ---');
    console.log('Generated Text length:', generatedText?.length || 0);

    res.status(200).json({
      success: true,
      generatedText
    });
  } catch (error) {
    const isRateLimit =
      error.status === 429 ||
      error.message?.includes('429') ||
      error.message?.includes('quota') ||
      error.message?.toLowerCase?.().includes('rate limit') ||
      error.message?.toLowerCase?.().includes('too many requests') ||
      error.message?.toLowerCase?.().includes('exceeded your current quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Internal server error';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message || 'Invalid AI provider configuration. Please verify it in settings.';
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
 * GENERATE BATCH SUBTOPIC CONTENT (multiple topics and their subtopics in ONE API call)
 */
export const generateBatchSubtopics = async (req, res) => {
  const { mainTopic, topicsList, lang, userId } = req.body;

  if (!mainTopic || !topicsList || !Array.isArray(topicsList) || !topicsList.length) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: mainTopic, topicsList'
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

        if (!isPlanActive(planType, user.subscriptionEnd)) {
          return res.status(403).json({
            success: false,
            message: 'Your subscription has expired. Please renew your plan.',
            planExpired: true
          });
        }

        // Validate each topic's subtopic count against limits
        for (const topic of topicsList) {
          if (topic.subtopics && topic.subtopics.length > limits.maxSubtopics) {
            return res.status(403).json({
              success: false,
              message: `Your ${planType} plan allows a maximum of ${limits.maxSubtopics} subtopics per topic.`,
              subtopicLimitReached: true
            });
          }
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

  const systemInstruction = `Strictly in ${lang || 'English'}, you are a specialized educational content writer. 
Your goal is to provide thorough, in-depth, and "large" explanations for course subtopics.
IMPORTANT: You MUST explicitly translate the 'topicTitle' and subtopic 'title' fields into ${lang || 'English'}, alongside the 'theory' content.
For each subtopic, provide a detailed explanation (approx 500-1000 words if possible) with rich examples and clear definitions.
Ensure every sentence is complete and the content doesn't cut off abruptly.
If providing code examples, ensure they are properly formatted with correct line breaks and indentation.
Use valid HTML formatting for the "theory" field (paragraphs, bold text, lists).
For business, sales, CRM, analytics, HR, marketing, operations, or management topics, include practical product-style examples such as dashboard concepts, KPI cards, pipeline views, report widgets, filters, tables, and workflow scenarios.
When relevant, explain what a dashboard would show, why each metric matters, and how a team would use it in real work.
When the lesson includes programming, commands, configuration, queries, or terminal examples, format them as proper multi-line HTML code blocks using <pre><code class="language-...">...</code></pre>.
Preserve indentation and line breaks inside code blocks.
Never place full code examples inside <p>, <li>, or inline <code> tags.
Do not overuse code examples for non-technical business topics unless the code is essential to the explanation.
Never output an empty <pre><code></code></pre> block.
If you mention an example, provide the full example content immediately after the label.
For conceptual business validation logic, CRM workflows, or dashboard rules, prefer readable pseudocode or numbered rule logic instead of SQL unless SQL is specifically necessary.
Do not truncate a section halfway through an example.
Do NOT include images, external links, or additional resource suggestions.
ONLY respond with a valid JSON object matching the requested schema.`;

  const responseSchema = {
    type: "object",
    properties: {
      topics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            topicTitle: { type: "string" },
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
          required: ["topicTitle", "subtopics"]
        }
      }
    },
    required: ["topics"]
  };

  const parseGeneratedJson = (rawText) => {
    const normalizedText = rawText?.trim();
    if (!normalizedText) {
      throw new Error('Empty JSON response from AI provider.');
    }

    const withoutCodeFence = normalizedText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    const jsonStart = withoutCodeFence.indexOf('{');
    const jsonEnd = withoutCodeFence.lastIndexOf('}');
    const jsonCandidate =
      jsonStart >= 0 && jsonEnd >= jsonStart
        ? withoutCodeFence.slice(jsonStart, jsonEnd + 1)
        : withoutCodeFence;

    try {
      return JSON.parse(jsonCandidate);
    } catch (parseError) {
      const preview = jsonCandidate.slice(0, 500);
      throw new Error(
        `Invalid JSON returned from AI provider. ${parseError.message}. Preview: ${preview}`
      );
    }
  };

  const buildSingleSubtopicPrompt = (topicTitle, subtopicTitle) => {
    return `Course: "${mainTopic}"

Generate comprehensive educational content for exactly one chapter and one subtopic.

Chapter: "${topicTitle}"
Subtopic: "${subtopicTitle}"

Requirements:
- Return content only for this one chapter and this one subtopic.
- Keep the same chapter title and subtopic title, translated into ${lang || 'English'} when needed.
- The "theory" field must contain complete HTML content and must not be cut off.

Response Format (JSON):
{
  "topics": [
    {
      "topicTitle": "${topicTitle}",
      "subtopics": [
        { "title": "${subtopicTitle}", "theory": "Detailed HTML Content" }
      ]
    }
  ]
}`;
  };

  try {
    const combinedTopics = [];

    for (const topic of topicsList) {
      const normalizedSubtopics = Array.isArray(topic?.subtopics)
        ? topic.subtopics.filter(Boolean)
        : [];

      const generatedTopic = {
        topicTitle: topic?.topicTitle || 'Untitled Topic',
        subtopics: []
      };

      for (const subtopicTitle of normalizedSubtopics) {
        const rawText = await generateAIText({
          prompt: buildSingleSubtopicPrompt(generatedTopic.topicTitle, subtopicTitle),
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          maxOutputTokens: 8192,
          safetySettings
        });

        const parsed = parseGeneratedJson(rawText);
        const parsedTopic = Array.isArray(parsed?.topics) ? parsed.topics[0] : null;
        const parsedSubtopic = Array.isArray(parsedTopic?.subtopics)
          ? parsedTopic.subtopics[0]
          : null;

        generatedTopic.topicTitle =
          parsedTopic?.topicTitle?.trim() || generatedTopic.topicTitle;

        generatedTopic.subtopics.push({
          title: parsedSubtopic?.title?.trim() || subtopicTitle,
          theory: parsedSubtopic?.theory?.trim() || ''
        });
      }

      combinedTopics.push(generatedTopic);
    }

    res.status(200).json({
      success: true,
      topics: combinedTopics
    });

  } catch (error) {
    console.log('Batch generation error:', error);
    const isRateLimitError = error.message?.includes('429') || error.message?.includes('quota');
    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404');

    let status = 500;
    let message = 'Internal server error';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = 'Invalid AI provider configuration.';
    } else if (isRateLimitError) {
      status = 429;
      message = 'API rate limit or quota exceeded.';
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
      error.status === 429 ||
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('quota') ||
      error.message?.toLowerCase?.().includes('rate limit') ||
      error.message?.toLowerCase?.().includes('exceeded your current quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Internal server error';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message || 'Invalid AI provider configuration. Please verify it in settings.';
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
    let searchPrompt = prompt;
    try {
      const genAI = await getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const transResult = await model.generateContent(`Translate the following search query into brief English keywords for an image search engine. Give me only the translated keywords, with no extra text or explanation: "${prompt}"`);
      const engPrompt = await transResult.response.text();
      if (engPrompt && engPrompt.trim()) {
        searchPrompt = engPrompt.trim().replace(/^["']|["']$/g, '');
        console.log(`🖼️ Translated image prompt from "${prompt}" to "${searchPrompt}"`);
      }
    } catch (e) {
      console.log('Image prompt English translation failed, using original prompt');
    }

    // Clean and optimize the prompt for better search results
    const cleanedPrompt = searchPrompt.replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 80);

    const unsplash = await getUnsplashApi();
    if (unsplash) {
      const result = await unsplash.search.getPhotos({
        query: cleanedPrompt,
        perPage: 3,
        orientation: 'landscape',
        contentFilter: 'high',
      });

      if (result.errors) {
        console.error('❌ Unsplash API Error:', result.errors);
        if (result.errors.some(e => e.toLowerCase().includes('invalid') || e.toLowerCase().includes('oauth'))) {
          console.warn('⚠️  CRITICAL: Unsplash Access Token is INVALID. Please update it in Admin Settings or .env file.');
        }
      } else if (
        result &&
        result.response &&
        Array.isArray(result.response.results) &&
        result.response.results.length > 0
      ) {
        // Pick the most relevant result (first one from Unsplash is usually best)
        return res.status(200).json({
          success: true,
          url: result.response.results[0].urls.regular
        });
      }
    }

    // --- NEW: YouTube Thumbnail Fallback ---
    console.log(`🔍 Unsplash failed. Trying YouTube Thumbnail fallback for: "${cleanedPrompt}"`);
    try {
      const ytResults = await youtubesearchapi.GetListByKeyword(cleanedPrompt, false, 3);
      if (ytResults && ytResults.items && ytResults.items.length > 0) {
        // Find the first item with a valid thumbnail
        for (const item of ytResults.items) {
          if (item.thumbnail && item.thumbnail.thumbnails && item.thumbnail.thumbnails.length > 0) {
            // Use the highest resolution thumbnail (usually the last one)
            const bestThumb = item.thumbnail.thumbnails.slice(-1)[0].url;
            if (bestThumb && bestThumb.startsWith('http')) {
              console.log('✅ Found relevant image via YouTube Thumbnail');
              return res.status(200).json({ success: true, url: bestThumb });
            }
          }
        }
      }
    } catch (ytErr) {
      console.error('YouTube Thumbnail fallback error:', ytErr.message);
    }
    // ----------------------------------------

    console.log(`🔍 Falling back to Google Image Search for: "${cleanedPrompt}"`);

    // Helper to try GIS searches sequentially with timeout
    const tryGisSearch = (term, useFilter = false) => {
      return new Promise((resolve) => {
        const options = { searchTerm: term };
        if (useFilter) options.queryStringAddition = '&tbs=il:cl';

        const timeout = setTimeout(() => resolve(null), 5000);

        gis(options, (err, res) => {
          clearTimeout(timeout);
          if (!err && res && res.length > 0) {
            const url = res[0].url;
            // Basic URL validation
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
              resolve(url);
            } else {
              resolve(null);
            }
          }
          else resolve(null);
        });
      });
    };

    // 1. Try with Unsplash site constraint (Often works better than raw Google)
    let url = await tryGisSearch(`${cleanedPrompt} site:unsplash.com`, false);
    if (url) return res.status(200).json({ success: true, url });

    // 2. Try full cleaned prompt without site constraint
    url = await tryGisSearch(cleanedPrompt, false);
    if (url) return res.status(200).json({ success: true, url });

    // 3. Try simplifying the prompt (e.g., getting the text after "in" representing the main topic)
    const parts = prompt.split(' in ');
    if (parts.length > 1) {
      url = await tryGisSearch(parts[1] + ' concept', false);
      if (url) return res.status(200).json({ success: true, url });
    }

    // 4. Ultimate fallback: just the first 3 words of the prompt
    const words = cleanedPrompt.split(' ').slice(0, 3).join(' ');
    url = await tryGisSearch(words, false);
    if (url) return res.status(200).json({ success: true, url });

    // If everything fails, return 500
    console.error(`❌ Image search failed entirely for: "${cleanedPrompt}"`);
    return res.status(500).json({ success: false, message: 'Image search failed entirely' });

  } catch (error) {
    console.error('Image generation global error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during image generation' });
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

    const text = await generateAIText({
      prompt,
      systemInstruction,
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
      },
      maxOutputTokens: 4096,
      safetySettings
    });

    const cleanedText = text.trim();

    res.status(200).json({
      success: true,
      exam: cleanedText
    });

  } catch (error) {
    console.log('AI Exam Error:', error);

    const isRateLimitError =
      error.status === 429 ||
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('quota') ||
      error.message?.toLowerCase?.().includes('rate limit') ||
      error.message?.toLowerCase?.().includes('exceeded your current quota');

    const isMissingKey = error.status === 401;
    const isInvalidKey = error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('API key not valid') || error.message?.includes('API key expired');

    let status = 500;
    let message = 'Failed to generate exam';

    if (isMissingKey || isInvalidKey) {
      status = isMissingKey ? 401 : 403;
      message = error.message || 'Invalid AI provider configuration. Please verify it in settings.';
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
