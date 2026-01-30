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
