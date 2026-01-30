import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { PAYPAL_AUTH, PAYPAL_BASE_URL } from '../config/paypal.js';
import { cancelSubscription, renewSubscription } from '../services/subscription.service.js';
/**
 * CREATE PAYPAL SUBSCRIPTION
 */
export const createPaypalSubscription = async (req, res) => {
  const {
    planId,
    email,
    name,
    lastName,
    post,
    address,
    country,
    brand,
    admin
  } = req.body;

  try {
    const firstLine = address.split(',').slice(0, -1).join(',');
    const secondLine = address.split(',').pop();

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_APP_SECRET_KEY}`
    ).toString('base64');

    const payload = {
      plan_id: planId,
      subscriber: {
        name: { given_name: name, surname: lastName },
        email_address: email,
        shipping_address: {
          name: { full_name: name },
          address: {
            address_line_1: firstLine,
            address_line_2: secondLine,
            admin_area_2: admin,
            admin_area_1: country,
            postal_code: post,
            country_code: country
          }
        }
      },
      application_context: {
        brand_name: process.env.COMPANY,
        locale: 'en-US',
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.WEBSITE_URL}/payment-success/${planId}`,
        cancel_url: `${process.env.WEBSITE_URL}/payment-failed`
      }
    };

    const response = await fetch(
      'https://api-m.paypal.com/v1/billing/subscriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const session = await response.json();
    res.json(session);
  } catch (error) {
    console.error('PayPal create error:', error);
    res.status(500).json({ success: false, message: 'PayPal error' });
  }
};

/**
 * FETCH PAYPAL SUBSCRIPTION DETAILS & UPDATE USER
 */
export const getPaypalDetails = async (req, res) => {
  const { subscriberId, uid, plan } = req.body;

  try {
    let cost =
      plan === process.env.MONTH_TYPE
        ? process.env.MONTH_COST
        : process.env.YEAR_COST;

    cost = Number(cost) / 4;

    await Admin.findOneAndUpdate(
      { type: 'main' },
      { $inc: { total: cost } }
    );

    await User.findByIdAndUpdate(uid, { $set: { type: plan } });

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_APP_SECRET_KEY}`
    ).toString('base64');

    const response = await fetch(
      `https://api-m.paypal.com/v1/billing/subscriptions/${subscriberId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

    const session = await response.json();
    res.json(session);
  } catch (error) {
    console.error('PayPal details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PayPal subscription'
    });
  }
};

export const paypalWebhook = async (req, res) => {
  const event = req.body;

  try {
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await cancelSubscription(event.resource.id, 'Cancelled');
        break;

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await cancelSubscription(event.resource.id, 'Expired');
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await cancelSubscription(event.resource.id, 'Suspended');
        break;

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await cancelSubscription(
          event.resource.id,
          'Disabled Due To Payment Failure'
        );
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await renewSubscription(event.resource.billing_agreement_id);
        break;
    }

    res.sendStatus(200); // 🔴 VERY IMPORTANT
  } catch (err) {
    console.error('PayPal Webhook Error:', err);
    res.sendStatus(500);
  }
};

export const cancelPaypalSubscription = async (req, res) => {
  const { id } = req.body;

  try {
    await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + PAYPAL_AUTH,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Not satisfied with the service'
      })
    });

    await cancelSubscription(id, 'Cancelled');

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const updatePaypalPlan = async (req, res) => {
  const { id, idPlan } = req.body;

  try {
    const response = await fetch(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${id}/revise`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + PAYPAL_AUTH,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: idPlan,
          application_context: {
            brand_name: process.env.COMPANY,
            return_url: `${process.env.WEBSITE_URL}/payment-success/${idPlan}`,
            cancel_url: `${process.env.WEBSITE_URL}/payment-failed`
          }
        })
      }
    );

    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
