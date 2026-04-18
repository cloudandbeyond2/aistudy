import { generateChatResponse } from '../services/chat.service.js';

export const chat = async (req, res) => {
  try {
    const { prompt } = req.body;

    const { html, usage } = await generateChatResponse(prompt);
    res.status(200).json({ success: true, text: html, usage });
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
