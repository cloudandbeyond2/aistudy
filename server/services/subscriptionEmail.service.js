import nodemailer from 'nodemailer';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

export const sendReceiptEmail = async ({ email, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'Subscription Payment',
    html
  });
};

export const sendRenewEmail = async (subscriptionId) => {
  const subscription = await Subscription.findOne({ subscription: subscriptionId });
  if (!subscription) return;

  const user = await User.findById(subscription.user);
  if (!user) return;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: `${user.mName} Your Subscription Plan Has Been Renewed`,
    html: `...RENEW_HTML_TEMPLATE...`
  });
};

export const sendCancelEmail = async (email, name, subject) => {
  const Reactivate = `${process.env.WEBSITE_URL}/pricing`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: `${name} Your Subscription Plan Has Been ${subject}`,
    html: `...CANCEL_HTML_TEMPLATE...`
  });
};

export const sendExpiryWarningEmail = async (email, name, platformName = 'AI Study') => {
  const renewLink = `${process.env.WEBSITE_URL}/pricing`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Plan Expiry Notice</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          This is a friendly reminder that your subscription plan on <strong>${platformName}</strong> will expire in exactly <strong>7 days</strong>.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          To avoid any interruption in your access and keep enjoying our premium features, please consider renewing your plan.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${renewLink}" style="background-color: #0066cc; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Renew Plan Now</a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
          If you have any questions or need assistance, feel free to contact our support team.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: `Action Required: Your ${platformName} Plan Expires in 7 Days`,
    html
  });
};
