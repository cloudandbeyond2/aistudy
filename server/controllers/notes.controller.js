import Notes from '../models/Notes.js';

/**
 * SAVE / UPDATE NOTES
 */
export const saveNotes = async (req, res) => {
  const { course, notes } = req.body;

  try {
    const existingNotes = await Notes.findOne({ course });

    if (existingNotes) {
      await Notes.findOneAndUpdate(
        { course },
        { $set: { notes } }
      );

      return res.json({
        success: true,
        message: 'Notes updated successfully'
      });
    }

    const newNotes = new Notes({ course, notes });
    await newNotes.save();

    res.json({
      success: true,
      message: 'Notes created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET NOTES
 */
export const getNotes = async (req, res) => {
  const { course } = req.body;

  try {
    const existingNotes = await Notes.findOne({ course });

    if (existingNotes) {
      return res.json({
        success: true,
        message: existingNotes.notes
      });
    }

    res.json({
      success: false,
      message: ''
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
