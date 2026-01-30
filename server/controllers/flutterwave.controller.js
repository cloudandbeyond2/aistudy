import { cancelFlutterwaveSubscription } from '../services/flutterwave.service.js';
import { getFlutterwaveSubscriptionDetails } from '../services/flutterwave.service.js';

export const flutterwaveCancel = async (req, res) => {
  try {
    await cancelFlutterwaveSubscription(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Flutterwave cancel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
export const flutterwaveDetails = async (req, res) => {
  try {
    const { email, uid, plan } = req.body;

    const subscription =
      await getFlutterwaveSubscriptionDetails({
        email,
        uid,
        plan
      });

    res.json(subscription);
  } catch (error) {
    console.error('Flutterwave details error:', error);

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error'
    });
  }
};
