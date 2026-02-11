// import mongoose from 'mongoose';
// import Order from '../models/Order.js';
// import {
//   createRazorpaySubscription,
//   getRazorpaySubscription,
//   activateRazorpaySubscription,
//   cancelRazorpaySubscription
// } from '../services/razorpay.service.js';

// /* CREATE SUBSCRIPTION */
// // export const createSubscription = async (req, res) => {
// //   try {
// //     console.log('CREATE SUB BODY:', req.body);

// //     const { plan, email, fullAddress, planType, planName, amount, currency } = req.body;

// //     // Store order in database
// //     const order = await Order.create({
// //       userEmail: email,
// //       plan: planType || 'monthly',
// //       planName: planName || 'Subscription',
// //       amount: amount || 0,
// //       currency: currency || 'INR',
// //       provider: 'razorpay',
// //       status: 'pending',
// //       address: fullAddress,
// //       notes: req.body
// //     });

// //     // Create Razorpay subscription
// //     const data = await createRazorpaySubscription(req.body);
    
// //     // Update order with Razorpay subscription ID
// //     order.subscriptionId = data.id;
// //     order.razorpayOrderId = data.razorpay_order_id;
// //     await order.save();

// //     // Return both subscription data and order ID
// //     return res.status(200).json({
// //       ...data,
// //       orderId: order._id
// //     });

// //   } catch (err) {
// //     console.error(
// //       'RAZORPAY CREATE ERROR:',
// //       err.response?.data || err.message
// //     );

// //     return res.status(400).json({
// //       success: false,
// //       razorpay: err.response?.data || null
// //     });
// //   }
// // };


// // controllers/razorpay.controller.js - Fix createSubscription
// export const createSubscription = async (req, res) => {
//   try {
//     console.log('CREATE SUB BODY:', req.body);

//     const { plan, email, fullAddress, planType, planName, amount, currency } = req.body;

//     // Get user from session if available
//     const userId = req.user?._id || null;
//     const userMName = req.user?.mName || sessionStorage?.getItem('mName') || 'Customer';

//     // Store order in database - USE price NOT amount
//     const order = await Order.create({
//       userId: userId,
//       userEmail: email,
//       userMName: userMName,
//       plan: planType || 'monthly',
//       planName: planName || 'Subscription',
//       price: amount || 0,  // Store in price field, NOT amount
//       currency: currency || 'INR',
//       provider: 'razorpay',
//       status: 'pending',
//       address: fullAddress
//     });

//     // Create Razorpay subscription
//     const data = await createRazorpaySubscription(req.body);
    
//     // Update order with Razorpay subscription ID
//     order.subscriptionId = data.id;
//     order.razorpayOrderId = data.id; // Razorpay uses same ID
//     await order.save();

//     return res.status(200).json({
//       ...data,
//       orderId: order._id
//     });

//   } catch (err) {
//     console.error('RAZORPAY CREATE ERROR:', err.response?.data || err.message);
//     return res.status(400).json({
//       success: false,
//       razorpay: err.response?.data || null
//     });
//   }
// };
// /* ACTIVATE SUBSCRIPTION DETAILS */
// // export const subscriptionDetails = async (req, res) => {
// //   try {
// //     const { uid, subscriptionId, plan, email, amount, currency } = req.body;

// //     if (!uid || !subscriptionId || !plan) {
// //       return res.status(400).json({
// //         message: "uid, subscriptionId & plan required"
// //       });
// //     }

// //     // Update order status to success
// //     await Order.findOneAndUpdate(
// //       { subscriptionId },
// //       { 
// //         userId: uid,
// //         userEmail: email,
// //         status: 'success',
// //         amount: amount,
// //         currency: currency
// //       }
// //     );

// //     const data = await activateRazorpaySubscription({
// //       uid,
// //       subscriptionId,
// //       plan
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };


// // controllers/razorpay.controller.js - Fix subscriptionDetails (activation after payment)
// export const subscriptionDetails = async (req, res) => {
//   try {
//     const { uid, subscriptionId, plan, email, amount, currency, mName } = req.body;

//     if (!uid || !subscriptionId || !plan) {
//       return res.status(400).json({
//         message: "uid, subscriptionId & plan required"
//       });
//     }

//     // Calculate subscription dates
//     const subscriptionStart = new Date();
//     let subscriptionEnd = new Date();
    
//     if (plan === 'yearly') {
//       subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
//     } else if (plan === 'monthly') {
//       subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
//     } else {
//       subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100); // Lifetime
//     }

//     // Update order status to success
//     const updatedOrder = await Order.findOneAndUpdate(
//       { subscriptionId },
//       { 
//         userId: uid,
//         userEmail: email,
//         userMName: mName,
//         status: 'success',
//         price: amount,
//         currency: currency,
//         subscriptionStartDate: subscriptionStart,
//         subscriptionEndDate: subscriptionEnd
//       },
//       { new: true }
//     );

//     // CRITICAL: Update user subscription
//     await User.findByIdAndUpdate(uid, {
//       type: plan,
//       subscriptionActive: true,
//       subscriptionStart: subscriptionStart,
//       subscriptionEnd: subscriptionEnd,
//       ...(mName && { mName: mName })
//     });

//     const data = await activateRazorpaySubscription({
//       uid,
//       subscriptionId,
//       plan,
//       amount,
//       currency,
//       mName,
//       email
//     });

//     res.json({
//       success: true,
//       message: 'Subscription activated successfully',
//       data: data
//     });
//   } catch (err) {
//     console.error('SUBSCRIPTION DETAILS ERROR:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // controllers/razorpay.controller.js - Fix webhook handler
// export const handleRazorpayWebhook = async (payload) => {
//   try {
//     const { event, payload: paymentPayload } = payload;
    
//     console.log('Webhook received:', event);
    
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

//     // Find order by subscription ID
//     let order = await Order.findOne({ subscriptionId });
    
//     if (!order) {
//       console.log(`No order found for subscription: ${subscriptionId}`);
//       return;
//     }

//     // Calculate subscription dates
//     const subscriptionStart = new Date();
//     let subscriptionEnd = new Date();
    
//     if (order.plan === 'yearly') {
//       subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
//     } else if (order.plan === 'monthly') {
//       subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
//     } else {
//       subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 100);
//     }

//     // Update order based on event
//     switch (event) {
//       case 'subscription.charged':
//       case 'payment.captured':
//         order.status = 'success';
//         order.razorpayPaymentId = paymentId;
//         order.price = amount;
//         order.currency = currency;
//         order.subscriptionStartDate = subscriptionStart;
//         order.subscriptionEndDate = subscriptionEnd;
//         await order.save();
        
//         // CRITICAL: Update user subscription if userId exists
//         if (order.userId) {
//           await User.findByIdAndUpdate(order.userId, {
//             type: order.plan,
//             subscriptionActive: true,
//             subscriptionStart: subscriptionStart,
//             subscriptionEnd: subscriptionEnd
//           });
          
//           // Send confirmation email
//           await sendPaymentConfirmationEmail(order);
//         }
//         break;
        
//       case 'subscription.failed':
//       case 'payment.failed':
//         order.status = 'failed';
//         await order.save();
//         break;
        
//       case 'subscription.cancelled':
//         order.status = 'cancelled';
//         await order.save();
        
//         // Update user to free plan
//         if (order.userId) {
//           await User.findByIdAndUpdate(order.userId, {
//             type: 'free',
//             subscriptionActive: false
//           });
//         }
//         break;
//     }

//     console.log(`Order ${order._id} updated: ${order.status}`);
//   } catch (error) {
//     console.error('Webhook handling error:', error);
//   }
// };
// /* FETCH SUBSCRIPTION */
// export const pendingSubscription = async (req, res) => {
//   try {
//     const { sub } = req.body;
//     const data = await getRazorpaySubscription(sub);
//     return res.json(data);

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false });
//   }
// };

// /* CANCEL SUBSCRIPTION */
// export const cancelSubscription = async (req, res) => {
//   try {
//     const { id } = req.body;
    
//     // Update order status to cancelled
//     await Order.findOneAndUpdate(
//       { subscriptionId: id },
//       { status: 'cancelled' }
//     );

//     await cancelRazorpaySubscription(id);
//     return res.json({ success: true });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false });
//   }
// };

// /* GET ALL ORDERS */
// /* GET ALL ORDERS */
// // export const getAllOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find()
// //       .sort({ createdAt: -1 })
// //       .populate('userId', 'name email');
    
// //     // Format orders for frontend
// //     const formattedOrders = orders.map(order => ({
// //       _id: order._id,
// //       date: order.createdAt || order.date,
// //       user: order.userName || order.userId?.name || 'N/A',
// //       email: order.userEmail,
// //       plan: order.planName || order.plan || 'Subscription',
// //       amount: order.amount || 0,
// //       currency: order.currency || 'INR',
// //       provider: order.provider || 'razorpay',
// //       status: order.status || 'pending',
// //       transactionId: order.subscriptionId || order.razorpayPaymentId || order._id.toString(),
// //       subscriptionId: order.subscriptionId,
// //       address: order.address,
// //       // Add additional fields
// //       userName: order.userName,
// //       planName: order.planName
// //     }));

// //     res.json(formattedOrders);
// //   } catch (err) {
// //     console.error('GET ORDERS ERROR:', err);
// //     res.status(500).json({ message: 'Failed to fetch orders' });
// //   }
// // };


// // controllers/razorpay.controller.js - Fix getAllOrders to use correct field names
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .sort({ createdAt: -1 })
//       .populate('userId', 'name email mName type');
    
//     // Format orders for frontend - use price NOT amount
//     const formattedOrders = orders.map(order => ({
//       _id: order._id,
//       date: order.createdAt || order.date,
//       userMName: order.userMName || order.userId?.mName || 'N/A',
//       email: order.userEmail,
//       plan: order.plan || 'subscription',
//       planName: order.planName || 'Subscription',
//       price: order.price || 0,  // IMPORTANT: Use price, not amount
//       currency: order.currency || 'INR',
//       provider: order.provider || 'razorpay',
//       status: order.status || 'pending',
//       transactionId: order.subscriptionId || order.razorpayPaymentId || order._id.toString(),
//       subscriptionId: order.subscriptionId,
//       address: order.address,
//       subscriptionStart: order.subscriptionStartDate,
//       subscriptionEnd: order.subscriptionEndDate,
//       userId: order.userId?._id,
//       userData: order.userId
//     }));

//     res.json(formattedOrders);
//   } catch (err) {
//     console.error('GET ORDERS ERROR:', err);
//     res.status(500).json({ message: 'Failed to fetch orders' });
//   }
// };
// /* GET SINGLE ORDER */
// export const getOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id).populate('userId', 'name email');
    
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.json(order);
//   } catch (err) {
//     console.error('GET ORDER ERROR:', err);
//     res.status(500).json({ message: 'Failed to fetch order' });
//   }
// };

// /* UPDATE ORDER STATUS */
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const order = await Order.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.json(order);
//   } catch (err) {
//     console.error('UPDATE ORDER ERROR:', err);
//     res.status(500).json({ message: 'Failed to update order' });
//   }
// };

// /* MANUALLY UPDATE ORDER STATUS */
// export const updateOrderManually = async (req, res) => {
//   try {
//     const { orderId, subscriptionId, status, amount, userName, planName } = req.body;
    
//     let order;
    
//     // Find order by ID or subscription ID
//     if (orderId) {
//       order = await Order.findById(orderId);
//     } else if (subscriptionId) {
//       order = await Order.findOne({ subscriptionId });
//     }
    
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
    
//     // Update fields
//     const updates = {};
//     if (status) updates.status = status;
//     if (amount) updates.amount = amount;
//     if (userName) updates.userName = userName;
//     if (planName) updates.planName = planName;
    
//     // Update user subscription if status is success
//     if (status === 'success' && order.userId) {
//       await User.findByIdAndUpdate(order.userId, {
//         type: order.plan || 'yearly',
//         subscriptionActive: true,
//         subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
//       });
//     }
    
//     const updatedOrder = await Order.findByIdAndUpdate(
//       order._id,
//       updates,
//       { new: true }
//     );
    
//     res.json({
//       success: true,
//       message: 'Order updated successfully',
//       order: updatedOrder
//     });
    
//   } catch (error) {
//     console.error('Manual update error:', error);
//     res.status(500).json({ message: 'Failed to update order' });
//   }
// };

// /* BULK UPDATE PENDING ORDERS */
// export const fixPendingOrders = async (req, res) => {
//   try {
//     // Find all pending orders with amount 0
//     const pendingOrders = await Order.find({ 
//       status: 'pending', 
//       amount: 0,
//       provider: 'razorpay'
//     });
    
//     const updates = [];
    
//     for (const order of pendingOrders) {
//       try {
//         // Fetch subscription details from Razorpay
//         if (order.subscriptionId) {
//           const subscription = await getRazorpaySubscription(order.subscriptionId);
          
//           // Check if subscription is active/charged
//           if (subscription.status === 'active' || subscription.status === 'charged') {
//             // Get the payment details
//             const payments = await axios.get(
//               `https://api.razorpay.com/v1/subscriptions/${order.subscriptionId}/payments`,
//               getRazorpayConfig()
//             );
            
//             if (payments.data.items.length > 0) {
//               const payment = payments.data.items[0];
              
//               // Update order
//               await Order.findByIdAndUpdate(order._id, {
//                 status: 'success',
//                 amount: payment.amount / 100,
//                 razorpayPaymentId: payment.id
//               });
              
//               updates.push({
//                 orderId: order._id,
//                 subscriptionId: order.subscriptionId,
//                 status: 'success',
//                 amount: payment.amount / 100
//               });
//             }
//           }
//         }
//       } catch (error) {
//         console.error(`Error updating order ${order._id}:`, error.message);
//       }
//     }
    
//     res.json({
//       success: true,
//       message: `Updated ${updates.length} orders`,
//       updates
//     });
    
//   } catch (error) {
//     console.error('Bulk update error:', error);
//     res.status(500).json({ message: 'Failed to update orders' });
//   }
// };

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import {
  createRazorpaySubscription,
  getRazorpaySubscription,
  activateRazorpaySubscription,
  cancelRazorpaySubscription,
  verifyWebhookSignature,
  handleRazorpayWebhook
} from '../services/razorpay.service.js';

/* CREATE SUBSCRIPTION */
export const createSubscription = async (req, res) => {
  try {
    console.log('CREATE SUB BODY:', req.body);

    const { 
      plan, 
      email, 
      fullAddress, 
      planType, 
      planName, 
      amount, 
      currency,
      userName 
    } = req.body;

    // Store order in database
    const order = await Order.create({
      userEmail: email,
      userMName: userName || email.split('@')[0],
      plan: planType || 'monthly',
      planName: planName || 'Subscription',
      price: amount || 0,
      currency: currency || 'INR',
      provider: 'razorpay',
      status: 'pending',
      address: fullAddress || '',
      date: new Date()
    });

    // Create Razorpay subscription
    const data = await createRazorpaySubscription(req.body);
    
    // Update order with Razorpay subscription ID
    order.subscriptionId = data.id;
    order.razorpayOrderId = data.razorpay_order_id || data.id;
    await order.save();

    console.log('Order created:', order._id, 'Subscription:', data.id);

    // Return both subscription data and order ID
    return res.status(200).json({
      success: true,
      ...data,
      orderId: order._id
    });

  } catch (err) {
    console.error('RAZORPAY CREATE ERROR:', err.response?.data || err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
      razorpay: err.response?.data || null
    });
  }
};

/* ACTIVATE SUBSCRIPTION DETAILS */
// export const subscriptionDetails = async (req, res) => {
//   try {
//     const { uid, subscriptionId, plan, email, amount, currency, subscriberId } = req.body;
    
//     // Use subscriberId if subscriptionId is not provided
//     const subId = subscriptionId || subscriberId;
    
//     console.log('Subscription Details Request:', { uid, subId, plan, email, amount });

//     if (!uid || !subId || !plan) {
//       return res.status(400).json({
//         success: false,
//         message: "uid, subscriptionId & plan required"
//       });
//     }

//     // Find the order first
//     let order = await Order.findOne({ subscriptionId: subId });
    
//     if (!order) {
//       // Try to find by email and pending status
//       order = await Order.findOne({ 
//         userEmail: email, 
//         status: 'pending' 
//       }).sort({ createdAt: -1 });
      
//       if (order) {
//         order.subscriptionId = subId;
//         await order.save();
//         console.log('Updated existing order with subscription ID:', subId);
//       } else {
//         console.log('Order not found for subscription:', subId);
//         return res.status(404).json({
//           success: false,
//           message: "Order not found"
//         });
//       }
//     }

//     // Calculate subscription dates
//     const subscriptionStart = new Date();
//     let subscriptionEnd = new Date();
    
//     // Determine plan type from plan name or direct value
//     let planType = 'monthly';
//     if (plan === 'yearly' || plan === 'Yearly Plan' || plan === 'Yearly') {
//       planType = 'yearly';
//       subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
//     } else if (plan === 'monthly' || plan === 'Monthly Plan' || plan === 'Monthly') {
//       planType = 'monthly';
//       subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
//     } else {
//       planType = plan;
//     }

//     // Update order status to success
//     const updatedOrder = await Order.findOneAndUpdate(
//       { _id: order._id },
//       { 
//         userId: uid,
//         userEmail: email,
//         status: 'success',
//         price: amount ? parseFloat(amount) : order.price,
//         currency: currency || order.currency || 'INR',
//         subscriptionStartDate: subscriptionStart,
//         subscriptionEndDate: subscriptionEnd,
//         plan: planType,
//         planName: plan === 'Yearly Plan' ? 'Yearly Plan' : 
//                   plan === 'Monthly Plan' ? 'Monthly Plan' : 
//                   planType === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'
//       },
//       { new: true }
//     );

//     // Update user with subscription details
//     const userUpdates = {
//       type: planType,
//       subscriptionActive: true,
//       subscriptionStart: subscriptionStart,
//       subscriptionEnd: subscriptionEnd,
//       updatedAt: new Date()
//     };
    
//     // Update mName if available from order
//     if (order.userMName) {
//       userUpdates.mName = order.userMName;
//     }
    
//     const updatedUser = await User.findByIdAndUpdate(
//       uid, 
//       userUpdates,
//       { new: true }
//     );

//     console.log('Order updated:', updatedOrder._id, 'Status: success');
//     console.log('User updated:', uid, 'Plan:', planType);
//     console.log('Subscription dates:', { subscriptionStart, subscriptionEnd });

//     // Update admin total
//     try {
//       let cost = parseFloat(amount || order.price || 0) / 4;
//       await Admin.findOneAndUpdate(
//         { type: 'main' },
//         { $inc: { total: cost } },
//         { upsert: true }
//       );
//     } catch (adminError) {
//       console.error('Error updating admin total:', adminError);
//     }

//     // Activate subscription in Razorpay
//     const data = await activateRazorpaySubscription({
//       uid,
//       subscriptionId: subId,
//       plan: planType,
//       amount: amount || order.price,
//       currency: currency || order.currency,
//       mName: order.userMName,
//       email
//     });

//     return res.json({
//       success: true,
//       message: 'Subscription activated successfully',
//       data,
//       order: {
//         id: updatedOrder._id,
//         status: updatedOrder.status,
//         plan: updatedOrder.plan,
//         planName: updatedOrder.planName,
//         price: updatedOrder.price,
//         subscriptionStart: updatedOrder.subscriptionStartDate,
//         subscriptionEnd: updatedOrder.subscriptionEndDate
//       },
//       user: {
//         id: updatedUser._id,
//         type: updatedUser.type,
//         subscriptionActive: updatedUser.subscriptionActive,
//         subscriptionEnd: updatedUser.subscriptionEnd
//       }
//     });

//   } catch (err) {
//     console.error('Subscription Details Error:', err);
//     return res.status(500).json({ 
//       success: false, 
//       message: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };


/* ACTIVATE SUBSCRIPTION DETAILS - FIXED */
export const subscriptionDetails = async (req, res) => {
  try {
    const { subscriberId, uid, plan, email, price, currency, mName } = req.body;
    // subscriberId is coming from frontend, but schema uses subscriptionId
    
    console.log('Subscription details received:', { subscriberId, uid, plan, email, price, currency });

    if (!uid || !subscriberId || !plan) {
      return res.status(400).json({
        message: "uid, subscriberId & plan required",
        received: { uid, subscriberId, plan }
      });
    }

    // Find order by subscriptionId
    const order = await Order.findOne({ subscriptionId: subscriberId });
    
    if (!order) {
      console.log('Order not found for subscriptionId:', subscriberId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status to success
    order.status = 'success';
    if (price) order.price = price;
    if (currency) order.currency = currency;
    if (uid) order.userId = uid;
    if (email) order.userEmail = email;
    if (mName) order.userMName = mName;
    
    await order.save();

    // Activate subscription in Razorpay
    const data = await activateRazorpaySubscription({
      uid,
      plan,
      subscriptionId: subscriberId,
      amount: price,
      currency,
      mName,
      email
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data
    });
  } catch (err) {
    console.error('Subscription details error:', err);
    res.status(500).json({ message: err.message });
  }
};
/* FETCH SUBSCRIPTION */
export const pendingSubscription = async (req, res) => {
  try {
    const { sub } = req.body;
    
    if (!sub) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID required' 
      });
    }
    
    const data = await getRazorpaySubscription(sub);
    return res.json({
      success: true,
      ...data
    });

  } catch (err) {
    console.error('Pending Subscription Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/* CANCEL SUBSCRIPTION */
export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription ID required' 
      });
    }
    
    // Update order status to cancelled
    await Order.findOneAndUpdate(
      { subscriptionId: id },
      { status: 'cancelled' }
    );

    await cancelRazorpaySubscription(id);
    return res.json({ 
      success: true,
      message: 'Subscription cancelled successfully' 
    });

  } catch (err) {
    console.error('Cancel Subscription Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/* GET ALL ORDERS */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email mName type subscriptionActive subscriptionEnd');
    
    // Format orders for frontend
    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      return {
        _id: orderObj._id,
        date: orderObj.createdAt || orderObj.date,
        createdAt: orderObj.createdAt,
        updatedAt: orderObj.updatedAt,
        userMName: orderObj.userMName || orderObj.userId?.mName || orderObj.userId?.name || 'N/A',
        userName: orderObj.userMName || orderObj.userId?.mName || orderObj.userId?.name || 'N/A',
        userEmail: orderObj.userEmail,
        plan: orderObj.plan,
        planName: orderObj.planName,
        price: orderObj.price || 0,
        amount: orderObj.price || 0,
        currency: orderObj.currency || 'INR',
        provider: orderObj.provider || 'razorpay',
        status: orderObj.status,
        transactionId: orderObj.subscriptionId || orderObj.razorpayPaymentId || orderObj._id.toString(),
        subscriptionId: orderObj.subscriptionId,
        address: orderObj.address,
        subscriptionStartDate: orderObj.subscriptionStartDate,
        subscriptionEndDate: orderObj.subscriptionEndDate,
        userId: orderObj.userId,
        userData: orderObj.userId
      };
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error('GET ORDERS ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: err.message 
    });
  }
};

/* GET SINGLE ORDER */
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId', 'name email mName type subscriptionActive subscriptionEnd');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      ...order.toObject()
    });
  } catch (err) {
    console.error('GET ORDER ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order',
      error: err.message 
    });
  }
};

/* UPDATE ORDER STATUS */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error('UPDATE ORDER ERROR:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order',
      error: err.message 
    });
  }
};

/* MANUALLY UPDATE ORDER STATUS */
/* MANUALLY UPDATE ORDER STATUS - FIXED */
export const updateOrderManually = async (req, res) => {
  try {
    // IMPORT User model
    const User = mongoose.model('User');
    
    const { orderId, subscriptionId, status, amount, userName, planName } = req.body;
    
    let order;
    
    // Find order by ID or subscription ID
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (subscriptionId) {
      order = await Order.findOne({ subscriptionId });
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update fields
    const updates = {};
    if (status) updates.status = status;
    if (amount) updates.price = amount; // Use price, not amount
    if (userName) updates.userMName = userName;
    if (planName) updates.planName = planName;
    
    // Update user subscription if status is success and userId exists
    if (status === 'success' && order.userId) {
      await User.findByIdAndUpdate(order.userId, {
        type: order.plan || 'yearly',
        subscriptionActive: true,
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      updates,
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
    
  } catch (error) {
    console.error('Manual update error:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

/* BULK UPDATE PENDING ORDERS */
export const fixPendingOrders = async (req, res) => {
  try {
    // Find all pending orders
    const pendingOrders = await Order.find({ 
      status: 'pending',
      provider: 'razorpay',
      subscriptionId: { $exists: true, $ne: null }
    });
    
    const updates = [];
    const errors = [];
    
    for (const order of pendingOrders) {
      try {
        // Fetch subscription details from Razorpay
        if (order.subscriptionId) {
          const subscription = await getRazorpaySubscription(order.subscriptionId);
          
          // Check if subscription is active/charged
          if (subscription.status === 'active' || subscription.status === 'authenticated' || subscription.status === 'charged') {
            
            // Update order
            const updatedOrder = await Order.findByIdAndUpdate(order._id, {
              status: 'success',
              subscriptionStartDate: new Date(subscription.start_at * 1000),
              subscriptionEndDate: new Date(subscription.end_at * 1000)
            }, { new: true });
            
            updates.push({
              orderId: order._id,
              subscriptionId: order.subscriptionId,
              status: 'success',
              order: updatedOrder
            });
            
            // Update user if exists
            if (order.userId) {
              await User.findByIdAndUpdate(order.userId, {
                type: order.plan,
                subscriptionActive: true,
                subscriptionStart: new Date(subscription.start_at * 1000),
                subscriptionEnd: new Date(subscription.end_at * 1000)
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error updating order ${order._id}:`, error.message);
        errors.push({
          orderId: order._id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Updated ${updates.length} orders`,
      updates,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update orders',
      error: error.message 
    });
  }
};

/* CHECK ORDER STATUS */
export const checkOrderStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const order = await Order.findOne({ subscriptionId })
      .populate('userId', 'name email mName type subscriptionActive subscriptionEnd subscriptionStart');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        plan: order.plan,
        planName: order.planName,
        price: order.price,
        currency: order.currency,
        subscriptionStartDate: order.subscriptionStartDate,
        subscriptionEndDate: order.subscriptionEndDate,
        createdAt: order.createdAt,
        user: order.userId ? {
          id: order.userId._id,
          name: order.userId.name,
          email: order.userId.email,
          mName: order.userId.mName,
          type: order.userId.type,
          subscriptionActive: order.userId.subscriptionActive,
          subscriptionEnd: order.userId.subscriptionEnd
        } : null
      }
    });
  } catch (error) {
    console.error('Check order error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* UPDATE USER SUBSCRIPTION FROM ORDER */
export const updateUserFromOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    
    if (!userId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'userId and orderId required'
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in success status'
      });
    }
    
    // Calculate subscription dates
    const subscriptionStart = order.subscriptionStartDate || new Date();
    let subscriptionEnd = order.subscriptionEndDate;
    
    if (!subscriptionEnd) {
      subscriptionEnd = new Date();
      if (order.plan === 'yearly' || order.planName?.includes('Yearly')) {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        type: order.plan === 'yearly' || order.planName?.includes('Yearly') ? 'yearly' : 'monthly',
        subscriptionActive: true,
        subscriptionStart,
        subscriptionEnd,
        mName: order.userMName,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'User subscription updated from order',
      user: updatedUser,
      order
    });
    
  } catch (error) {
    console.error('Update user from order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};