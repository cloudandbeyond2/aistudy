import { getGenAI } from '../config/gemini.js';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import {
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai';
import showdown from 'showdown';
import gis from 'g-i-s';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';



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
      model: 'gemini-flash-latest'
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
  const { mainTopic, topicTitle, subtopics, lang } = req.body;

  if (!mainTopic || !topicTitle || !subtopics || !subtopics.length) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: mainTopic, topicTitle, subtopics'
    });
  }

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
  ];

  const subtopicList = subtopics.map((s, i) => `${i + 1}. ${s}`).join('\n');

  const prompt = `Strictly in ${lang || 'English'}, generate educational explanations for the following subtopics of the chapter "${topicTitle}" from the course "${mainTopic}".

For each subtopic, provide a thorough explanation with examples.
Do NOT include images, external links, or additional resource suggestions.

Subtopics:
${subtopicList}

Respond ONLY with a valid JSON object in this exact format:
{
  "subtopics": [
    { "title": "Subtopic title here", "theory": "Full explanation here (HTML is fine)" }
  ]
}

Only return JSON. No markdown code blocks.`;

  try {
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest', safetySettings });

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const rawText = await result.response.text();

    const cleanedText = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response as JSON. Please try again.',
        raw: cleanedText
      });
    }

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
      model: 'gemini-flash-latest',
      safetySettings
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
 * GET IMAGE FROM GOOGLE SEARCH
 */
export const generateImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required'
    });
  }

  gis(prompt, (error, results) => {
    if (error || !results || results.length === 0) {
      console.log('Image search error:', error);
      return res.status(500).json({
        success: false,
        message: 'Image search failed'
      });
    }

    res.status(200).json({
      success: true,
      url: results[0].url
    });
  });
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
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      safetySettings
    });

    const prompt = `Strictly in ${lang || 'English'}, generate 10 multiple choice questions about ${mainTopic} covering these topics: ${subtopicsString}.

Format the response strictly as a JSON array:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

Only return JSON.`;

    const result = await retryWithBackoff(() =>
      model.generateContent(prompt)
    );

    const response = result.response;
    const text = await response.text();

    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

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
