import axios from 'axios';

const testRazorpay = async () => {
    const auth = {
        username: "rzp_test_SCLaCj6sIAD331",
        password: "TChnVIiuiOZleVcdMeHcBo1L"
    };

    const planIds = [
        "plan_NMvvtDfznbRp6Vr",
        "plan_NMRc9HARBQRLWAr"
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
            console.log("SUCCESS:", response.status);
        } catch (err) {
            console.log("FAILURE:", err.response?.data?.error?.description || err.message);
        }
    }
};

testRazorpay();
