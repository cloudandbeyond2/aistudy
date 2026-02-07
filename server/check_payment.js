import PaymentSetting from './models/PaymentSetting.js';
import connectDB from './config/db.js';
import './config/env.js';

const checkSettings = async () => {
    await connectDB();
    try {
        const settings = await PaymentSetting.find({ provider: 'razorpay' });
        console.log(JSON.stringify(settings, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

checkSettings();
