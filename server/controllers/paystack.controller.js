import * as paystackService from '../services/paystack.service.js';

export const paystackPayment = async (req, res) => {
  try {
    const url = await paystackService.initializePayment(req.body);
    res.json({ url });
  } catch (error) {
    console.error('Paystack payment error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const paystackFetch = async (req, res) => {
  try {
    const details = await paystackService.fetchSubscription(req.body);
    res.json({ details });
  } catch (error) {
    console.error('Paystack fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const paystackCancel = async (req, res) => {
  try {
    await paystackService.cancelSubscription(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Paystack cancel error:', error);
    res.status(500).json({ success: false });
  }
};
