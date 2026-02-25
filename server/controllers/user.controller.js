import {
  deleteUserAndData,
  upgradeUserToForever
} from '../services/user.service.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import Contact from '../models/Contact.js';

/**
 * GET USER STATS (COURSES, CERTIFICATES, TICKETS)
 */
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const coursesCount = await Course.countDocuments({ user: userId });
    const certificatesCount = await IssuedCertificate.countDocuments({ user: userId });
    const ticketsCount = await Contact.countDocuments({ email: user.email });

    res.json({
      success: true,
      stats: {
        courses: coursesCount,
        certifications: certificatesCount,
        tickets: ticketsCount
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET USER BY ID
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error'
    });
  }
};

/**
 * DELETE USER (SELF)
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    await deleteUserAndData(userId);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error'
    });
  }
};

/**
 * ADMIN – UPGRADE USER
 */
export const upgradeUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await upgradeUserToForever(email);

    res.json({
      success: true,
      message: 'User upgraded to premium successfully',
      user
    });
  } catch (error) {
    console.error('Upgrade user error:', error);

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error'
    });
  }
};
