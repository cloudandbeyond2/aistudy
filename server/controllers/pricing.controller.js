import Pricing from '../models/Pricing.js';
import fetch from 'node-fetch';
import { PAYPAL_AUTH, PAYPAL_BASE_URL } from '../config/paypal.js';
import { cancelSubscription, renewSubscription } from '../services/subscription.service.js';

const DEFAULT_PRICING = [
  {
    planType: 'free',
    planName: 'Free Plan',
    price: 0,
    currency: 'USD',
    billingPeriod: 'Lifetime'
  },
  {
    planType: 'monthly',
    planName: 'Monthly Plan',
    price: 9,
    currency: 'USD',
    billingPeriod: 'Month'
  },
  {
    planType: 'yearly',
    planName: 'Yearly Plan',
    price: 99,
    currency: 'USD',
    billingPeriod: 'Year'
  }
];

/**
 * INIT DEFAULT PRICING IF EMPTY
 */
const ensureDefaultPricing = async () => {
  const count = await Pricing.countDocuments();
  if (count === 0) {
    await Pricing.insertMany(DEFAULT_PRICING);
    return DEFAULT_PRICING;
  }
  return null;
};

/**
 * GET PRICING (PUBLIC)
 */
export const getPricingPublic = async (req, res) => {
  try {
    const initialized = await ensureDefaultPricing();
    const pricingPlans = initialized || await Pricing.find({});

    res.json({
      success: true,
      pricing: pricingPlans
    });
  } catch (error) {
    console.log('Error fetching pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET PRICING (ADMIN)
 */
export const getPricingAdmin = async (req, res) => {
  try {
    const initialized = await ensureDefaultPricing();
    const pricingPlans = initialized || await Pricing.find({});

    const pricingObj = {};
    pricingPlans.forEach((plan) => {
      pricingObj[plan.planType] = {
        planType: plan.planType,
        planName: plan.planName,
        price: plan.price,
        currency: plan.currency,
        billingPeriod: plan.billingPeriod
      };
    });

    res.json({
      success: true,
      pricing: pricingObj
    });
  } catch (error) {
    console.log('Error fetching pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE PRICING (ADMIN)
 */
export const updatePricing = async (req, res) => {
  try {
    const { pricing } = req.body;

    if (!pricing || typeof pricing !== 'object') {
      return res.json({
        success: false,
        message: 'Invalid pricing data'
      });
    }

    for (const [planType, planData] of Object.entries(pricing)) {
      await Pricing.updateOne(
        { planType },
        {
          planType,
          planName: planData.planName,
          price: planData.price,
          currency: planData.currency,
          billingPeriod: planData.billingPeriod,
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'Pricing updated successfully'
    });
  } catch (error) {
    console.log('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
