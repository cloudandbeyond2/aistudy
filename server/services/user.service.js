import User from '../models/User.js';
import Course from '../models/Course.js';
import Subscription from '../models/Subscription.js';

/**
 * Delete user and all related data
 */
export const deleteUserAndData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  await Promise.all([
    User.findByIdAndDelete(userId),
    Course.deleteMany({ user: userId }),
    Subscription.deleteMany({ user: userId })
  ]);

  return true;
};

/**
 * Upgrade user to lifetime (forever)
 */
export const upgradeUserToForever = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  user.type = 'forever';
  await user.save();

  return {
    email: user.email,
    name: user.mName,
    type: user.type
  };
};
