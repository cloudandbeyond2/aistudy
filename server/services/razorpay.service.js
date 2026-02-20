// import axios from 'axios';
// import Subscription from '../models/Subscription.js';
// import User from '../models/User.js';
// import Admin from '../models/Admin.js';
// import transporter from '../config/mailer.js';
// import Order from '../models/Order.js';
// import crypto from 'crypto';
// /* ---------------- CONFIG ---------------- */
// const getRazorpayConfig = () => {
//   if (
//     !process.env.RAZORPAY_KEY_ID ||
//     !process.env.RAZORPAY_KEY_SECRET
//   ) {
//     throw new Error('Razorpay keys missing in environment');
//   }

//   return {
//     auth: {
//       username: process.env.RAZORPAY_KEY_ID,
//       password: process.env.RAZORPAY_KEY_SECRET
//     },
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   };
// };

// /* ---------------- CREATE SUBSCRIPTION ---------------- */
// export const createRazorpaySubscription = async ({
//   plan,
//   email,
//   fullAddress
// }) => {
//   if (!plan) {
//     throw new Error('plan_id is required');
//   }

//   const payload = {
//     plan_id: plan,          // MUST be plan_xxxxx
//     total_count: 12,
//     quantity: 1,
//     customer_notify: 1,
//     notes: {
//       address: fullAddress || 'NA'
//     }
//   };

//   console.log('RAZORPAY PAYLOAD:', payload);

//   const response = await axios.post(
//     'https://api.razorpay.com/v1/subscriptions',
//     payload,
//     getRazorpayConfig()
//   );

//   return response.data;
// };

// /* ---------------- FETCH SUBSCRIPTION ---------------- */
// export const getRazorpaySubscription = async (subscriptionId) => {
//   if (!subscriptionId) {
//     throw new Error('subscriptionId required');
//   }

//   const response = await axios.get(
//     `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
//     getRazorpayConfig()
//   );

//   return response.data;
// };

// /* ---------------- ACTIVATE SUBSCRIPTION ---------------- */
// // export const activateRazorpaySubscription = async ({
// //   uid,
// //   plan,
// //   subscriptionId
// // }) => {
// //   if (!uid || !subscriptionId) {
// //     throw new Error('uid & subscriptionId required');
// //   }

// //   let cost =
// //     plan === process.env.MONTH_TYPE
// //       ? Number(process.env.MONTH_COST)
// //       : Number(process.env.YEAR_COST);

// //   cost = cost / 4;

// //   await Admin.findOneAndUpdate(
// //     { type: 'main' },
// //     { $inc: { total: cost } }
// //   );

// //   await User.findByIdAndUpdate(uid, { type: plan });

// //   return getRazorpaySubscription(subscriptionId);
// // };


// /* ---------------- ACTIVATE SUBSCRIPTION ---------------- */
// export const activateRazorpaySubscription = async ({
//   uid,
//   plan,
//   subscriptionId,
//   amount,
//   currency,
//   mName,
//   email
// }) => {
//   if (!uid || !subscriptionId) {
//     throw new Error('uid & subscriptionId required');
//   }

//   // Calculate subscription dates
//   const subscriptionStart = new Date();
//   let subscriptionEnd = new Date();

//   if (plan === 'yearly') {
//     subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
//   } else if (plan === 'monthly') {
//     subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
//   } else {
//     subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100); // Forever plan
//   }

//   let cost = 0;
//   if (plan === process.env.MONTH_TYPE) {
//     cost = Number(process.env.MONTH_COST) || amount || 0;
//   } else if (plan === process.env.YEAR_TYPE) {
//     cost = Number(process.env.YEAR_COST) || amount || 0;
//   }

//   cost = cost / 4;

//   await Admin.findOneAndUpdate(
//     { type: 'main' },
//     { $inc: { total: cost } }
//   );

//   // Update user with ALL subscription details
//   const userUpdates = {
//     type: plan,
//     subscriptionStart: subscriptionStart,
//     subscriptionEnd: subscriptionEnd
//   };

//   // Update mName if provided
//   if (mName) {
//     userUpdates.mName = mName;
//   }

//   await User.findByIdAndUpdate(uid, userUpdates);

//   // Update order with subscription dates
//   await Order.findOneAndUpdate(
//     { subscriptionId },
//     {
//       subscriptionStartDate: subscriptionStart,
//       subscriptionEndDate: subscriptionEnd,
//       amount: amount,
//       price: amount,
//       currency: currency,
//       userMName: mName
//     }
//   );

//   return {
//     ...(await getRazorpaySubscription(subscriptionId)),
//     subscriptionStart,
//     subscriptionEnd,
//     userUpdated: true
//   };
// };

// /* ---------------- CANCEL SUBSCRIPTION ---------------- */
// export const cancelRazorpaySubscription = async (subscriptionId) => {
//   await axios.post(
//     `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
//     { cancel_at_cycle_end: 0 },
//     getRazorpayConfig()
//   );

//   const sub = await Subscription.findOne({ subscription: subscriptionId });
//   if (!sub) return;

//   const user = await User.findById(sub.user);

//   await User.findByIdAndUpdate(sub.user, { type: 'free' });
//   await Subscription.findOneAndDelete({ subscription: subscriptionId });

//   if (user) {
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: user.email,
//       subject: `${user.mName}, Subscription Cancelled`,
//       html: `<p>Your subscription has been cancelled.</p>`
//     });
//   }
// };


// /* ---------------- VERIFY WEBHOOK SIGNATURE ---------------- */
// export const verifyWebhookSignature = (body, signature, secret) => {
//   const generatedSignature = crypto
//     .createHmac('sha256', secret)
//     .update(JSON.stringify(body))
//     .digest('hex');

//   return generatedSignature === signature;
// };

// /* ---------------- HANDLE WEBHOOK ---------------- */
// /* ---------------- HANDLE WEBHOOK ---------------- */
// export const handleRazorpayWebhook = async (payload) => {
//   try {
//     const { event, payload: paymentPayload } = payload;

//     console.log('Webhook received:', event, paymentPayload);

//     if (!paymentPayload || !paymentPayload.subscription || !paymentPayload.payment) {
//       console.log('Invalid webhook payload');
//       return;
//     }

//     const subscription = paymentPayload.subscription.entity;
//     const payment = paymentPayload.payment.entity;

//     const subscriptionId = subscription.id;
//     const paymentId = payment.id;
//     const amount = payment.amount / 100; // Convert from paise to INR
//     const currency = payment.currency;
//     const customerEmail = payment.email || subscription.notes?.email;
//     const customerName = payment.customer_id ? 
//       await getCustomerName(payment.customer_id) : 
//       subscription.notes?.name;

//     // Find order by subscription ID
//     let order = await Order.findOne({ subscriptionId });

//     if (!order) {
//       // If order not found by subscriptionId, try to find by email and pending status
//       order = await Order.findOne({ 
//         userEmail: customerEmail, 
//         status: 'pending',
//         subscriptionId: { $exists: false }
//       });

//       if (order) {
//         order.subscriptionId = subscriptionId;
//       }
//     }

//     if (order) {
//       // Update order with payment details
//       order.razorpayPaymentId = paymentId;
//       order.amount = amount;
//       order.currency = currency;

//       if (customerName && order.userName === 'N/A') {
//         order.userName = customerName;
//       }

//       // Determine plan name from amount
//       if (amount === 3999) {
//         order.planName = 'Yearly Plan';
//         order.plan = 'yearly';
//       } else if (amount === 399) { // Example monthly amount
//         order.planName = 'Monthly Plan';
//         order.plan = 'monthly';
//       }

//       // Update status based on event
//       switch (event) {
//         case 'subscription.charged':
//         case 'payment.captured':
//           order.status = 'success';
//           break;
//         case 'subscription.failed':
//         case 'payment.failed':
//           order.status = 'failed';
//           break;
//         case 'subscription.cancelled':
//           order.status = 'cancelled';
//           break;
//         case 'subscription.activated':
//           order.status = 'active';
//           break;
//         default:
//           order.status = 'pending';
//       }

//       await order.save();
//       console.log(`Order ${order._id} updated: ${order.status}, Amount: ${amount} ${currency}`);

//       // If payment successful, update user subscription
//       if (order.status === 'success' && order.userId) {
//         await User.findByIdAndUpdate(order.userId, {
//           type: order.plan,
//           subscriptionActive: true,
//           subscriptionEndDate: new Date(Date.now() + (order.plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
//         });

//         // Send confirmation email
//         await sendPaymentConfirmationEmail(order);
//       }
//     } else {
//       // Create new order if not found
//       await Order.create({
//         subscriptionId,
//         razorpayPaymentId: paymentId,
//         userEmail: customerEmail,
//         userName: customerName || 'Star bala',
//         plan: 'yearly',
//         planName: 'Yearly Plan',
//         amount: amount,
//         currency: currency,
//         provider: 'razorpay',
//         status: 'success',
//         date: new Date()
//       });
//       console.log(`New order created for subscription: ${subscriptionId}`);
//     }

//   } catch (error) {
//     console.error('Webhook handling error:', error);
//   }
// };

// /* ---------------- GET CUSTOMER NAME ---------------- */
// const getCustomerName = async (customerId) => {
//   try {
//     const response = await axios.get(
//       `https://api.razorpay.com/v1/customers/${customerId}`,
//       getRazorpayConfig()
//     );
//     return response.data.name;
//   } catch (error) {
//     console.error('Error fetching customer:', error);
//     return null;
//   }
// };

// /* ---------------- SEND PAYMENT CONFIRMATION EMAIL ---------------- */
// const sendPaymentConfirmationEmail = async (order) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: order.userEmail,
//       subject: `Payment Confirmation - ${order.planName}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4CAF50;">Payment Successful!</h2>
//           <p>Your payment has been processed successfully.</p>

//           <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
//             <h3>Receipt</h3>
//             <p><strong>Transaction ID:</strong> ${order.subscriptionId}</p>
//             <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
//             <p><strong>Plan:</strong> ${order.planName}</p>
//             <p><strong>Amount:</strong> ${order.currency} ${order.amount}</p>
//             <p><strong>Payment Method:</strong> ${order.provider}</p>

//             <h3 style="margin-top: 20px;">Billing Details</h3>
//             <p><strong>Name:</strong> ${order.userName}</p>
//             <p><strong>Email:</strong> ${order.userEmail}</p>
//           </div>

//           <p>You can download your receipt from your dashboard.</p>
//           <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
//             Go to Dashboard
//           </a>
//         </div>
//       `
//     });
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

import axios from 'axios';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import transporter from '../config/mailer.js';
import Order from '../models/Order.js';
import crypto from 'crypto';

/* ---------------- CONFIG ---------------- */
const getRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys missing in environment');
  }

  return {
    auth: {
      username: process.env.RAZORPAY_KEY_ID,
      password: process.env.RAZORPAY_KEY_SECRET
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Razorpay-Request-Id': `req_${Date.now()}`
    }
  };
};

/* ---------------- GET OR CREATE PLAN ---------------- */
const getOrCreateRazorpayPlan = async ({ amount, currency, planType, planName }) => {
  const config = getRazorpayConfig();
  const amountInPaise = Math.round(amount * 100);
  const period = planType === 'yearly' ? 'yearly' : 'monthly';
  const name = `${planName || 'Subscription'} - ${amount} ${currency}`;

  try {
    // 1. Fetch existing plans (pagination might be needed but usually few plans)
    const response = await axios.get('https://api.razorpay.com/v1/plans', config);
    const plans = response.data.items || [];

    // 2. Check for a match
    const existingPlan = plans.find(p =>
      p.item.amount === amountInPaise &&
      p.item.currency === currency &&
      p.period === period &&
      p.interval === 1
    );

    if (existingPlan) {
      console.log('Reusing existing Razorpay plan:', existingPlan.id);
      return existingPlan.id;
    }

    // 3. Create new plan if no match
    console.log('Creating new Razorpay plan for amount:', amount);
    const newPlanResponse = await axios.post('https://api.razorpay.com/v1/plans', {
      period: period,
      interval: 1,
      item: {
        name: name,
        amount: amountInPaise,
        currency: currency,
        description: `Billed every ${period}`
      }
    }, config);

    return newPlanResponse.data.id;
  } catch (error) {
    console.error('Error in getOrCreateRazorpayPlan:', error.response?.data || error.message);
    throw error;
  }
};

/* ---------------- CREATE SUBSCRIPTION ---------------- */
export const createRazorpaySubscription = async ({
  plan,
  email,
  fullAddress,
  planType,
  planName,
  amount,
  currency,
  userName
}) => {
  // If amount is provided (includes tax), get or create a matching plan
  let finalPlanId = plan;
  if (amount) {
    try {
      finalPlanId = await getOrCreateRazorpayPlan({
        amount,
        currency: currency || 'INR',
        planType: (planType === 'yearly' || planName?.toLowerCase().includes('year')) ? 'yearly' : 'monthly',
        planName
      });
    } catch (e) {
      console.error('Failed to get/create tax-inclusive plan, falling back to base plan:', e.message);
    }
  }

  if (!finalPlanId) {
    throw new Error('plan_id is required');
  }

  const payload = {
    plan_id: finalPlanId,
    total_count: 12,
    quantity: 1,
    customer_notify: 1,
    notes: {
      address: fullAddress || 'NA',
      email: email || '',
      name: userName || '',
      plan_type: planType || '',
      plan_name: planName || '',
      amount: amount || '',
      currency: currency || 'INR'
    }
  };

  console.log('RAZORPAY PAYLOAD:', payload);

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/subscriptions',
      payload,
      getRazorpayConfig()
    );

    return response.data;
  } catch (error) {
    console.error('Razorpay API Error:', error.response?.data || error.message);
    throw error;
  }
};

/* ---------------- FETCH SUBSCRIPTION ---------------- */
export const getRazorpaySubscription = async (subscriptionId) => {
  if (!subscriptionId) {
    throw new Error('subscriptionId required');
  }

  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
      getRazorpayConfig()
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error.response?.data || error.message);
    throw error;
  }
};

/* ---------------- ACTIVATE SUBSCRIPTION ---------------- */
/* ---------------- ACTIVATE SUBSCRIPTION - FIXED ---------------- */
export const activateRazorpaySubscription = async ({
  uid,
  plan,
  subscriptionId,
  amount,
  currency,
  mName,
  email
}) => {
  if (!uid || !subscriptionId) {
    throw new Error('uid & subscriptionId required');
  }

  // Calculate subscription dates
  const subscriptionStart = new Date();
  let subscriptionEnd = new Date();

  // Determine plan type and end date
  let planType = 'monthly';
  if (plan && (plan.includes('Year') || plan === 'yearly')) {
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    planType = 'yearly';
  } else {
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    planType = 'monthly';
  }

  // Update admin total (divide by 4 for commission)
  let cost = Number(amount) || 0;
  cost = cost / 4;

  await Admin.findOneAndUpdate(
    { type: 'main' },
    { $inc: { total: cost } }
  );

  // Update user with ALL subscription details
  const userUpdates = {
    type: planType,
    subscriptionActive: true,
    subscriptionStart: subscriptionStart,
    subscriptionEnd: subscriptionEnd
  };

  // Update mName if provided
  if (mName) {
    userUpdates.mName = mName;
  }

  await User.findByIdAndUpdate(uid, userUpdates, { new: true });

  // Update order with subscription dates
  await Order.findOneAndUpdate(
    { subscriptionId },
    {
      subscriptionStartDate: subscriptionStart,
      subscriptionEndDate: subscriptionEnd,
      price: amount,
      currency: currency,
      userMName: mName,
      status: 'success'
    }
  );

  return {
    ...(await getRazorpaySubscription(subscriptionId)),
    subscriptionStart,
    subscriptionEnd,
    userUpdated: true
  };
};
/* ---------------- CANCEL SUBSCRIPTION ---------------- */
export const cancelRazorpaySubscription = async (subscriptionId) => {
  try {
    const response = await axios.post(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      { cancel_at_cycle_end: 0 },
      getRazorpayConfig()
    );

    // Update user subscription status
    const sub = await Subscription.findOne({ subscription: subscriptionId });
    if (sub && sub.user) {
      await User.findByIdAndUpdate(sub.user, {
        type: 'free',
        subscriptionActive: false
      });
      await Subscription.findOneAndDelete({ subscription: subscriptionId });
    }

    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error.response?.data || error.message);
    throw error;
  }
};

/* ---------------- VERIFY WEBHOOK SIGNATURE ---------------- */
export const verifyWebhookSignature = (body, signature, secret) => {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  return generatedSignature === signature;
};

/* ---------------- HANDLE WEBHOOK ---------------- */
export const handleRazorpayWebhook = async (payload) => {
  try {
    const { event, payload: paymentPayload } = payload;

    console.log('Webhook received:', event);

    if (!paymentPayload || !paymentPayload.subscription || !paymentPayload.payment) {
      console.log('Invalid webhook payload');
      return { success: false, message: 'Invalid payload' };
    }

    const subscription = paymentPayload.subscription.entity;
    const payment = paymentPayload.payment.entity;

    const subscriptionId = subscription.id;
    const paymentId = payment.id;
    const amount = payment.amount / 100;
    const currency = payment.currency;
    const customerEmail = payment.email || subscription.notes?.email;
    const customerName = payment.customer_id ?
      await getCustomerName(payment.customer_id) :
      subscription.notes?.name;

    // Find order by subscription ID
    let order = await Order.findOne({ subscriptionId });

    if (!order) {
      // If order not found, try to find by email and pending status
      order = await Order.findOne({
        userEmail: customerEmail,
        status: 'pending'
      }).sort({ createdAt: -1 });

      if (order) {
        order.subscriptionId = subscriptionId;
        console.log('Updated existing order with subscription ID');
      }
    }

    if (order) {
      // Update order with payment details
      order.razorpayPaymentId = paymentId;
      order.price = amount;
      order.currency = currency;

      if (customerName && (!order.userMName || order.userMName === 'N/A')) {
        order.userMName = customerName;
      }

      // Determine plan name from amount if not set
      if (!order.planName || order.planName === 'Subscription') {
        if (amount === 3999 || amount === 3999.00) {
          order.planName = 'Yearly Plan';
          order.plan = 'yearly';
        } else if (amount === 399 || amount === 399.00) {
          order.planName = 'Monthly Plan';
          order.plan = 'monthly';
        }
      }

      // Update status based on event
      switch (event) {
        case 'subscription.charged':
        case 'payment.captured':
          order.status = 'success';

          // Calculate subscription dates
          order.subscriptionStartDate = new Date();
          if (order.plan === 'yearly' || order.planName?.includes('Yearly')) {
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            order.subscriptionEndDate = endDate;
          } else {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            order.subscriptionEndDate = endDate;
          }
          break;
        case 'subscription.failed':
        case 'payment.failed':
          order.status = 'failed';
          break;
        case 'subscription.cancelled':
          order.status = 'cancelled';
          break;
        case 'subscription.activated':
          order.status = 'active';
          break;
        default:
          order.status = 'pending';
      }

      await order.save();
      console.log(`Order ${order._id} updated: ${order.status}, Amount: ${amount} ${currency}`);

      // If payment successful and user exists, update user subscription
      if (order.status === 'success' && order.userId) {
        const planType = order.plan === 'yearly' || order.planName?.includes('Yearly') ? 'yearly' : 'monthly';

        await User.findByIdAndUpdate(order.userId, {
          type: planType,
          subscriptionActive: true,
          subscriptionStart: order.subscriptionStartDate,
          subscriptionEnd: order.subscriptionEndDate,
          updatedAt: new Date()
        });

        // Send confirmation email
        await sendPaymentConfirmationEmail(order);
      }
    } else {
      // Create new order if not found
      const newOrder = await Order.create({
        subscriptionId,
        razorpayPaymentId: paymentId,
        userEmail: customerEmail || subscription.notes?.email || 'unknown@example.com',
        userMName: customerName || subscription.notes?.name || 'Customer',
        plan: amount === 3999 ? 'yearly' : 'monthly',
        planName: amount === 3999 ? 'Yearly Plan' : 'Monthly Plan',
        price: amount,
        currency: currency,
        provider: 'razorpay',
        status: 'success',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + (amount === 3999 ? 365 : 30) * 24 * 60 * 60 * 1000),
        date: new Date()
      });
      console.log(`New order created: ${newOrder._id}`);
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('Webhook handling error:', error);
    return { success: false, message: error.message };
  }
};

/* ---------------- GET CUSTOMER NAME ---------------- */
const getCustomerName = async (customerId) => {
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/customers/${customerId}`,
      getRazorpayConfig()
    );
    return response.data.name || response.data.email?.split('@')[0] || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};

/* ---------------- SEND PAYMENT CONFIRMATION EMAIL ---------------- */
const sendPaymentConfirmationEmail = async (order) => {
  try {
    if (!transporter || !process.env.EMAIL) {
      console.log('Email transporter not configured');
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: order.userEmail,
      subject: `Payment Confirmation - ${order.planName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Payment Successful!</h2>
          <p>Your payment has been processed successfully.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Receipt</h3>
            <p><strong>Transaction ID:</strong> ${order.subscriptionId}</p>
            <p><strong>Date:</strong> ${new Date(order.date || order.createdAt).toLocaleDateString()}</p>
            <p><strong>Plan:</strong> ${order.planName}</p>
            <p><strong>Amount:</strong> ${order.currency} ${order.price}</p>
            <p><strong>Payment Method:</strong> ${order.provider}</p>
            
            <h3 style="margin-top: 20px;">Billing Details</h3>
            <p><strong>Name:</strong> ${order.userMName}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
          </div>
          
          <p>You can access your courses from your dashboard.</p>
          <a href="${process.env.FRONTEND_URL || 'https://app.example.com'}/dashboard" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      `
    });

    console.log('Payment confirmation email sent to:', order.userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};