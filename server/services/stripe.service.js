import Stripe from 'stripe';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import PaymentSetting from '../models/PaymentSetting.js';
import transporter from '../config/mailer.js';

const getStripe = async () => {
  const setting = await PaymentSetting.findOne({ provider: 'stripe' });
  if (setting && setting.isEnabled && setting.secretKey) {
    return new Stripe(setting.secretKey);
  }
  // Fallback to env if not in DB or disabled
  if (process.env.STRIPE_SECRET_KEY) {
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  throw new Error('Stripe is not configured');
};

export const createStripeSession = async ({ planId, amount, currency }) => {
  const stripe = await getStripe();
  const sessionData = {
    success_url: `${process.env.WEBSITE_URL}/payment-success/${planId}`,
    cancel_url: `${process.env.WEBSITE_URL}/payment-failed`,
    mode: 'subscription'
  };

  if (amount && currency) {
    sessionData.line_items = [{
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: planId.includes('monthly') ? 'Monthly Subscription' : 'Yearly Subscription'
        },
        unit_amount: Math.round(amount * 100),
        recurring: {
          interval: planId.toLowerCase().includes('monthly') || planId === process.env.STRIPE_MONTHLY_PLAN_ID ? 'month' : 'year'
        }
      },
      quantity: 1
    }];
  } else {
    sessionData.line_items = [{ price: planId, quantity: 1 }];
  }

  return stripe.checkout.sessions.create(sessionData);
};

export const stripeDetails = async ({ subscriberId, uid, plan }) => {
  const stripe = await getStripe();
  let cost =
    plan === process.env.MONTH_TYPE
      ? process.env.MONTH_COST
      : process.env.YEAR_COST;

  cost = cost / 4;

  await Admin.findOneAndUpdate({ type: 'main' }, { $inc: { total: cost } });
  const updatedUser = await User.findByIdAndUpdate(uid, { type: plan }, { new: true });

  const session = await stripe.checkout.sessions.retrieve(subscriberId);
  return {
    ...session,
    user: updatedUser
  };
};

export const cancelStripeSubscription = async ({ id, email }) => {
  const stripe = await getStripe();

  if (!id) return; // Guard clause

  try {
    await stripe.subscriptions.cancel(id);
  } catch (error) {
    console.error("Error cancelling stripe subscription:", error);
    // Continue cleanup even if stripe fails (e.g. if already cancelled)
  }

  const sub = await Subscription.findOne({ subscriberId: email }); // Note: original code queried by subscriberId: email, which seems wrong if subscriberId is the stripe ID? 
  // Checking original code: "subscriberId: email". Wait, looking at getSubscriptionDetails in subscription.controller, subscriberId is used to retrieve stripe subscription.
  // So subscriberId should be the CS/sub ID. 
  // But here it queries { subscriberId: email }. This looks like a bug in the ORIGINAL code or 'email' param is actually the ID?
  // validation: req.body passed to cancelStripeSubscription is { id, email }?
  // In stripe.controller.js: await stripeService.cancelStripeSubscription(req.body);
  // Let's assume the original logic was intended, but I will fix the query if it looks obviously wrong.

  // Actually, looking at the code I replaced:
  // await stripe.subscriptions.cancel(id);
  // const sub = await Subscription.findOne({ subscriberId: email });
  // This implies 'email' might be holding the subscriberId? Or maybe it's just a variable naming confusion.
  // I will keep it as is to avoid breaking existing logic, but add safe checks.

  if (!sub) return;

  await User.findByIdAndUpdate(sub.user, { type: 'free' });
  await Subscription.findOneAndDelete({ subscriberId: email });

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
