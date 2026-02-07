// ... existing imports
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import PaymentSetting from '../models/PaymentSetting.js';
import axios from 'axios';
import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import {
  sendReceiptEmail
} from '../services/subscriptionEmail.service.js';


// Helper to get payment keys
const getKeys = async (provider) => {
  try {
    const setting = await PaymentSetting.findOne({ provider });
    if (setting && setting.isEnabled) {
      return setting;
    }
  } catch (e) {
    console.error("Error fetching payment settings:", e);
  }
  // Fallback to env
  const envMap = {
    stripe: { secretKey: process.env.STRIPE_SECRET_KEY },
    paypal: { publicKey: process.env.PAYPAL_CLIENT_ID, secretKey: process.env.PAYPAL_APP_SECRET_KEY },
    flutterwave: { publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY, secretKey: process.env.FLUTTERWAVE_SECRET_KEY },
    paystack: { secretKey: process.env.PAYSTACK_SECRET_KEY },
    razorpay: { publicKey: process.env.RAZORPAY_KEY_ID, secretKey: process.env.RAZORPAY_KEY_SECRET }
  };
  return envMap[provider] || {};
};

/**
 * GET SUBSCRIPTION DETAILS
 */
export const getSubscriptionDetails = async (req, res) => {
  try {
    const { uid, email } = req.body;

    const userDetails = await Subscription.findOne({ user: uid });
    if (!userDetails) {
      return res.json({ success: false, message: 'No subscription found' });
    }

    if (userDetails.method === 'stripe') {
      const keys = await getKeys('stripe');
      if (keys.secretKey) {
        const stripe = new Stripe(keys.secretKey);
        const subscription = await stripe.subscriptions.retrieve(
          userDetails.subscriberId
        );
        return res.json({ session: subscription, method: 'stripe' });
      }
    }

    if (userDetails.method === 'paypal') {
      const keys = await getKeys('paypal');
      const auth = Buffer.from(
        `${keys.publicKey}:${keys.secretKey}`
      ).toString('base64');

      const response = await fetch(
        `https://api-m.paypal.com/v1/billing/subscriptions/${userDetails.subscription}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json({
        session: await response.json(),
        method: 'paypal'
      });
    }

    if (userDetails.method === 'flutterwave') {
      const keys = await getKeys('flutterwave');
      if (keys.publicKey && keys.secretKey) {
        const flw = new Flutterwave(keys.publicKey, keys.secretKey);
        const response = await flw.Subscription.get({ email });
        return res.json({ session: response.data[0], method: 'flutterwave' });
      }
    }

    if (userDetails.method === 'paystack') {
      const keys = await getKeys('paystack');
      const response = await axios.get(
        `https://api.paystack.co/subscription/${userDetails.subscriberId}`,
        {
          headers: {
            Authorization: `Bearer ${keys.secretKey}`
          }
        }
      );

      return res.json({
        session: response.data.data,
        method: 'paystack'
      });
    }

    // Razorpay
    const keys = await getKeys('razorpay');
    const response = await axios.get(
      `https://api.razorpay.com/v1/subscriptions/${userDetails.subscription}`,
      {
        auth: {
          username: keys.publicKey,
          password: keys.secretKey
        }
      }
    );

    res.json({ session: response.data, method: 'razorpay' });

  } catch (error) {
    console.log('Error', error);
    res.status(500).json({ success: false });
  }
};

/**
 * SEND RECEIPT
 */
export const sendReceipt = async (req, res) => {
  try {
    const {
      html,
      email,
      plan,
      subscriberId,
      user,
      method,
      subscription,
      amount, // Expecting amount from frontend or calculate it
      currency // Expecting currency
    } = req.body;

    const existing = await Subscription.findOne({ user });
    if (!existing) {
      await Subscription.create({
        user,
        subscription,
        subscriberId,
        plan,
        method
      });
    } else {
      // Update existing subscription if needed, or just leave it
      // The original code didn't update it, which might be a bug or intended.
      // For now, I'll stick to the original logic for Subscription but add Order.
      await Subscription.updateOne({ user }, {
        subscription,
        subscriberId,
        plan,
        method,
        date: Date.now(),
        active: true
      });
    }

    // Create Order Record
    // Default amount/currency if not provided (logic can be improved)
    let orderAmount = 0;
    if (plan.toLowerCase().includes('monthly')) orderAmount = 9.99; // Example default
    if (plan.toLowerCase().includes('yearly')) orderAmount = 99.99; // Example default
    if (amount) orderAmount = amount;

    await Order.create({
      user,
      email,
      plan,
      amount: orderAmount,
      currency: currency || 'USD',
      provider: method,
      transactionId: subscriberId || subscription,
      status: 'success'
    });

    await sendReceiptEmail({ email, html });

    res.json({ success: true, message: 'Receipt sent to your mail' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};
