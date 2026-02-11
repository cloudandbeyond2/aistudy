// import mongoose from 'mongoose';

// const orderSchema = new mongoose.Schema({
//     userId: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'User',
//         index: true 
//     },
//     userEmail: { 
//         type: String, 
//         required: true,
//         index: true 
//     },
//     userMName: { 
//         type: String,
//         default: '' 
//     },
//     subscriptionId: { 
//         type: String,
//         index: true,
//         sparse: true 
//     },
//     razorpayOrderId: { 
//         type: String 
//     },
//     razorpayPaymentId: { 
//         type: String 
//     },
//     razorpaySignature: { 
//         type: String 
//     },
//     plan: { 
//         type: String, 
//         required: true,
//         enum: ['monthly', 'yearly', 'free', 'Monthly Plan', 'Yearly Plan', 'Free Plan'],
//         default: 'monthly'
//     },
//     planName: { 
//         type: String, 
//         required: true,
//         default: 'Monthly Plan'
//     },
//     price: { 
//         type: Number, 
//         required: true,
//         default: 0 
//     },
//     currency: { 
//         type: String, 
//         default: 'INR' 
//     },
//     provider: { 
//         type: String, 
//         default: 'razorpay' 
//     },
//     status: { 
//         type: String, 
//         enum: ['pending', 'success', 'failed', 'cancelled', 'active'],
//         default: 'pending',
//         index: true
//     },
//     address: { 
//         type: String,
//         default: '' 
//     },
//     paymentMethod: { 
//         type: String 
//     },
//     invoiceUrl: { 
//         type: String 
//     },
//     subscriptionStartDate: { 
//         type: Date 
//     },
//     subscriptionEndDate: { 
//         type: Date 
//     },
//     date: { 
//         type: Date, 
//         default: Date.now,
//         index: true 
//     }
// }, { 
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// // Virtual for amount (backward compatibility)
// orderSchema.virtual('amount').get(function() {
//     return this.price;
// });

// // Index for better query performance
// orderSchema.index({ subscriptionId: 1, status: 1 });
// orderSchema.index({ userEmail: 1, createdAt: -1 });

// export default mongoose.model('Order', orderSchema);

// models/Order.js - Fix schema
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    userEmail: { type: String, required: true },
    userMName: { type: String }, // SINGLE source for user name
    subscriptionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    plan: { type: String, required: true }, // 'monthly', 'yearly'
    planName: { type: String, required: true },
    price: { type: Number, required: true }, // ONLY price field - NO amount field
    currency: { type: String, default: 'INR' },
    provider: { type: String, default: 'razorpay' },
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed', 'cancelled'],
        default: 'pending'
    },
    address: { type: String },
    paymentMethod: { type: String },
    invoiceUrl: { type: String },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);