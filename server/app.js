import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

// 🔥 Load env FIRST
import './config/env.js';

// 🔌 DB
import connectDB from './config/db.js';

// ⚙️ Config
import corsOptions from './config/cors.js';
import compressionConfig from './config/compression.js';
import { __dirname } from './config/env.js';

// 🧭 Routes
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import examRoutes from './routes/exam.routes.js';
import contactRoutes from './routes/contact.routes.js';
import notesRoutes from './routes/notes.routes.js';
import blogRoutes from './routes/blog.routes.js';
import pricingRoutes from './routes/pricing.routes.js';
import testimonialRoutes from './routes/testimonial.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import healthRoutes from './routes/health.routes.js';
import mailRoutes from './routes/mail.routes.js';
import aiRoutes from './routes/ai.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import aiExamRoutes from './routes/aiExam.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import razorpayRoutes from './routes/razorpay.routes.js';
import adminRoutes from './routes/admin.routes.js';
import policyRoutes from './routes/policy.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import paystackRoutes from './routes/paystack.routes.js';
import flutterwaveRoutes from './routes/flutterwave.routes.js';
import chatRoutes from './routes/chat.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import orgRoutes from './routes/org.routes.js';

// -------------------- INIT --------------------
connectDB();
const app = express();

// -------------------- STATIC (NON-VERCEL) --------------------
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}
app.use('/uploads', express.static('uploads'));

// -------------------- MIDDLEWARES --------------------
app.use(cors(corsOptions));
app.use(compressionConfig);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// OAuth-safe security headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Permissions-Policy', 'unload=()');
  next();
});

// -------------------- ROUTES --------------------
app.use('/api', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', certificateRoutes);
app.use('/api', orgRoutes);
app.use('/api', examRoutes);
app.use('/api', contactRoutes);
app.use('/api', notesRoutes);
app.use('/api', blogRoutes);
app.use('/api', pricingRoutes);
app.use('/api', testimonialRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', healthRoutes);
app.use('/api', mailRoutes);
app.use('/api', aiRoutes);
app.use('/api', paypalRoutes);
app.use('/api', aiExamRoutes);
app.use('/api', receiptRoutes);
app.use('/api', razorpayRoutes);
app.use('/api', adminRoutes);
app.use('/api', policyRoutes);
app.use('/api', stripeRoutes);
app.use('/api', paystackRoutes);
app.use('/api', flutterwaveRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);
app.use('/api/notifications', notificationRoutes);

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  if (err instanceof Error && err.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size too large. Max limit is 10MB.' });
  }
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;
