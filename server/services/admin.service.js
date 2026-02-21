import User from '../models/User.js';
import Organization from '../models/Organization.js';
import bcrypt from 'bcrypt';
import Course from '../models/Course.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';

import { addOneMonthSafe } from '../utils/date.utils.js';
/* ---------------- DASHBOARD ---------------- */
export const getDashboardStats = async () => {
  const users = await User.estimatedDocumentCount();
  const courses = await Course.estimatedDocumentCount();
  const admin = await Admin.findOne({ type: 'main' });

  const monthlyPlanCount = await User.countDocuments({
    type: process.env.MONTH_TYPE
  });

  const yearlyPlanCount = await User.countDocuments({
    type: process.env.YEAR_TYPE
  });

  const monthCost = monthlyPlanCount * process.env.MONTH_COST;
  const yearCost = yearlyPlanCount * process.env.YEAR_COST;

  const paid = monthlyPlanCount + yearlyPlanCount;
  const free = users - paid;

  const videoType = await Course.countDocuments({
    type: 'video & text course'
  });

  const textType = await Course.countDocuments({
    type: 'theory & image course'
  });

  return {
    users,
    courses,
    total: admin?.total || 0,
    sum: monthCost + yearCost,
    paid,
    free,
    videoType,
    textType,
    admin
  };
};

/* ---------------- USERS ---------------- */
export const getAllUsers = async () => User.find({});

export const getPaidUsers = async () => {
  const paidUsers = await User.find({ type: { $ne: 'free' } });

  return Promise.all(
    paidUsers.map(async (user) => {
      const subscription = await Subscription.findOne({ user: user._id });
      return { ...user.toObject(), subscription };
    })
  );
};


export const updateUser = async ({ userId, mName, email, type }) => {

  const now = new Date();
  let subscriptionStart = now;
  let subscriptionEnd = null;

  if (type === 'free') {
    subscriptionEnd = new Date(now);
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 7);
  }

  if (type === 'monthly') {
    subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
  }

  if (type === 'yearly') {
    subscriptionEnd = new Date(now);
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
  }

  if (type === 'forever') {
    subscriptionStart = now;
    subscriptionEnd = null; // permanent
  }


  await User.findByIdAndUpdate(userId, {
    mName,
    email,
    type,
    subscriptionStart,
    subscriptionEnd,
  });

};



export const deleteUser = async (userId) => {
  await User.findByIdAndDelete(userId);
  await Subscription.findOneAndDelete({ user: userId });
  await Course.deleteMany({ user: userId });
};

// export const updateUser = async ({ userId, mName, email, type }) => {
//   await User.findByIdAndUpdate(userId, { mName, email, type });
// };

/* ---------------- COURSES ---------------- */
export const getAllCourses = async () => {
  return Course.find({})
    .select('_id user mainTopic type photo date end completed restricted')
    .lean()
    .sort({ date: -1 });
};

export const adminUpdateCourse = async ({ courseId, completed, restricted }) => {
  await Course.findByIdAndUpdate(courseId, { completed, restricted });
};

/* ---------------- ADMINS ---------------- */
const getAdminEmails = async () => {
  const admins = await Admin.find({});
  return admins.map((a) => a.email);
};

export const getAdminsAndUsers = async () => {
  const adminEmails = await getAdminEmails();
  const users = await User.find({ email: { $nin: adminEmails } });
  const admins = await Admin.find({});
  return { users, admins };
};

export const addAdmin = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const paid = await Subscription.findOne({ user: user._id });
  if (!paid) {
    await User.findOneAndUpdate({ email }, { type: 'forever' });
  }

  await new Admin({
    email: user.email,
    mName: user.mName,
    type: 'no'
  }).save();
};

export const removeAdmin = async (email) => {
  await Admin.findOneAndDelete({ email });

  const user = await User.findOne({ email });
  if (user?.type === 'forever') {
    await User.findOneAndUpdate({ email }, { type: 'free' });
  }
};

/* ---------------- POLICIES ---------------- */
export const saveAdminPolicy = async ({ type, data }) => {
  const fieldMap = {
    terms: 'terms',
    privacy: 'privacy',
    cancel: 'cancel',
    refund: 'refund',
    billing: 'billing',
    cookies: 'cookies'
  };

  const field = fieldMap[type];
  if (!field) throw new Error('Invalid policy type');

  await Admin.findOneAndUpdate(
    { type: 'main' },
    { $set: { [field]: data } }
  );
};

/* ---------------- ORDERS ---------------- */
import Order from '../models/Order.js';

export const getAllOrders = async () => {
  return Order.find().sort({ date: -1 });
};

/* ---------------- PAYMENT SETTINGS ---------------- */
import PaymentSetting from '../models/PaymentSetting.js';

export const getPaymentSettings = async () => {
  return PaymentSetting.find();
};

export const updatePaymentSetting = async ({ provider, isEnabled, isLive, publicKey, secretKey, webhookSecret, currency, monthlyPlanId, yearlyPlanId }) => {
  return PaymentSetting.findOneAndUpdate(
    { provider },
    {
      isEnabled,
      isLive,
      publicKey,
      secretKey,
      webhookSecret,
      currency,
      monthlyPlanId,
      yearlyPlanId
    },
    { new: true, upsert: true }
  );
};

/* ---------------- ORGANIZATIONS ---------------- */
export const getDashboardStatsWithOrgs = async () => {
  const stats = await getDashboardStats();

  const organizations = await User.countDocuments({ isOrganization: true });

  // Count students linked to an organization
  const orgStudents = await User.countDocuments({ role: 'student' });

  const admin = await Admin.findOne({ type: 'main' });

  return {
    ...stats,
    organizations,
    orgStudents,
    admin: {
      email: stats.admin.email,
      websiteName: admin?.websiteName || 'AIstudy',
      websiteLogo: admin?.websiteLogo || '/logo.png'
    }
  };
};

export const getAllOrganizations = async () => {
  return User.find({ isOrganization: true });
};

export const updateOrganization = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new Error('Organization not found');

  user.organizationDetails = { ...user.organizationDetails, ...data };
  // Also update core user fields if needed
  if (data.institutionName) user.mName = data.institutionName;

  await user.save();
  return user;
};


export const createOrganization = async ({ email, password, institutionName, inchargeName, inchargeEmail, inchargePhone, address }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create Organization document
  const newOrgDoc = new Organization({
    name: institutionName,
    email,
    password: hashedPassword,
    address,
    contactNumber: inchargePhone
  });
  await newOrgDoc.save();

  // 2. Create User document with org_admin role
  const newUser = new User({
    email,
    mName: institutionName,
    password: hashedPassword,
    type: 'forever',
    role: 'org_admin',
    isOrganization: true,
    organization: newOrgDoc._id,
    isEmailVerified: true,
    organizationDetails: {
      institutionName,
      inchargeName,
      inchargeEmail,
      inchargePhone,
      address,
      documents: ['', ''],
      isBlocked: false
    }
  });

  await newUser.save();
  return newUser;
};

/* ---------------- SETTINGS ---------------- */
export const getAdminSettings = async () => {
  const admin = await Admin.findOne({ type: 'main' });
  return {
    geminiApiKey: admin?.geminiApiKey || '',
    unsplashApiKey: admin?.unsplashApiKey || '',
    websiteName: admin?.websiteName || 'AIstudy',
    websiteLogo: admin?.websiteLogo || '/logo.png',
    taxPercentage: admin?.taxPercentage || 0
  };
};

export const updateAdminSettings = async (data) => {
  await Admin.findOneAndUpdate(
    { type: 'main' },
    {
      $set: {
        geminiApiKey: data.geminiApiKey,
        unsplashApiKey: data.unsplashApiKey,
        websiteName: data.websiteName,
        websiteLogo: data.websiteLogo,
        taxPercentage: data.taxPercentage
      }
    }
  );
};
export const toggleBlockOrganization = async (id, isBlocked) => {
  // Update Organization document
  await Organization.findByIdAndUpdate(id, { isBlocked });

  // Update Org Admin User document
  await User.findOneAndUpdate(
    { organization: id, role: 'org_admin' },
    { 'organizationDetails.isBlocked': isBlocked }
  );
};

export const toggleBlockUser = async (userId, isBlocked) => {
  await User.findByIdAndUpdate(userId, { isBlocked });
};
