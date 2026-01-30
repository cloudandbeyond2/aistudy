import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: String,
  subscription: String,
  subscriberId: String,
  plan: String,
  method: String,
  date: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

subscriptionSchema.index({ user: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
