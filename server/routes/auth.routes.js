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
import User from '../models/User.js'; // make sure you import your User model

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/social', socialLogin);
router.post('/forgot', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/profile', updateProfile);
router.get('/verify-email/:token', verifyEmail);

// Change app.get to router.get
router.get('/getuser/:uid', async (req, res) => {
  try {
    const user = await User.findById(req.params.uid).populate('organization');
    if (!user) return res.json({ success: false, message: "User not found" });

    // Check if organization is blocked
    if (user.organization && user.organization.isBlocked) {
      return res.json({ success: false, message: "Organization blocked", isBlocked: true });
    }

    if (user.organizationDetails && user.organizationDetails.isBlocked) {
      return res.json({ success: false, message: "Organization blocked", isBlocked: true });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
