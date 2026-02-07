import express from 'express';
import upload from '../config/upload.config.js';

const router = express.Router();

router.post(
  '/upload-assignment',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // req.file.buffer → send to S3 / Cloudinary / Firebase
      // req.file.originalname
      // req.file.mimetype

      res.json({
        success: true,
        fileName: req.file.originalname,
        size: req.file.size,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
