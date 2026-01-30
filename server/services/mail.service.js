import nodemailer from 'nodemailer';

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

export const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html
  });
};
