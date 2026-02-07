import express from 'express';
import {
  createCourse,
  createSharedCourse,
  updateCourse,
  deleteCourse,
  finishCourse,
  getShareableCourse
} from '../controllers/course.controller.js';
import { getUserCourses } from '../controllers/course.controller.js';

const router = express.Router();

router.post('/course', createCourse);
router.post('/courseshared', createSharedCourse);
router.post('/update', updateCourse);
router.post('/deletecourse', deleteCourse);
router.post('/finish', finishCourse);
router.get('/courses', getUserCourses);
router.get('/shareable', getShareableCourse);

export default router;
