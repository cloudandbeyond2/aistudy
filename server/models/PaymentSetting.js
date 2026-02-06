import mongoose from 'mongoose';

const paymentSettingSchema = new mongoose.Schema({
    provider: { type: String, required: true, unique: true }, // stripe, paypal, razorpay, etc.
    isEnabled: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
    publicKey: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
});

export default mongoose.model('PaymentSetting', paymentSettingSchema);
