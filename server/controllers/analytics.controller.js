import Analytics from "../models/Analytics.js";

// CREATE
export const createAnalytics = async (req, res) => {
  try {
    const { userId, courseId, action } = req.body;

    // ✅ Only block duplicate "completed"
    if (action === "completed") {
      const exists = await Analytics.findOne({
        userId,
        courseId,
        action: "completed",
      });

      if (exists) {
        return res.status(200).json({
          success: true,
          message: "Already completed tracked",
        });
      }
    }

    // ✅ Allow multiple "viewed"
    await Analytics.create({ userId, courseId, action });

    res.status(201).json({
      success: true,
      message: "Analytics recorded",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// GET BY USER
export const getAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await Analytics.find({ userId })
      .populate("courseId", "title") // 👈 IMPORTANT
      .sort({ createdAt: -1 }); // latest first

    res.json({ success: true, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
