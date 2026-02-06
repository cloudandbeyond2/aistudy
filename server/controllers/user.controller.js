import {
  deleteUserAndData,
  upgradeUserToForever
} from '../services/user.service.js';
import User from '../models/User.js';

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
