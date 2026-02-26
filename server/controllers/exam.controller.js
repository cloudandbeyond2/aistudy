import mongoose from 'mongoose';
import Exam from '../models/Exam.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Lang from '../models/Lang.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import { sendMail } from '../services/mail.service.js';

/**
 * UPDATE RESULT & ISSUE CERTIFICATE
 */
export const updateResult = async (req, res) => {
  const { courseId, marksString, userId: providedUserId } = req.body;

  try {
    const course = await Course.findById(courseId);
    let userId = providedUserId || (course ? course.user : null);

    // If userId is still an email or invalid ObjectId, try to find the user
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      const userObj = await User.findOne({ email: userId });
      if (userObj) userId = userObj._id;
    }

    const newExam = new Exam({
      course: courseId,
      userId: userId,
      marks: marksString,
      passed: true
    });
    await newExam.save();

    // Only update course as completed if it's the creator taking it
    if (course && String(course.user) === String(userId)) {
      await Course.findOneAndUpdate(
        { _id: courseId },
        { $set: { completed: true, end: Date.now() } }
      );
    }

    let studentName = 'Student';
    const userObj = await User.findById(userId);
    if (userObj) {
      studentName = userObj.mName;
    }

    let issuedCert = await IssuedCertificate.findOne({
      user: userId,
      course: courseId
    });

    if (!issuedCert) {
      const certificateId =
        'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      issuedCert = new IssuedCertificate({
        certificateId,
        user: userId,
        course: courseId,
        studentName,
        courseName: course ? course.mainTopic : 'Course'
      });

      await issuedCert.save();
    }

    res.json({
      success: true,
      message: 'Result updated and course completed',
      certificateId: issuedCert.certificateId
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
 * BATCH: GET QUIZ RESULTS FOR MULTIPLE COURSES AT ONCE
 * Replaces N individual /api/getmyresult calls with a single query.
 */
export const getMyResultsBatch = async (req, res) => {
  const { courseIds, userId: providedUserId } = req.body;

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return res.json({ success: true, results: [] });
  }

  try {
    // Find all passed exams for the given courseIds in one query
    const exams = await Exam.find({
      course: { $in: courseIds },
      passed: true
    }).select('course userId');

    // Build a quick lookup set keyed by courseId
    const passedSet = new Set(exams.map(e => String(e.course)));

    const results = courseIds.map(courseId => ({
      courseId,
      passed: passedSet.has(String(courseId))
    }));

    res.json({ success: true, results });
  } catch (error) {
    console.error('getMyResultsBatch error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET MY RESULT
 */
export const getMyResult = async (req, res) => {
  const { courseId, userId: providedUserId } = req.body;

  try {
    const course = await Course.findById(courseId);
    let userId = providedUserId || (course ? course.user : null);

    // Normalize userId
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      const userObj = await User.findOne({ email: userId });
      if (userObj) userId = userObj._id;
    }

    let exam = await Exam.findOne({
      course: courseId,
      userId: userId,
      passed: true
    });

    // Fallback for legacy exams (without userId) if the user is the course creator
    if (!exam && userId && course && String(course.user) === String(userId)) {
      exam = await Exam.findOne({
        course: courseId,
        userId: { $exists: false },
        passed: true
      });
    }

    const langObj = await Lang.findOne({ course: courseId });
    const language = langObj ? langObj.lang : 'English';

    if (!exam) {
      return res.json({
        success: true,
        message: false,
        lang: language
      });
    }

    let certificateId = null;
    if (userId) {
      const cert = await IssuedCertificate.findOne({
        course: courseId,
        user: userId
      });
      if (cert) certificateId = cert.certificateId;
    }

    res.json({
      success: true,
      message: true,
      lang: language,
      certificateId
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
 * SIMPLE: GET RESULT (OLD LOGIC)
 */
export const getMyResultSimple = async (req, res) => {
  const { courseId } = req.body;

  try {
    const existingExam = await Exam.findOne({ course: courseId });
    const langObj = await Lang.findOne({ course: courseId });

    const language = langObj ? langObj.lang : 'English';

    if (existingExam) {
      return res.json({
        success: true,
        message: existingExam.passed,
        lang: language
      });
    }

    return res.json({
      success: false,
      message: false,
      lang: language
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * SIMPLE: UPDATE RESULT (OLD LOGIC)
 */
export const updateResultSimple = async (req, res) => {
  const { courseId, marksString } = req.body;

  try {
    await Exam.findOneAndUpdate(
      { course: courseId },
      { $set: { marks: marksString, passed: true } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.log('Error', error);
    res.status(500).send('Internal Server Error');
  }
};
/**
 * SEND EXAM EMAIL
 */
export const sendExamMail = async (req, res) => {
  const { html, email, subjects } = req.body;

  if (!html || !email || !subjects) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    await sendMail({
      to: email,
      subject: subjects,
      html
    });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.log('Error sending exam mail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};