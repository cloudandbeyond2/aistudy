import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import transporter from '../config/mailer.js';

/**
 * SEND CANCEL EMAIL
 */
const sendCancelEmail = async (email, name, reason) => {
  const reactivateUrl = `${process.env.WEBSITE_URL}/pricing`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: `${name} Your Subscription Has Been ${reason}`,
    html: `
      <h2>Subscription ${reason}</h2>
      <p>Hello ${name},</p>
      <p>Your subscription has been <strong>${reason}</strong>.</p>
      <p>You can reactivate anytime:</p>
      <a href="${reactivateUrl}">Reactivate Subscription</a>
      <br/><br/>
      <p>— ${process.env.COMPANY} Team</p>
    `
  });
};

/**
 * SEND RENEW EMAIL
 */
const sendRenewEmail = async (email, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: `${name}, Your Subscription Has Been Renewed 🎉`,
    html: `
      <h2>Subscription Renewed</h2>
      <p>Hello ${name},</p>
      <p>Your subscription has been successfully renewed.</p>
      <p>Thank you for continuing with us!</p>
      <br/>
      <p>— ${process.env.COMPANY} Team</p>
    `
  });
};

/**
 * CANCEL / EXPIRE / SUSPEND SUBSCRIPTION
 */
export const cancelSubscription = async (subscriptionId, reason) => {
  try {
    const sub = await Subscription.findOne({ subscription: subscriptionId });
    if (!sub) return;

    // Downgrade user
    await User.findByIdAndUpdate(sub.user, { type: 'free' });

    // Fetch user details
    const user = await User.findById(sub.user);

    // Delete subscription
    await Subscription.findOneAndDelete({ subscription: subscriptionId });

    // Notify user
    if (user) {
      await sendCancelEmail(user.email, user.mName, reason);
    }
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
  }
};

/**
 * RENEW SUBSCRIPTION (PAYPAL PAYMENT SUCCESS)
 */
export const renewSubscription = async (subscriptionId) => {
  try {
    const sub = await Subscription.findOne({ subscription: subscriptionId });
    if (!sub) return;

    const user = await User.findById(sub.user);
    if (!user) return;

    // Send renewal confirmation
    await sendRenewEmail(user.email, user.mName);
  } catch (error) {
    console.error('Renew Subscription Error:', error);
  }
};
