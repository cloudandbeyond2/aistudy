import stripe from '../config/stripe.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import transporter from '../config/mailer.js';

export const createStripeSession = async (planId) => {
  return stripe.checkout.sessions.create({
    success_url: `${process.env.WEBSITE_URL}/payment-success/${planId}`,
    cancel_url: `${process.env.WEBSITE_URL}/payment-failed`,
    line_items: [{ price: planId, quantity: 1 }],
    mode: 'subscription'
  });
};

export const stripeDetails = async ({ subscriberId, uid, plan }) => {
  let cost =
    plan === process.env.MONTH_TYPE
      ? process.env.MONTH_COST
      : process.env.YEAR_COST;

  cost = cost / 4;

  await Admin.findOneAndUpdate({ type: 'main' }, { $inc: { total: cost } });
  await User.findByIdAndUpdate(uid, { type: plan });

  return stripe.checkout.sessions.retrieve(subscriberId);
};

export const cancelStripeSubscription = async ({ id, email }) => {
  await stripe.subscriptions.cancel(id);

  const sub = await Subscription.findOne({ subscriberId: email });
  if (!sub) return;

  await User.findByIdAndUpdate(sub.user, { type: 'free' });
  await Subscription.findOneAndDelete({ subscriberId: id });

  const user = await User.findById(sub.user);
  const Reactivate = `${process.env.WEBSITE_URL}/pricing`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: `${user.mName} Your Subscription Plan Has Been Cancelled`,
    html: `
      <p>${user.mName}, your subscription has been cancelled.</p>
      <a href="${Reactivate}">Reactivate</a>
    `
  });
};
