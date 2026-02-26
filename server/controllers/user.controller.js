import {
  deleteUserAndData,
  upgradeUserToForever
} from '../services/user.service.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import Contact from '../models/Contact.js';
import AccountDeleteRequest from '../models/AccountDeleteRequest.js';

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
 * UPDATE USER NOTIFICATION SETTINGS
 */
export const updateSettings = async (req, res) => {
  try {
    const { userId, notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notifications } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      notifications: user.notifications
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * REQUEST ACCOUNT DELETION
 */
export const requestAccountDeletion = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if already pending
    const existing = await AccountDeleteRequest.findOne({ user: userId, status: 'pending' });
    if (existing) {
      return res.json({
        success: false,
        message: 'A deletion request is already pending for this account.'
      });
    }

    await AccountDeleteRequest.create({ user: userId, reason: reason || '' });

    res.json({
      success: true,
      message: 'Account deletion request submitted. Admin will review it shortly.'
    });
  } catch (error) {
    console.error('Request deletion error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * ADMIN - GET DELETION REQUESTS
 */
export const getDeletionRequests = async (req, res) => {
  try {
    const requests = await AccountDeleteRequest.find()
      .populate('user', 'mName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get deletion requests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * ADMIN - UPDATE DELETION REQUEST STATUS
 */
export const updateDeletionRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    if (!['completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await AccountDeleteRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (status === 'completed') {
      // Actually delete the user and their data
      await deleteUserAndData(request.user);
    }

    request.status = status;
    await request.save();

    res.json({
      success: true,
      message: `Request marked as ${status}`,
      request
    });
  } catch (error) {
    console.error('Update deletion request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE USER (ADMIN ONLY)
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    await deleteUserAndData(userId);
    // Mark all pending deletion requests as completed
    await AccountDeleteRequest.updateMany({ user: userId }, { status: 'completed' });

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
