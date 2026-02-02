import express from 'express';
import {
  signup,
  signin,
  socialLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  verifyEmail
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/social', socialLogin);
router.post('/forgot', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/profile', updateProfile);
router.get('/verify-email/:token', verifyEmail);


export default router;
