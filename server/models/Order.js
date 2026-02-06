import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    provider: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, default: 'success' },
    date: { type: Date, default: Date.now }
});

orderSchema.index({ user: 1 });
orderSchema.index({ date: -1 });

export default mongoose.model('Order', orderSchema);
