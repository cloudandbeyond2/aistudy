import transporter from '../config/mailer.js';

/**
 * SEND SUBSCRIPTION RECEIPT
 */
export const downloadReceipt = async (req, res) => {
  const { html, email } = req.body;

  if (!html || !email) {
    return res.status(400).json({
      success: false,
      message: 'Email and receipt HTML are required'
    });
  }

  try {
    const options = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Subscription Receipt',
      html
    };

    await transporter.sendMail(options);

    res.json({
      success: true,
      message: 'Receipt sent to your mail'
    });
  } catch (error) {
    console.error('Receipt email error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to send receipt'
    });
  }
};
