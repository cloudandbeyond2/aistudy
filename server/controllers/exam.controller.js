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
  const { courseId, marksString } = req.body;

  try {
    const newExam = new Exam({
      course: courseId,
      marks: marksString,
      passed: true
    });
    await newExam.save();

    const course = await Course.findOneAndUpdate(
      { _id: courseId },
      { $set: { completed: true, end: Date.now() } },
      { new: true }
    );

    let studentName = 'Student';
    let userId = course.user;

    const userObj = await User.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(course.user) ? course.user : null },
        { email: course.user }
      ]
    });

    if (userObj) {
      studentName = userObj.mName;
      userId = userObj._id;
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
        courseName: course.mainTopic
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
 * GET MY RESULT
 */
export const getMyResult = async (req, res) => {
  const { courseId } = req.body;

  try {
    const exam = await Exam.findOne({
      course: courseId,
      passed: true
    });

    const langObj = await Lang.findOne({ course: courseId });
    const language = langObj ? langObj.lang : 'English';

    if (!exam) {
      return res.json({
        success: true,
        message: false,
        lang: language
      });
    }

    const course = await Course.findById(courseId);
    let userId = null;

    if (course) {
      const userObj = await User.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(course.user) ? course.user : null },
          { email: course.user }
        ]
      });
      if (userObj) userId = userObj._id;
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