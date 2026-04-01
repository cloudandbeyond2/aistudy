import User from '../models/User.js';
import Organization from '../models/Organization.js';
import LimitRequest from '../models/LimitRequest.js';
import StaffCourseLimitRequest from '../models/StaffCourseLimitRequest.js';
import bcrypt from 'bcrypt';
import Course from '../models/Course.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';
import OrganizationPlan from '../models/OrganizationPlan.js';
import Department from '../models/Department.js';
import OrgCourse from '../models/OrgCourse.js';
import Assignment from '../models/Assignment.js';
import Notice from '../models/Notice.js';
import Meeting from '../models/Meeting.js';
import Material from '../models/Material.js';
import Schedule from '../models/Schedule.js';
import Project from '../models/Project.js';
import PlacementProfile from '../models/PlacementProfile.js';
import DeptCourseLimitRequest from '../models/DeptCourseLimitRequest.js';
import LoginActivity from '../models/LoginActivity.js';
import Exam from '../models/Exam.js';

import { addOneMonthSafe } from '../utils/date.utils.js';
import { getUserAccessFromOrgPlan } from '../utils/orgPlanAccess.js';
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
const populateAdminUserQuery = (query) =>
  query
    .populate('department', 'name')
    .populate('organization', 'name email')
    .populate('organizationId', 'mName email organizationDetails role');

const getUserCategory = (user) => {
  if (user.isOrganization || user.role === 'org_admin') return 'organization';
  if (user.role === 'dept_admin') return 'organization_staff';
  if (user.role === 'student') return 'student';
  if (user.type && user.type !== 'free') return 'premium';
  return 'free';
};

const getOrganizationName = (user) => {
  return (
    user.organizationDetails?.institutionName ||
    user.organizationId?.organizationDetails?.institutionName ||
    user.organizationId?.mName ||
    user.organization?.name ||
    ''
  );
};

const getDepartmentName = (user) => {
  return user.department?.name || user.studentDetails?.department || '';
};

const enrichUsersForAdmin = async (users) => {
  if (!users.length) return [];

  const userIds = users.map((user) => user._id);
  const userEmails = users
    .map((user) => user.email)
    .filter(Boolean);

  const [subscriptions, orders] = await Promise.all([
    Subscription.find({ user: { $in: userIds } }).lean(),
    Order.find({
      $or: [
        { userId: { $in: userIds } },
        { userEmail: { $in: userEmails } }
      ]
    })
      .sort({ date: -1, createdAt: -1 })
      .lean()
  ]);

  const subscriptionMap = new Map(
    subscriptions.map((subscription) => [String(subscription.user), subscription])
  );

  const latestOrderByUserId = new Map();
  const latestOrderByEmail = new Map();

  orders.forEach((order) => {
    if (order.userId) {
      const key = String(order.userId);
      if (!latestOrderByUserId.has(key)) {
        latestOrderByUserId.set(key, order);
      }
    }

    if (order.userEmail) {
      const emailKey = String(order.userEmail).toLowerCase();
      if (!latestOrderByEmail.has(emailKey)) {
        latestOrderByEmail.set(emailKey, order);
      }
    }
  });

  return users.map((user) => {
    const latestOrder =
      latestOrderByUserId.get(String(user._id)) ||
      latestOrderByEmail.get(String(user.email || '').toLowerCase()) ||
      null;

    return {
      ...user,
      adminCategory: getUserCategory(user),
      organizationName: getOrganizationName(user) || null,
      departmentName: getDepartmentName(user) || null,
      subscription: subscriptionMap.get(String(user._id)) || null,
      latestOrder
    };
  });
};

export const getAllUsers = async () => {
  const users = await populateAdminUserQuery(User.find({})).lean();
  return enrichUsersForAdmin(users);
};

export const getPaidUsers = async () => {
  const paidUsers = await populateAdminUserQuery(
    User.find({ type: { $ne: 'free' } })
  ).lean();

  return enrichUsersForAdmin(paidUsers);
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
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }

  const isOrganizationRoot = user.isOrganization || user.role === 'org_admin';

  if (!isOrganizationRoot) {
    await User.findByIdAndDelete(userId);
    await Subscription.findOneAndDelete({ user: userId });
    await Course.deleteMany({ user: userId });
    return;
  }

  const organizationId = user.organization;
  if (!organizationId) {
    await User.findByIdAndDelete(userId);
    await Subscription.findOneAndDelete({ user: userId });
    await Course.deleteMany({ user: String(userId) });
    return;
  }

  const orgUserIds = await User.find({
    $or: [
      { _id: userId },
      { organization: organizationId },
      { organizationId: userId }
    ]
  }).distinct('_id');

  const orgUserIdStrings = orgUserIds.map((id) => String(id));

  await Promise.all([
    User.deleteMany({
      $or: [
        { _id: { $in: orgUserIds } },
        { organization: organizationId },
        { organizationId: userId }
      ]
    }),
    Subscription.deleteMany({ user: { $in: orgUserIds } }),
    Course.deleteMany({
      $or: [
        { user: { $in: orgUserIdStrings } },
        { user: userId },
        { organizationId }
      ]
    }),
    OrganizationPlan.deleteMany({ organization: organizationId }),
    Organization.deleteOne({ _id: organizationId }),
    Department.deleteMany({ organizationId }),
    OrgCourse.deleteMany({ organizationId }),
    Assignment.deleteMany({ organizationId }),
    Notice.deleteMany({ organizationId }),
    Meeting.deleteMany({ organizationId }),
    Material.deleteMany({ organizationId }),
    Schedule.deleteMany({ organizationId }),
    Project.deleteMany({ organizationId }),
    PlacementProfile.deleteMany({ organizationId }),
    LimitRequest.deleteMany({ organizationId }),
    StaffCourseLimitRequest.deleteMany({ organizationId }),
    DeptCourseLimitRequest.deleteMany({ organizationId }),
    LoginActivity.deleteMany({ organization: organizationId }),
    Exam.deleteMany({ organizationId: String(organizationId) })
  ]);
};

// export const updateUser = async ({ userId, mName, email, type }) => {
//   await User.findByIdAndUpdate(userId, { mName, email, type });
// };

/* ---------------- COURSES ---------------- */
export const getAllCourses = async () => {
  return Course.find({})
    .select('_id user organizationId mainTopic type photo date end completed restricted')
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
      email: stats.admin?.email,
      websiteName: admin?.websiteName || 'Colossus IQ',
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
      },
      interviewEnabled: admin?.interviewEnabled || {
        free: false,
        monthly: true,
        yearly: true,
        forever: true,
        org_admin: true,
        student: false
      }
    }
  };
};

export const getAllOrganizations = async () => {
  const orgs = await User.find({ isOrganization: true }).lean();
  
  return Promise.all(
    orgs.map(async (org) => {
      const plan = await OrganizationPlan.findOne({ organization: org.organization, isActive: true }).lean();
      return { 
        ...org, 
        planName: plan?.planName || 'No Plan',
        planEndDate: plan?.endDate || null
      };
    })
  );
};
 
export const getOrgPlan = async (organizationId) => {
  const plan = await OrganizationPlan.findOne({ organization: organizationId }).lean();
  return plan;
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
  const organizationUpdates = {
      studentSlot: data.studentSlot,
      customStudentLimit: data.customStudentLimit,
      name: data.institutionName || undefined,
      address: data.address || undefined
  };

  if (data.planDuration) {
    organizationUpdates.plan = data.planDuration;
  }

  await Organization.findByIdAndUpdate(user.organization, organizationUpdates);
 
  // Update OrganizationPlan if planDuration is provided
  if (data.planDuration) {
    const slotsMap = {
      '1months': 20,
      '3months': 60,
      '6months': 120
    };
    const aiCourseSlots = slotsMap[data.planDuration] || 20;

    const updatedPlan = await OrganizationPlan.findOneAndUpdate(
      { organization: user.organization },
      { 
        planName: data.planDuration,
        aiCourseSlots: aiCourseSlots,
        isActive: true
      },
      { upsert: true, new: true }
    );

    const userAccess = getUserAccessFromOrgPlan(data.planDuration, updatedPlan?.startDate || new Date());
    await User.updateMany(
      { organization: user.organization, role: { $in: ['org_admin', 'dept_admin'] } },
      {
        $set: {
          type: userAccess.type,
          subscriptionStart: updatedPlan?.startDate || userAccess.subscriptionStart,
          subscriptionEnd: updatedPlan?.endDate || userAccess.subscriptionEnd
        }
      }
    );
  }

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

/* ---------------- STAFF COURSE LIMIT REQUESTS ---------------- */
export const getAllStaffCourseLimitRequests = async () => {
    return StaffCourseLimitRequest.find()
        .populate('organizationId', 'name email')
        .populate('requestedBy', 'mName email')
        .populate('staffId', 'mName email courseLimit coursesCreatedCount')
        .sort({ createdAt: -1 });
};

export const processStaffCourseLimitRequest = async (requestId, status, adminComment) => {
    const request = await StaffCourseLimitRequest.findById(requestId);
    if (!request) throw new Error('Request not found');

    const normalized = String(status || '').toLowerCase();
    if (!['approved', 'rejected'].includes(normalized)) {
        throw new Error('Invalid status');
    }

    request.status = normalized;
    request.adminComment = String(adminComment || '');
    request.processedAt = new Date();
    await request.save();

    if (request.status === 'approved') {
        await User.findByIdAndUpdate(request.staffId, { $set: { courseLimit: request.requestedCourseLimit } });
    }

    return request;
};


export const createOrganization = async ({ email, password, institutionName, inchargeName, inchargeEmail, inchargePhone, address, studentSlot, customStudentLimit, planDuration }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const selectedPlan = planDuration || '1months';
  const userAccess = getUserAccessFromOrgPlan(selectedPlan);

  // 1. Create Organization document
  const newOrgDoc = new Organization({
    name: institutionName,
    email,
    password: hashedPassword,
    address,
    contactNumber: inchargePhone,
    plan: selectedPlan,
    studentSlot: studentSlot || 1,
    customStudentLimit: customStudentLimit || 0
  });
  await newOrgDoc.save();

  // 2. Create User document with org_admin role
  const newUser = new User({
    email,
    mName: institutionName,
    password: hashedPassword,
    type: userAccess.type,
    role: 'org_admin',
    isOrganization: true,
    organization: newOrgDoc._id,
    isEmailVerified: true,
    subscriptionStart: userAccess.subscriptionStart,
    subscriptionEnd: userAccess.subscriptionEnd,
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
 
  // 3. Create OrganizationPlan document
  const slotsMap = {
    '1months': 20,
    '3months': 60,
    '6months': 120
  };
  
  const aiCourseSlots = slotsMap[selectedPlan] || 20;

  const newPlan = new OrganizationPlan({
    organization: newOrgDoc._id,
    planName: selectedPlan,
    aiCourseSlots: aiCourseSlots,
    startDate: new Date(),
    isActive: true
  });
  await newPlan.save();

  // Send account creation email to Org
  try {
    const loginUrl = `${process.env.WEBSITE_URL}/login`;
    await sendMail({
      to: email,
      subject: `Organization Account Created - ${institutionName}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Account Created</title>
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f4f6fb;">
Your organization account is ready. Access your dashboard now.
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#f4f6fb;">
<tr>
<td align="center">

<table width="560" style="max-width:560px;width:100%;">

<!-- Logo -->
<tr>
<td align="center" style="padding-bottom:24px;">
  <div style="font-size:20px;font-weight:700;color:#111827;">
    Colossus IQ <span style="color:#4f6ef7;">AI Solutions</span>
  </div>
</td>
</tr>

<!-- Card -->
<tr>
<td style="background:#ffffff;border-radius:14px;box-shadow:0 10px 25px rgba(0,0,0,0.05);overflow:hidden;">

<!-- Top Accent -->
<div style="height:4px;background:linear-gradient(90deg,#4f6ef7,#7c3aed);"></div>

<!-- Content -->
<div style="padding:40px 36px;">

<h2 style="margin:0 0 10px;font-size:22px;color:#111827;">
🚀 Your Organization is Ready
</h2>

<p style="margin:0 0 25px;color:#6b7280;font-size:14px;">
Your institutional workspace has been successfully created.
</p>

<p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:25px;">
Hello <strong>${institutionName}</strong>,<br><br>
Your account has been created on 
<strong>${process.env.COMPANY || "Colossus IQ AI Solutions"}</strong>.
Use the credentials below to get started.
</p>

<!-- Credentials Card -->
<div style="background:#f9fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:28px;">

<!-- URL -->
<div style="margin-bottom:15px;">
  <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;">Login URL</div>
  <a href="${loginUrl}" style="color:#4f6ef7;font-weight:600;text-decoration:none;font-size:14px;">
    ${loginUrl}
  </a>
</div>

<!-- Email -->
<div style="margin-bottom:15px;">
  <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;">Email</div>
  <div style="font-family:monospace;color:#111827;font-size:14px;">
    ${email}
  </div>
</div>

<!-- Password -->
<div>
  <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;">Password</div>
  <div style="font-family:monospace;color:#111827;font-size:14px;">
    ${password}
  </div>
</div>

</div>

<!-- Button -->
<div style="text-align:center;margin-bottom:28px;">
  <a href="${loginUrl}" 
     style="background:linear-gradient(90deg,#4f6ef7,#7c3aed);
     color:#ffffff;
     padding:14px 32px;
     font-size:15px;
     font-weight:600;
     text-decoration:none;
     border-radius:8px;
     display:inline-block;">
     Login to Dashboard →
  </a>
</div>

<!-- Security Note -->
<div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:6px;">
  <p style="margin:0;font-size:13px;color:#92400e;">
    <strong>Security Tip:</strong> Change your password after first login and never share credentials.
  </p>
</div>

</div>
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="padding-top:24px;">
  <p style="font-size:12px;color:#9ca3af;margin:0;">
    This is an automated email. Please do not reply.
  </p>
  <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;">
    © ${new Date().getFullYear()} ${process.env.COMPANY || "Colossus IQ AI Solutions"}.
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
    aiProvider: admin?.aiProvider || 'gemini',
    geminiApiKey: admin?.geminiApiKey || '',
    geminiModel: admin?.geminiModel || 'gemini-2.5-flash',
    openaiApiKey: admin?.openaiApiKey || '',
    openaiModel: admin?.openaiModel || 'gpt-4.1-mini',
    unsplashApiKey: admin?.unsplashApiKey || '',
    websiteName: admin?.websiteName || 'Colossus IQ',
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
    },
    interviewEnabled: admin?.interviewEnabled || {
      free: false,
      monthly: true,
      yearly: true,
      forever: true,
      org_admin: true,
      student: false
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

  const updatePayload = {
    aiProvider: data.aiProvider || 'gemini',
    geminiApiKey: data.geminiApiKey || '',
    geminiModel: data.geminiModel || 'gemini-2.5-flash',
    openaiApiKey: data.openaiApiKey || '',
    openaiModel: data.openaiModel || 'gpt-4.1-mini',
    unsplashApiKey: data.unsplashApiKey || '',
    websiteName: data.websiteName,
    websiteLogo: data.websiteLogo,
    taxPercentage: data.taxPercentage,
    notebookEnabled: data.notebookEnabled,
    resumeEnabled: data.resumeEnabled,
    careerEnabled: data.careerEnabled,
    interviewEnabled: data.interviewEnabled
  };

  Object.assign(admin, updatePayload);
  await admin.save();

  await Admin.updateOne(
    { _id: admin._id },
    { $set: updatePayload },
    { strict: false }
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
