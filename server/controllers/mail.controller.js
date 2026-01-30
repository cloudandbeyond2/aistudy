import transporter from '../config/mail.js';

/**
 * SEND GENERIC EMAIL
 */
export const sendMail = async (req, res) => {
  const { html, to, subject } = req.body;

  try {
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const options = {
      from: process.env.EMAIL,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(options);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      info
    });
  } catch (error) {
    console.log('Mail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};
