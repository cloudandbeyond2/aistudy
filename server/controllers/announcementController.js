import Announcement from "../models/Announcement.js";


// CREATE ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target, pinned } = req.body;

    const announcement = new Announcement({
      title,
      content,
      target,
      pinned,
      author: "You",
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: "Announcement created",
      announcement,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL ANNOUNCEMENTS
export const getAnnouncements = async (req, res) => {
  try {

    const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE ANNOUNCEMENT
export const updateAnnouncement = async (req, res) => {
  try {

    const { id } = req.params;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Announcement updated",
      announcement,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE ANNOUNCEMENT
export const deleteAnnouncement = async (req, res) => {
  try {

    const { id } = req.params;

    await Announcement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Announcement deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
