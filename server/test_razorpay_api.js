import axios from 'axios';
import PaymentSetting from './models/PaymentSetting.js';
import connectDB from './config/db.js';
import './config/env.js';

const testRazorpay = async () => {
    await connectDB();
    try {
        const setting = await PaymentSetting.findOne({ provider: 'razorpay' });
        if (!setting) {
            console.error("Razorpay setting not found in DB");
            process.exit(1);
        }

        const auth = {
            username: setting.publicKey,
            password: setting.secretKey
        };

        const planIds = [
            "plan_NMvvtDfznbRp6Vr", // From constants.tsx
            "plan_NMRc9HARBQRLWAr"  // From constants.tsx
        ];

        console.log(`Testing with Key ID: ${auth.username}`);

        for (const plan_id of planIds) {
            console.log(`\nTesting Plan ID: ${plan_id}`);
            try {
                const payload = {
                    plan_id: plan_id,
                    total_count: 12,
                    quantity: 1,
                    customer_notify: 1,
                    notes: { address: "Test Address" },
                    notify_info: { notify_email: "test@example.com" }
                };

                const response = await axios.post(
                    'https://api.razorpay.com/v1/subscriptions',
                    payload,
                    { auth, headers: { 'Content-Type': 'application/json' } }
                );
                console.log("SUCCESS:", JSON.stringify(response.data, null, 2));
            } catch (err) {
                console.error("FAILURE:", err.response?.data || err.message);
            }
        }

    } catch (err) {
        console.error("GENERAL ERROR:", err);
    } finally {
        process.exit();
    }
};

testRazorpay();
