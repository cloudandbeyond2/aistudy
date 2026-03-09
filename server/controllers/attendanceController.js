import Attendance from "../models/AttendanceModel.js";

export const markAttendance = async (req, res) => {

  try {

    const { studentId, classId, status, time } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const alreadyMarked = await Attendance.findOne({
      studentId,
      classId,
      date: today
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked"
      });
    }

    const attendance = new Attendance({
      studentId,
      classId,
      status,
      time,
      date: today
    });

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const getAttendance = async (req, res) => {
  try {
    const { studentId, classId } = req.query;

    if (!studentId || !classId) {
      return res.status(400).json({
        success: false,
        message: "studentId and classId are required"
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({
      studentId,
      classId,
      date: today
    });

    if (record) {
      return res.status(200).json({
        success: true,
        marked: true,
        status: record.status,
        time: record.time
      });
    } else {
      return res.status(200).json({
        success: true,
        marked: false
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};