import express from 'express';
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
} from '../controllers/ClassController.js';

const router = express.Router();

// POST - Create
router.post('/classes', createClass);

// GET - All
router.get('/classes', getAllClasses);

// GET - Single
router.get('/classes/:id', getClassById);

// PUT - Update
router.put('/classes/:id', updateClass);

export default router;
