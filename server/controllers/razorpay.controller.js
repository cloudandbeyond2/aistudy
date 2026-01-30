import {
  createRazorpaySubscription,
  getRazorpaySubscription,
  activateRazorpaySubscription,
  cancelRazorpaySubscription
} from '../services/razorpay.service.js';

/* CREATE */
export const createSubscription = async (req, res) => {
  try {
    const data = await createRazorpaySubscription(req.body);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/* DETAILS */
export const subscriptionDetails = async (req, res) => {
  try {
    const data = await activateRazorpaySubscription(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* PENDING */
export const pendingSubscription = async (req, res) => {
  try {
    const data = await getRazorpaySubscription(req.body.sub);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* CANCEL */
export const cancelSubscription = async (req, res) => {
  try {
    await cancelRazorpaySubscription(req.body.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
