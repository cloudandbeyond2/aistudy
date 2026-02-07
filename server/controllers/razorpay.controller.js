import {
  createRazorpaySubscription,
  getRazorpaySubscription,
  activateRazorpaySubscription,
  cancelRazorpaySubscription
} from '../services/razorpay.service.js';

/* CREATE SUBSCRIPTION */
export const createSubscription = async (req, res) => {
  try {
    console.log('CREATE SUB BODY:', req.body);

    const data = await createRazorpaySubscription(req.body);
    return res.status(200).json(data);

  } catch (err) {
    console.error(
      'RAZORPAY CREATE ERROR:',
      err.response?.data || err.message
    );

    return res.status(400).json({
      success: false,
      razorpay: err.response?.data || null
    });
  }
};

/* SUBSCRIPTION DETAILS */
export const subscriptionDetails = async (req, res) => {
  try {
    const data = await activateRazorpaySubscription(req.body);
    return res.json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

/* FETCH SUBSCRIPTION */
export const pendingSubscription = async (req, res) => {
  try {
    const { sub } = req.body;
    const data = await getRazorpaySubscription(sub);
    return res.json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

/* CANCEL SUBSCRIPTION */
export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.body;
    await cancelRazorpaySubscription(id);
    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
