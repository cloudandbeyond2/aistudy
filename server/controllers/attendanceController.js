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

export const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required"
      });
    }

    // Get all records for this student
    const records = await Attendance.find({ studentId })
      .populate("classId", "name startTime endTime room")
      .sort({ date: -1 });

    const summary = {
      present: 0,
      late: 0,
      absent: 0,
      total: records.length,
      percentage: 0
    };

    records.forEach(r => {
      if (r.status === "Present") summary.present++;
      else if (r.status === "Late") summary.late++;
      else if (r.status === "Absent") summary.absent++;
    });

    if (summary.total > 0) {
      summary.percentage = Math.round(((summary.present + summary.late) / summary.total) * 100);
    }

    res.status(200).json({
      success: true,
      summary,
      history: records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "classId is required"
      });
    }

    const queryDate = date || new Date().toISOString().split("T")[0];

    // Populate studentId to get the student's name and email
    const records = await Attendance.find({ classId, date: queryDate })
      .populate("studentId", "mName email studentDetails");

    res.status(200).json({
      success: true,
      records,
      date: queryDate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};