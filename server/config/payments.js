import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';

let stripe = null;
let flw = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

if (
  process.env.FLUTTERWAVE_PUBLIC_KEY &&
  process.env.FLUTTERWAVE_SECRET_KEY
) {
  flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
  );
}

export { stripe, flw };
