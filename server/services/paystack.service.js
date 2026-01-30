import paystack from '../config/paystack.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import transporter from '../config/mailer.js';

export const initializePayment = async ({ planId, amountInZar, email }) => {
  const response = await paystack.post('/transaction/initialize', {
    email,
    amount: amountInZar,
    plan: planId
  });

  if (!response.data.status) {
    throw new Error('Paystack initialization failed');
  }

  return response.data.data.authorization_url;
};

export const fetchSubscription = async ({ email, uid, plan }) => {
  const response = await paystack.get('/subscription');
  const subscriptions = response.data.data;

  const subscription = subscriptions.find(
    (sub) => sub.customer.email === email
  );

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  let cost =
    plan === process.env.MONTH_TYPE
      ? process.env.MONTH_COST
      : process.env.YEAR_COST;

  cost = cost / 4;

  await Admin.findOneAndUpdate({ type: 'main' }, { $inc: { total: cost } });
  await User.findByIdAndUpdate(uid, { type: plan });

  return {
    subscription_code: subscription.subscription_code,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    customer_code: subscription.customer.customer_code
  };
};

export const cancelSubscription = async ({ code, token, email }) => {
  await paystack.post('/subscription/disable', {
    code,
    token
  });

  const subscription = await Subscription.findOne({ subscriberId: email });
  if (!subscription) return;

  const userId = subscription.user;

  await User.findByIdAndUpdate(userId, { type: 'free' });
  await Subscription.findOneAndDelete({ subscriberId: code });

  const user = await User.findById(userId);
  const reactivateUrl = `${process.env.WEBSITE_URL}/pricing`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: `${user.mName} Your Subscription Plan Has Been Cancelled`,
    html: `
      <p>${user.mName}, your subscription has been cancelled.</p>
      <a href="${reactivateUrl}">Reactivate</a>
    `
  });
};
