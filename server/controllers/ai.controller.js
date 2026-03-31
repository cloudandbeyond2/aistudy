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
  const {
    mainTopic,
    topicsList,
    lang,
    userId,
    contentProfile = 'learn_format'
  } = req.body;

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
        const isOrgStaff = ['org_admin', 'dept_admin'].includes(user.role) && user.organization;
        const planType = user.type || 'free';
        const limits = getPlanLimits(planType);

        if (!isOrgStaff && !isPlanActive(planType, user.subscriptionEnd)) {
          return res.status(403).json({
            success: false,
            message: 'Your subscription has expired. Please renew your plan.',
            planExpired: true
          });
        }

        // Validate each topic's subtopic count against limits
        if (!isOrgStaff) {
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

  const contentProfileMap = {
    textbook_notes: {
      label: 'Textbook Notes',
      instruction:
        'Write like textbook notes with concept-first explanation, definitions, organized sections, and recap-friendly flow.'
    },
    lecturer_notes: {
      label: 'Lecturer Notes',
      instruction:
        'Write like lecturer notes with teachable explanations, emphasis points, and examples a trainer could present live.'
    },
    exam_pattern: {
      label: 'Exam Pattern',
      instruction:
        'Write in an exam-focused style with key points, likely answer angles, revision cues, and concise high-yield explanation.'
    },
    student_friendly: {
      label: 'Student Format',
      instruction:
        'Write in simple, student-friendly language with shorter paragraphs, approachable examples, and clear explanations.'
    },
    professional_format: {
      label: 'Professional Format',
      instruction:
        'Write in a polished professional tone with frameworks, applied decision context, and workplace-ready examples.'
    },
    business_format: {
      label: 'Business Format',
      instruction:
        'Write in a business format using KPI, workflow, stakeholder, operations, and product or process examples where relevant.'
    },
    learn_format: {
      label: 'Learn Format',
      instruction:
        'Write in a learn-by-doing format with step-by-step progression, mini checkpoints, and action-oriented examples.'
    }
  };

  const selectedContentProfile =
    contentProfileMap[contentProfile] || contentProfileMap.learn_format;

  const systemInstruction = `Strictly in ${lang || 'English'}, you are a specialized educational content writer. 
Your goal is to provide thorough, in-depth, and "large" explanations for course subtopics.
IMPORTANT: You MUST explicitly translate the 'topicTitle' and subtopic 'title' fields into ${lang || 'English'}, alongside the 'theory' content.
For each subtopic, provide a detailed explanation (approx 900-1500 words if possible) with rich examples, strong concept-building, and clear definitions.
Ensure every sentence is complete and the content doesn't cut off abruptly.
If providing code examples, ensure they are properly formatted with correct line breaks and indentation.
Use valid HTML formatting for the "theory" field (paragraphs, bold text, lists).
Every lesson should feel substantially complete, not like a short summary.
Include layered explanation: concept meaning, why it matters, process or workflow, practical examples, mistakes to avoid, and a short closing recap.
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
Presentation style: ${selectedContentProfile.label}.
Style guidance: ${selectedContentProfile.instruction}
Avoid generic AI-sounding filler. The lesson should read like it was intentionally prepared in the selected presentation style.
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

  const stripHtmlToText = (html = '') =>
    html
      .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const getWordCount = (html = '') => {
    const text = stripHtmlToText(html);
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  };

  const hasCompleteSentenceEnding = (html = '') => {
    const text = stripHtmlToText(html);
    if (!text) return false;

    return /[.!?]["')\]]?\s*$/.test(text);
  };

  const trimIncompleteTrailingFragment = (html = '') => {
    const trimmed = html.trim();
    if (!trimmed) return trimmed;
    if (hasCompleteSentenceEnding(trimmed)) return trimmed;

    const sentenceEndMatches = [...trimmed.matchAll(/[.!?](?=(?:[^<]*<[^>]*>)*[^<]*$)/g)];
    const lastSentenceEnd = sentenceEndMatches.at(-1)?.index;

    if (typeof lastSentenceEnd === 'number') {
      const truncated = trimmed.slice(0, lastSentenceEnd + 1).trim();
      if (stripHtmlToText(truncated).length >= 80) {
        return truncated;
      }
    }

    return trimmed;
  };

  const appendClosingLessonParagraph = ({ html, topicTitle, subtopicTitle }) => {
    const safeHtml = trimIncompleteTrailingFragment(html);
    const closingParagraph = `<p>Overall, ${subtopicTitle} is an important part of ${topicTitle} because it helps the learner apply the main ideas with clarity and confidence.</p>`;

    if (!safeHtml) {
      return `<div class="prose max-w-none"><h2>${subtopicTitle}</h2>${closingParagraph}</div>`;
    }

    if (/<\/div>\s*$/i.test(safeHtml)) {
      return safeHtml.replace(/<\/div>\s*$/i, `${closingParagraph}</div>`);
    }

    return `${safeHtml}\n${closingParagraph}`;
  };

  const needsLessonRepair = (html = '') => {
    const text = stripHtmlToText(html);
    const wordCount = getWordCount(html);
    if (!text) return true;
    if (text.length < 120) return true;
    if (wordCount < 220) return true;
    if (!hasCompleteSentenceEnding(html)) return true;

    const lowered = text.toLowerCase();
    return (
      lowered.endsWith(' and') ||
      lowered.endsWith(' or') ||
      lowered.endsWith(' because') ||
      lowered.endsWith(' so') ||
      lowered.endsWith(' which') ||
      lowered.endsWith(' such as') ||
      lowered.endsWith(' for example')
    );
  };

  const buildLessonRepairPrompt = ({ topicTitle, subtopicTitle, theory }) => `Course: "${mainTopic}"

Chapter: "${topicTitle}"
Subtopic: "${subtopicTitle}"
Language: ${lang || 'English'}

Task:
Rewrite the following lesson into clean, valid HTML.
Every sentence must be complete and meaningful.
Remove any truncated phrase, dangling clause, or cut-off ending.
Preserve the lesson's meaning and structure, but make the final result read naturally from start to finish.
Expand thin sections so the lesson feels complete and self-contained for student study.
Target roughly 700 to 1100 words.
Include a proper introduction, core explanation, practical examples, common mistakes, and a short recap.
Return HTML only.

Original lesson:
${theory}`;

  const repairIncompleteLesson = async ({ topicTitle, subtopicTitle, theory }) => {
    const repaired = await generateAIText({
      prompt: buildLessonRepairPrompt({ topicTitle, subtopicTitle, theory }),
      systemInstruction: `Strictly in ${lang || 'English'}, you are a careful educational editor. Return only valid HTML. Every sentence must be complete, natural, and meaningful.`,
      maxOutputTokens: 3072,
      safetySettings
    });

    return repaired?.trim() || '';
  };

  const finalizeLessonTheory = async ({ topicTitle, subtopicTitle, theory }) => {
    const normalizedTheory = theory?.trim() || '';
    if (!normalizedTheory) {
      throw new Error('Lesson content is empty.');
    }

    if (!needsLessonRepair(normalizedTheory)) {
      return normalizedTheory;
    }

    try {
      const repairedTheory = await repairIncompleteLesson({
        topicTitle,
        subtopicTitle,
        theory: normalizedTheory
      });

      if (repairedTheory && !needsLessonRepair(repairedTheory)) {
        return repairedTheory;
      }

      if (repairedTheory) {
        return appendClosingLessonParagraph({
          html: repairedTheory,
          topicTitle,
          subtopicTitle
        });
      }
    } catch (repairError) {
      console.warn(`Lesson repair failed for "${topicTitle}" -> "${subtopicTitle}":`, repairError.message);
    }

    return appendClosingLessonParagraph({
      html: normalizedTheory,
      topicTitle,
      subtopicTitle
    });
  };

  const normalizeGeneratedSubtopic = async ({
    topicTitle,
    subtopicTitle,
    parsedTopic,
    parsedSubtopic
  }) => {
    const normalizedTopicTitle = parsedTopic?.topicTitle?.trim() || topicTitle;
    const normalizedSubtopicTitle = parsedSubtopic?.title?.trim() || subtopicTitle;
    const normalizedTheory = await finalizeLessonTheory({
      topicTitle: normalizedTopicTitle,
      subtopicTitle: normalizedSubtopicTitle,
      theory: parsedSubtopic?.theory?.trim() || ''
    });

    return {
      topicTitle: normalizedTopicTitle,
      subtopic: {
        title: normalizedSubtopicTitle,
        theory: normalizedTheory
      }
    };
  };

  const buildSingleSubtopicPrompt = (
    topicTitle,
    subtopicTitle,
    detailLevel = 'detailed'
  ) => {
    const isCompact = detailLevel === 'compact';

  return `Course: "${mainTopic}"

Generate comprehensive educational content for exactly one chapter and one subtopic.

Chapter: "${topicTitle}"
Subtopic: "${subtopicTitle}"
Presentation Style: ${selectedContentProfile.label}
Style Guidance: ${selectedContentProfile.instruction}

Requirements:
- Return content only for this one chapter and this one subtopic.
- Keep the same chapter title and subtopic title, translated into ${lang || 'English'} when needed.
- The "theory" field must contain complete HTML content and must not be cut off.
- Write ${isCompact ? 'a concise but complete lesson of about 650 to 900 words' : 'a detailed lesson of about 900 to 1500 words'}.
- Make the lesson richer than a short summary. Explain the concept, why it matters, how it is used, where learners make mistakes, and how to apply it correctly.
- Include these sections naturally in HTML:
  1. Introduction
  2. Core explanation
  3. Step-by-step explanation, workflow, or method when relevant
  4. Two or more practical examples, scenarios, or use cases
  5. Common mistakes or caution points
  6. Short recap
- Use short paragraphs and lists where useful, but keep the HTML clean.
- Prefer depth, clarity, and learning value over brevity.
- The final HTML must read like a complete lesson a student can study independently.

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

  const buildFallbackTheoryPrompt = (topicTitle, subtopicTitle) => `Course: "${mainTopic}"

Write a complete HTML lesson for this one chapter and one subtopic.

Chapter: "${topicTitle}"
Subtopic: "${subtopicTitle}"
Language: ${lang || 'English'}
Presentation Style: ${selectedContentProfile.label}
Style Guidance: ${selectedContentProfile.instruction}

Rules:
- Return HTML only, not JSON.
- Start with a short introductory paragraph.
- Write a full lesson of roughly 700 to 1100 words.
- Include meaningful explanation, workflow or method when relevant, at least one solid practical example or use case, common mistakes, and a short recap.
- Keep the lesson complete, informative, and readable.
- Use <p>, <strong>, <ul>, <li>, and <pre><code> only when appropriate.
- Do not include images, links, markdown fences, or notes about being an AI.`;

  const generateStructuredSubtopic = async ({
    topicTitle,
    subtopicTitle,
    detailLevel = 'detailed',
    maxOutputTokens = 5120
  }) => {
    const rawText = await generateAIText({
      prompt: buildSingleSubtopicPrompt(topicTitle, subtopicTitle, detailLevel),
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      maxOutputTokens,
      safetySettings
    });

    const parsed = parseGeneratedJson(rawText);
    const parsedTopic = Array.isArray(parsed?.topics) ? parsed.topics[0] : null;
    const parsedSubtopic = Array.isArray(parsedTopic?.subtopics)
      ? parsedTopic.subtopics[0]
      : null;

    return await normalizeGeneratedSubtopic({
      topicTitle,
      subtopicTitle,
      parsedTopic,
      parsedSubtopic
    });
  };

  const generateFallbackTheory = async ({ topicTitle, subtopicTitle }) => {
    const theory = await generateAIText({
      prompt: buildFallbackTheoryPrompt(topicTitle, subtopicTitle),
      systemInstruction: `Strictly in ${lang || 'English'}, you are a specialized educational content writer. Return only valid HTML for one lesson.`,
      maxOutputTokens: 4096,
      safetySettings
    });

    const normalizedTheory = await finalizeLessonTheory({
      topicTitle,
      subtopicTitle,
      theory
    });

    return {
      topicTitle,
      subtopic: {
        title: subtopicTitle,
        theory: normalizedTheory
      }
    };
  };

  const buildEmergencyTheory = ({ topicTitle, subtopicTitle }) => ({
    topicTitle,
    subtopic: {
      title: subtopicTitle,
      theory: `<div class="prose max-w-none"><h2>${subtopicTitle}</h2><p>We could not fully generate this lesson right now, but this section is reserved for <strong>${subtopicTitle}</strong> under <strong>${topicTitle}</strong>.</p><p>Please reopen this lesson in a moment to retry the full content generation.</p></div>`
    }
  });

  const generateSubtopicWithFallback = async ({ topicTitle, subtopicTitle }) => {
    try {
      return await generateStructuredSubtopic({ topicTitle, subtopicTitle });
    } catch (error) {
      console.warn(`Structured lesson generation failed for "${topicTitle}" -> "${subtopicTitle}":`, error.message);
    }

    try {
      return await generateStructuredSubtopic({
        topicTitle,
        subtopicTitle,
        detailLevel: 'compact',
        maxOutputTokens: 4096
      });
    } catch (error) {
      console.warn(`Compact structured retry failed for "${topicTitle}" -> "${subtopicTitle}":`, error.message);
    }

    try {
      return await generateFallbackTheory({ topicTitle, subtopicTitle });
    } catch (error) {
      console.warn(`HTML fallback failed for "${topicTitle}" -> "${subtopicTitle}":`, error.message);
      return buildEmergencyTheory({ topicTitle, subtopicTitle });
    }
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
        const generatedSubtopic = await generateSubtopicWithFallback({
          topicTitle: generatedTopic.topicTitle,
          subtopicTitle
        });

        generatedTopic.topicTitle = generatedSubtopic.topicTitle || generatedTopic.topicTitle;
        generatedTopic.subtopics.push(generatedSubtopic.subtopic);
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
