import * as stripeService from '../services/stripe.service.js';

export const stripePayment = async (req, res) => {
  try {
    const session = await stripeService.createStripeSession(req.body.planId);
    res.json({ url: session.url, id: session.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const stripeDetails = async (req, res) => {
  try {
    const session = await stripeService.stripeDetails(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const stripeCancel = async (req, res) => {
  try {
    await stripeService.cancelStripeSubscription(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Stripe cancel error:', error);
    res.status(500).json({ success: false });
  }
};
