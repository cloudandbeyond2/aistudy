export const PAYPAL_AUTH = Buffer.from(
  process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_APP_SECRET_KEY
).toString('base64');

export const PAYPAL_BASE_URL = 'https://api-m.paypal.com';
