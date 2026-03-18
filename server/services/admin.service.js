import User from '../models/User.js';
import Organization from '../models/Organization.js';
import LimitRequest from '../models/LimitRequest.js';
import bcrypt from 'bcrypt';
import Course from '../models/Course.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';

import { addOneMonthSafe } from '../utils/date.utils.js';
import { sendMail } from './mail.service.js';
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

export const updateOrder = async (id, updateData) => {
  try {
    // findByIdAndUpdate will update the fields provided in the payload
    const order = await Order.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true } // returns the updated document
    );
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  } catch (error) {
    throw error;
  }
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
      websiteLogo: admin?.websiteLogo || '/logo.png',
      notebookEnabled: admin?.notebookEnabled || {
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: false
      },
      resumeEnabled: admin?.resumeEnabled || {
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: false
      },
      careerEnabled: admin?.careerEnabled || {
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: true
      }
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

  // Update new limit fields if provided
  if (data.studentSlot !== undefined) user.organizationDetails.studentSlot = data.studentSlot;
  if (data.customStudentLimit !== undefined) user.organizationDetails.customStudentLimit = data.customStudentLimit;

  await user.save();

  // Also update the Organization model document
  await Organization.findByIdAndUpdate(user.organization, {
      studentSlot: data.studentSlot,
      customStudentLimit: data.customStudentLimit,
      name: data.institutionName || undefined,
      address: data.address || undefined
  });

  return user;
};

/* ---------------- LIMIT REQUESTS ---------------- */
export const getAllLimitRequests = async () => {
    return LimitRequest.find()
        .populate('organizationId', 'name email studentSlot customStudentLimit')
        .populate('adminId', 'mName email')
        .sort({ createdAt: -1 });
};

export const processLimitRequest = async (requestId, status, adminComment) => {
    const request = await LimitRequest.findById(requestId);
    if (!request) throw new Error('Request not found');

    request.status = status.toLowerCase(); // Standardize to lowercase
    request.adminComment = adminComment;
    await request.save();

    if (request.status === 'approved') {
        const updateData = {};
        if (request.requestedSlot) updateData.studentSlot = request.requestedSlot;
        if (request.requestedCustomLimit) updateData.customStudentLimit = request.requestedCustomLimit;

        // Update Organization
        await Organization.findByIdAndUpdate(request.organizationId, updateData);

        // Update Org Admin User
        await User.findOneAndUpdate(
            { organization: request.organizationId, role: 'org_admin' },
            { 
                'organizationDetails.studentSlot': request.requestedSlot,
                'organizationDetails.customStudentLimit': request.requestedCustomLimit
            }
        );
    }

    return request;
};


export const createOrganization = async ({ email, password, institutionName, inchargeName, inchargeEmail, inchargePhone, address, studentSlot, customStudentLimit }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create Organization document
  const newOrgDoc = new Organization({
    name: institutionName,
    email,
    password: hashedPassword,
    address,
    contactNumber: inchargePhone,
    studentSlot: studentSlot || 1,
    customStudentLimit: customStudentLimit || 0
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
      isBlocked: false,
      studentSlot: studentSlot || 1,
      customStudentLimit: customStudentLimit || 0
    }
  });

  await newUser.save();

  // Send account creation email to Org
  try {
    const loginUrl = `${process.env.WEBSITE_URL}/login`;
    await sendMail({
      to: email,
      subject: `Organization Account Created - ${institutionName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Organization Account Created</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">
<table width="700" cellpadding="0" cellspacing="0" style="background:#e9e9e9;border-radius:10px;border:1px solid #d0d0d0;">
<tr>
<td style="padding:35px 40px; color:#333;">
<h2 style="text-align:center;margin-top:0;margin-bottom:25px;color:#333;">Organization Account Created</h2>
<p>Hello <strong>${institutionName}</strong>,</p>
<p>An institutional account has been created for you on <strong>${process.env.COMPANY || "Traininglabs Ai Solutions"}</strong>.</p>
<p>You can now log in using the following details:</p>
<ul style="list-style:none;padding:0;">
<li><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></li>
<li><strong>Email:</strong> ${email}</li>
</ul>
<p>For security reasons, your password is not included in this email. Please use the password provided by your administrator.</p>
<div style="text-align:center;margin:35px 0;">
<a href="${loginUrl}" style="background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:bold;display:inline-block;font-size:15px;">Login to Dashboard</a>
</div>
<hr style="border:none;border-top:1px solid #cfcfcf;margin:30px 0;">
<p style="text-align:center;font-size:12px;color:#666;margin-bottom:0;">
© ${new Date().getFullYear()} ${process.env.COMPANY || "Traininglabs Ai Solutions"}. All rights reserved.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`
    });
  } catch (mailErr) {
    console.error("Org Creation Mail Send Error:", mailErr);
  }

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
    taxPercentage: admin?.taxPercentage || 0,
    notebookEnabled: admin?.notebookEnabled || {
      free: false,
      monthly: true,
      yearly: true,
      forever: true,
      org_admin: true,
      student: false
    },
    resumeEnabled: admin?.resumeEnabled || {
      free: false,
      monthly: true,
      yearly: true,
      forever: true,
      org_admin: true,
      student: false
    },
    careerEnabled: admin?.careerEnabled || {
      free: false,
      monthly: true,
      yearly: true,
      forever: true,
      org_admin: true,
      student: true
    }
  };
};

export const updateAdminSettings = async (data) => {
  let admin = await Admin.findOne({ type: 'main' });

  if (!admin) {
    const existingAdmins = await Admin.find({});
    if (existingAdmins.length > 0) {
      admin = existingAdmins[0];
      admin.type = 'main';
    } else {
      admin = new Admin({
        email: 'admin@system.local',
        type: 'main',
        mName: 'System Admin'
      });
    }
  }

  admin.geminiApiKey = data.geminiApiKey;
  admin.unsplashApiKey = data.unsplashApiKey;
  admin.websiteName = data.websiteName;
  admin.websiteLogo = data.websiteLogo;
  admin.taxPercentage = data.taxPercentage;
  admin.notebookEnabled = data.notebookEnabled;
  admin.resumeEnabled = data.resumeEnabled;
  admin.careerEnabled = data.careerEnabled;

  await admin.save();
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
