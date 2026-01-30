import Contact from '../models/Contact.js';

/**
 * SUBMIT CONTACT FORM
 */
export const submitContact = async (req, res) => {
  const { fname, lname, email, phone, msg } = req.body;

  try {
    const newContact = new Contact({
      fname,
      lname,
      email,
      phone,
      msg
    });

    await newContact.save();

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
