// IMPORT
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import gis from 'g-i-s';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { createApi } from 'unsplash-js';
import showdown from 'showdown';
import axios from 'axios';
import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - check both root and server folder
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// Initialize services that need config
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

let flw;
if (process.env.FLUTTERWAVE_PUBLIC_KEY && process.env.FLUTTERWAVE_SECRET_KEY &&
    process.env.FLUTTERWAVE_PUBLIC_KEY !== 'FLWPUBK-placeholder') {
    flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
}

//INITIALIZE
const app = express();

// CORS configuration with multiple allowed origins
const allowedOrigins = [
    process.env.WEBSITE_URL || 'https://aistudy-xi.vercel.app',
    'http://localhost:5173',
    'https://aistudy-xi.vercel.app',
    'http://localhost:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:3000',
    'https://accounts.google.com',
    'https://www.facebook.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // For OAuth providers, allow them even if not in the list
            if (origin && (origin.includes('google.com') || origin.includes('facebook.com') || origin.includes('googleapis.com'))) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));

// Add security headers for OAuth compatibility
app.use((req, res, next) => {
    // Allow cross-origin isolation for OAuth popups
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    // Suppress Permissions Policy warnings
    res.setHeader('Permissions-Policy', 'unload=()');
    next();
});

const PORT = process.env.PORT || 5001;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// MongoDB connection with error handling
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected successfully'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.error('CRITICAL: MONGODB_URI is undefined. Database connection skipped.');
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

// Import all routes from the original server file
// For simplicity, I'll just import the entire server logic
import('./server/server.js').catch(err => {
    console.error('Failed to import server routes:', err);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'running',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

//LISTEN
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`MongoDB URI configured: ${!!process.env.MONGODB_URI}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
