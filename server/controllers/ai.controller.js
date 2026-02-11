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
//     model: 'gemini-flash-latest',
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

    const result = await model.generateContent(prompt);
    const generatedText = await result.response.text();

    res.status(200).json({
      success: true,
      generatedText
    });
  } catch (error) {
    const isRateLimit =
      error.message?.includes('429') ||
      error.message?.includes('quota');

    res.status(isRateLimit ? 429 : 500).json({
      success: false,
      message: isRateLimit
        ? 'API rate limit exceeded'
        : 'Internal server error'
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
      text: html
    });
  } catch (error) {
    console.log('Generate HTML error:', error);

    const isRateLimitError =
      error.message?.includes('429') ||
      error.message?.includes('Too Many Requests') ||
      error.message?.includes('quota');

    res.status(isRateLimitError ? 429 : 500).json({
      success: false,
      message: isRateLimitError
        ? 'API rate limit exceeded. Please try again later.'
        : 'Internal server error',
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

    res.status(isRateLimitError ? 429 : 500).json({
      success: false,
      message: isRateLimitError
        ? 'API rate limit exceeded. Please try again later.'
        : 'Failed to generate exam',
      error: error.message
    });
  }
};
