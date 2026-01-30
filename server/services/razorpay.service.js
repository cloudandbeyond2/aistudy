import axios from 'axios';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import transporter from '../config/mailer.js';

/* ---------------- CONFIG ---------------- */
const getRazorpayConfig = () => ({
  auth: {
    username: process.env.RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

/* ---------------- EMAIL HELPERS ---------------- */
const sendCancelEmail = async (user) => {
  const reactivate = `${process.env.WEBSITE_URL}/pricing`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: `${user.mName}, Your Subscription Has Been Cancelled`,
    html: `
      <h2>Subscription Cancelled</h2>
      <p>Hello ${user.mName},</p>
      <p>Your subscription has been cancelled.</p>
      <a href="${reactivate}">Reactivate Subscription</a>
      <br/><br/>
      <strong>${process.env.COMPANY}</strong>
    `
  });
};

const sendRenewEmail = async (user) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: `${user.mName}, Subscription Renewed 🎉`,
    html: `
      <h2>Subscription Renewed</h2>
      <p>Hello ${user.mName},</p>
      <p>Your subscription has been renewed successfully.</p>
      <strong>${process.env.COMPANY}</strong>
    `
  });
};

/* ---------------- CREATE SUBSCRIPTION ---------------- */
export const createRazorpaySubscription = async ({ plan, email, fullAddress }) => {
  const payload = {
    plan_id: plan,
    total_count: 12,
    quantity: 1,
    customer_notify: 1,
    notes: { address: fullAddress },
    notify_info: { notify_email: email }
  };

  const response = await axios.post(
    'https://api.razorpay.com/v1/subscriptions',
    payload,
    getRazorpayConfig()
  );

  return response.data;
};

/* ---------------- FETCH SUBSCRIPTION ---------------- */
export const getRazorpaySubscription = async (subscriptionId) => {
  const response = await axios.get(
    `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
    getRazorpayConfig()
  );

  return response.data;
};

/* ---------------- ACTIVATE SUBSCRIPTION ---------------- */
export const activateRazorpaySubscription = async ({ uid, plan, subscriptionId }) => {
  let cost =
    plan === process.env.MONTH_TYPE
      ? process.env.MONTH_COST
      : process.env.YEAR_COST;

  cost = cost / 4;

  await Admin.findOneAndUpdate({ type: 'main' }, { $inc: { total: cost } });
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

  if (user) await sendCancelEmail(user);
};

/* ---------------- RENEW (WEBHOOK) ---------------- */
export const renewRazorpaySubscription = async (subscriptionId) => {
  const sub = await Subscription.findOne({ subscription: subscriptionId });
  if (!sub) return;

  const user = await User.findById(sub.user);
  if (user) await sendRenewEmail(user);
};
