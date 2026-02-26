import { getGenAI } from '../config/gemini.js';
import retryWithBackoff from '../utils/retryWithBackoff.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const uploadSource = async (req, res) => {
  try {
    let content = '';
    let title = '';
    let type = 'text';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(req.file.buffer);
        content = data.text;
        title = req.file.originalname;
        type = 'pdf';
      } else if (req.file.mimetype.startsWith('text/')) {
        content = req.file.buffer.toString('utf-8');
        title = req.file.originalname;
        type = 'text';
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported file type. Please upload a PDF or text file.' });
      }
    } else if (req.body.text) {
      content = req.body.text;
      title = req.body.title || 'Pasted Text';
      type = 'text';
    } else {
      return res.status(400).json({ success: false, message: 'No file or text provided' });
    }

    const words = content.trim().split(/\s+/).length;

    res.status(200).json({
      success: true,
      source: {
        id: Date.now().toString(),
        title,
        content,
        words,
        type,
        selected: true
      }
    });

  } catch (error) {
    console.error('Upload source error:', error);
    res.status(500).json({ success: false, message: 'Failed to process source' });
  }
};

export const chat = async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !messages.length) {
    return res.status(400).json({ success: false, message: 'Messages are required' });
  }

  try {
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = '';
    if (context) {
      prompt += `Use the following sources as context to answer the user's questions. If the answer is not in the context, you can use your general knowledge, but prioritize the provided context.\n\nContext:\n${context}\n\n`;
    }

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({ history });

    const latestMessage = messages[messages.length - 1].content;
    const finalPrompt = prompt + latestMessage;

    const result = await retryWithBackoff(() => chatSession.sendMessage(finalPrompt));
    const responseText = await result.response.text();

    res.status(200).json({
      success: true,
      generatedText: responseText
    });
  } catch (error) {
    console.error('Notebook chat error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate chat response' });
  }
};

export const generateAction = async (req, res) => {
  const { action, context } = req.body;

  if (!action || !context) {
    return res.status(400).json({ success: false, message: 'Action and context are required' });
  }

  try {
    const genAI = await getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Based strictly on the following context, generate a detailed ${action}.\n\nContext:\n${context}\n\n`;

    if (action === "Study Guide") {
      prompt += "Format the study guide with clear headings, bullet points, and key definitions.";
    } else if (action === "FAQ") {
      prompt += "Generate a list of frequently asked questions and their answers from the text.";
    } else if (action === "Quiz") {
      prompt += "Generate a 5-question multiple choice quiz with answers.";
    } else if (action === "Briefing Doc") {
      prompt += "Provide a high-level executive summary and key takeaways.";
    } else if (action === "Flashcards") {
      prompt += "Generate terms and definitions suitable for flashcards.";
    } else if (action === "Audio Overview") {
      prompt += "Write a script for a 2-person podcast discussing the key themes of these sources in an engaging, conversational way.";
    }

    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const responseText = await result.response.text();

    res.status(200).json({
      success: true,
      generatedText: responseText
    });
  } catch (error) {
    console.error('Generate notebook action error:', error);
    res.status(500).json({ success: false, message: error.message || `Failed to generate ${action}` });
  }
};
