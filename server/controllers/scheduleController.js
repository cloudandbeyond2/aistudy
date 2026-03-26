import Schedule from "../models/Schedule.js";

const getDayName = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

/* CREATE */
export const createSchedule = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.date && !payload.day) {
      payload.day = getDayName(payload.date) || payload.day;
    }

    if (!payload.visibility) {
      payload.visibility = payload.ownerId ? "personal" : "organization";
    }

    const schedule = new Schedule(payload);
    await schedule.save();

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* GET ALL */
export const getSchedules = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const schedules = await Schedule.find({ ownerId }).sort({ date: 1, startTime: 1, createdAt: -1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* UPDATE */
export const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* DELETE */
export const deleteSchedule = async (req, res) => {
  try {

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Schedule deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
