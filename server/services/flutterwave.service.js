import Flutterwave from 'flutterwave-node-v3';
import PaymentSetting from '../models/PaymentSetting.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import transporter from '../config/mailer.js';
import Admin from '../models/Admin.js';


const getFlutterwave = async () => {
  const setting = await PaymentSetting.findOne({ provider: 'flutterwave' });
  let publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY;
  let secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  if (setting && setting.isEnabled && setting.publicKey && setting.secretKey) {
    publicKey = setting.publicKey;
    secretKey = setting.secretKey;
  }
  return new Flutterwave(publicKey, secretKey);
};

export const cancelFlutterwaveSubscription = async ({ code, token, email }) => {
  // Cancel on Flutterwave
  const flw = await getFlutterwave();
  const response = await flw.Subscription.cancel({ id: code });

  if (!response || response.status !== 'success') {
    throw new Error('Flutterwave cancellation failed');
  }

  // DB operations
  const subscription = await Subscription.findOne({ subscriberId: email });
  if (!subscription) return;

  const userId = subscription.user;

  await User.findByIdAndUpdate(userId, { type: 'free' });
  await Subscription.findOneAndDelete({ subscriberId: token });

  const user = await User.findById(userId);
  const reactivateUrl = `${process.env.WEBSITE_URL}/pricing`;

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: `${user.mName} Your Subscription Plan Has Been Cancelled`,
    html: `
      <p>${user.mName}, your subscription plan has been cancelled.</p>
      <p>
        <a href="${reactivateUrl}"
           style="padding:12px 20px;
                  background:#007BFF;
                  color:#fff;
                  text-decoration:none;
                  border-radius:4px;">
          Reactivate
        </a>
      </p>
      <p>— ${process.env.COMPANY}</p>
    `
  });
};
export const getFlutterwaveSubscriptionDetails = async ({
  email,
  uid,
  plan
}) => {
  // Calculate cost
  let cost =
    plan === process.env.MONTH_TYPE
      ? process.env.MONTH_COST
      : process.env.YEAR_COST;

  cost = cost / 4;

  // Update admin revenue
  await Admin.findOneAndUpdate(
    { type: 'main' },
    { $inc: { total: cost } }
  );

  // Update user plan
  const updatedUser = await User.findByIdAndUpdate(uid, { type: plan }, { new: true });

  // Fetch Flutterwave subscription
  const payload = { email };
  const flw = await getFlutterwave();
  const response = await flw.Subscription.get(payload);

  if (!response?.data?.length) {
    throw new Error('No subscription found');
  }

  return {
    ...response.data[0],
    user: updatedUser
  };
};