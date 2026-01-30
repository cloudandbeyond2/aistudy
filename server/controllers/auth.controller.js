import User from '../models/User.js';
import Admin from '../models/Admin.js';
import crypto from 'crypto';
import transporter from '../config/mail.js';
/**
 * SIGNUP
 */
export const signup = async (req, res) => {
  const { email, mName, password, type } = req.body;

  try {
    const estimate = await User.estimatedDocumentCount();

    if (estimate > 0) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const newUser = new User({ email, mName, password, type });
      await newUser.save();

      return res.json({
        success: true,
        message: 'Account created successfully',
        userId: newUser._id
      });
    } else {
      // First user becomes admin
      const newUser = new User({
        email,
        mName,
        password,
        type: 'forever'
      });
      await newUser.save();

      const newAdmin = new Admin({
        email,
        mName,
        type: 'main'
      });
      await newAdmin.save();

      return res.json({
        success: true,
        message: 'Account created successfully',
        userId: newUser._id
      });
    }
  } catch (error) {
    console.error('Signup Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * SIGNIN
 */
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (password === user.password) {
      return res.json({
        success: true,
        message: 'SignIn Successful',
        userData: user
      });
    }

    return res.json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Signin Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Invalid email or password',
      error: error.message
    });
  }
};
/**
 * SOCIAL LOGIN (Google / Facebook)
 */
export const socialLogin = async (req, res) => {
  const { email, name } = req.body;

  const mName = name;
  const password = ''; // Social login → no password
  const type = 'free';

  try {
    let user = await User.findOne({ email });

    // Existing user → login
    if (user) {
      return res.json({
        success: true,
        message: 'SignIn Successful',
        userData: user
      });
    }

    // First user logic (same as signup)
    const estimate = await User.estimatedDocumentCount();

    user = new User({
      email,
      mName,
      password,
      type: estimate === 0 ? 'forever' : 'free'
    });

    await user.save();

    // First user becomes admin
    if (estimate === 0) {
      const admin = new Admin({
        email,
        mName,
        type: 'main'
      });
      await admin.save();
    }

    res.json({
      success: true,
      message: 'Account created successfully',
      userData: user
    });
  } catch (error) {
    console.error('Social Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};



/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  const { email, name, company, logo } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetLink = `${process.env.WEBSITE_URL}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: `${name} Password Reset`,
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below to reset the password for ${email}</p>
        <a href="${resetLink}" target="_blank"
           style="padding:10px 16px;background:#007BFF;color:#fff;border-radius:4px;text-decoration:none">
           Reset Password
        </a>
        <p><strong>${company}</strong></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.log('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
      email: user.email
    });
  } catch (error) {
    console.log('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE USER PROFILE
 */
export const updateProfile = async (req, res) => {
  const { email, mName, password, uid } = req.body;

  if (!uid || !email || !mName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    const updateData = {
      email,
      mName
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.log('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
