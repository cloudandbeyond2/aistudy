import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  service: 'gmail',
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

export default transporter;
