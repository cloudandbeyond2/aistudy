import { generateChatResponse } from '../services/chat.service.js';

export const chat = async (req, res) => {
  try {
    const { prompt } = req.body;

    const html = await generateChatResponse(prompt);

    res.status(200).json({ text: html });
  } catch (error) {
    console.error('/api/chat error:', error);

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error'
    });
  }
};
