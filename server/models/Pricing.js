import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  planType: {
    type: String,
    enum: ['free', 'monthly', 'yearly'],
    required: true,
    unique: true
  },
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingPeriod: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Pricing', pricingSchema);
