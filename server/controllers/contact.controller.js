import Contact from '../models/Contact.js';
import transporter from '../config/mail.js';

/**
 * SUBMIT CONTACT FORM
 */
export const submitContact = async (req, res) => {
  const { fname, lname, email, phone, msg } = req.body;

  try {
    const newContact = new Contact({
      fname,
      lname, // This comes as 'Subject' from frontend
      email,
      phone,
      msg
    });

    await newContact.save();

    // Send Notification Email
    const mailOptions = {
      from: process.env.EMAIL,
      to: 'cloudandbeyond2014@gmail.com',
      subject: `New Contact Form Submission: ${lname}`,
      html: `
        <h3>New Message from ${fname}</h3>
        <p><strong>Subject:</strong> ${lname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${msg}</p>
      `
    };

    // We don't await this to keep the response fast, or we can await if reliability is critical.
    // Let's await to report errors if email fails.
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
      // We still return success because the data was saved to DB
    }

    res.json({
      success: true,
      message: 'Submitted'
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET ALL CONTACTS (ADMIN)
 */
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.json(contacts);
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
