import Schedule from "../models/Schedule.js";

/* CREATE */
export const createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
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
    const schedules = await Schedule.find();

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