import Subscription from '../models/Subscription.js';
import axios from 'axios';
import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import {
  sendReceiptEmail
} from '../services/subscriptionEmail.service.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const flw = process.env.FLUTTERWAVE_SECRET_KEY
  ? new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    )
  : null;

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
      const subscription = await stripe.subscriptions.retrieve(
        userDetails.subscriberId
      );
      return res.json({ session: subscription, method: 'stripe' });
    }

    if (userDetails.method === 'paypal') {
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_APP_SECRET_KEY}`
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
      const response = await flw.Subscription.get({ email });
      return res.json({ session: response.data[0], method: 'flutterwave' });
    }

    if (userDetails.method === 'paystack') {
      const response = await axios.get(
        `https://api.paystack.co/subscription/${userDetails.subscriberId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      return res.json({
        session: response.data.data,
        method: 'paystack'
      });
    }

    // Razorpay
    const response = await axios.get(
      `https://api.razorpay.com/v1/subscriptions/${userDetails.subscription}`,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET
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
      subscription
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
    }

    await sendReceiptEmail({ email, html });

    res.json({ success: true, message: 'Receipt sent to your mail' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};
