import axios from 'axios';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import transporter from '../config/mailer.js';

/* ---------------- CONFIG ---------------- */
const getRazorpayConfig = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error('Razorpay keys missing in environment');
  }

  return {
    auth: {
      username: process.env.RAZORPAY_KEY_ID,
      password: process.env.RAZORPAY_KEY_SECRET
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

/* ---------------- CREATE SUBSCRIPTION ---------------- */
export const createRazorpaySubscription = async ({
  plan,
  email,
  fullAddress
}) => {
  if (!plan) {
    throw new Error('plan_id is required');
  }

  const payload = {
    plan_id: plan,          // MUST be plan_xxxxx
    total_count: 12,
    quantity: 1,
    customer_notify: 1,
    notes: {
      address: fullAddress || 'NA'
    }
  };

  console.log('RAZORPAY PAYLOAD:', payload);

  const response = await axios.post(
    'https://api.razorpay.com/v1/subscriptions',
    payload,
    getRazorpayConfig()
  );

  return response.data;
};

/* ---------------- FETCH SUBSCRIPTION ---------------- */
export const getRazorpaySubscription = async (subscriptionId) => {
  if (!subscriptionId) {
    throw new Error('subscriptionId required');
  }

  const response = await axios.get(
    `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
    getRazorpayConfig()
  );

  return response.data;
};

/* ---------------- ACTIVATE SUBSCRIPTION ---------------- */
export const activateRazorpaySubscription = async ({
  uid,
  plan,
  subscriptionId
}) => {
  if (!uid || !subscriptionId) {
    throw new Error('uid & subscriptionId required');
  }

  let cost =
    plan === process.env.MONTH_TYPE
      ? Number(process.env.MONTH_COST)
      : Number(process.env.YEAR_COST);

  cost = cost / 4;

  await Admin.findOneAndUpdate(
    { type: 'main' },
    { $inc: { total: cost } }
  );

  await User.findByIdAndUpdate(uid, { type: plan });

  return getRazorpaySubscription(subscriptionId);
};

/* ---------------- CANCEL SUBSCRIPTION ---------------- */
export const cancelRazorpaySubscription = async (subscriptionId) => {
  await axios.post(
    `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
    { cancel_at_cycle_end: 0 },
    getRazorpayConfig()
  );

  const sub = await Subscription.findOne({ subscription: subscriptionId });
  if (!sub) return;

  const user = await User.findById(sub.user);

  await User.findByIdAndUpdate(sub.user, { type: 'free' });
  await Subscription.findOneAndDelete({ subscription: subscriptionId });

  if (user) {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: `${user.mName}, Subscription Cancelled`,
      html: `<p>Your subscription has been cancelled.</p>`
    });
  }
};
