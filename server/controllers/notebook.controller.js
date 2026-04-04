import { chatWithAI, generateAIText } from '../config/aiProvider.js';
import { createRequire } from 'module';
import Notebook from '../models/Notebook.js';
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
// ✅ SAVE NOTEBOOK
export const saveNotebook = async (req, res) => {
  try {
 const userId = req.user?.id || req.body.userId;

if (!userId) {
  return res.status(400).json({
    success: false,
    message: "userId is required"
  });
}
 const { notebookId, generatedContent, sources, chatHistory, title } = req.body;

    let notebook;

   if (notebookId) {
  notebook = await Notebook.findByIdAndUpdate(
    notebookId,
    {
      title, // ✅ ADD THIS
      generatedContent,
      sources,
      chatHistory
    },
    { returnDocument: 'after' }
  );
} else {
  notebook = await Notebook.create({
    userId,
    title: title || "Untitled Notebook",
    generatedContent,
    sources,
    chatHistory
  });
}
    res.json({
      success: true,
      notebookId: notebook._id
    });

  } catch (error) {
    console.error("Save Notebook Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ LOAD NOTEBOOK
export const loadNotebook = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    const notebooks = await Notebook.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notebooks // ✅ send ALL notebooks
    });

  } catch (error) {
    console.error("Load Notebook Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chat = async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !messages.length) {
    return res.status(400).json({ success: false, message: 'Messages are required' });
  }

  try {
    const responseText = await chatWithAI({
      messages,
      context,
      systemInstruction: 'You are the Colossus IQ Assistant. Answer clearly, accurately, and helpfully based on the uploaded sources.'
    });

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

    const responseText = await generateAIText({
      prompt,
      maxOutputTokens: 4096
    });

    res.status(200).json({
      success: true,
      generatedText: responseText
    });
  } catch (error) {
    console.error('Generate notebook action error:', error);
    res.status(500).json({ success: false, message: error.message || `Failed to generate ${action}` });
  }
};
