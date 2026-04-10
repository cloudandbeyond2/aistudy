const allowedOrigins = [
  process.env.WEBSITE_URL ||
  'https://colossusiq.ai',
  'http://localhost:4173',
  'https://api.colossusiq.ai',
  'http://localhost:5001',
  'https://accounts.google.com',
  'https://www.facebook.com'
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes('google.com') ||
      origin.includes('facebook.com') ||
      origin.includes('googleapis.com') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-user-id',
    'user-id'
  ],
  optionsSuccessStatus: 200
};

export default corsOptions;
