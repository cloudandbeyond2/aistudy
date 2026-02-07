import axios from 'axios';
import './config/env.js';
import connectDB from './config/db.js';
import User from './models/User.js';

const testLogin = async () => {
    try {
        await connectDB();
        const testEmail = 'test@example.com';
        const testPassword = 'password123';

        // 1. Create a test user if not exists
        let user = await User.findOne({ email: testEmail });
        if (!user) {
            console.log('Creating test user...');
            user = new User({
                email: testEmail,
                password: testPassword,
                mName: 'Test User',
                type: 'free'
            });
            await user.save();
        } else {
            console.log('Test user exists. Resetting password...');
            user.password = testPassword;
            await user.save();
        }

        // 2. Try to login via API
        console.log('Attempting login via API...');
        const response = await axios.post('http://localhost:5001/api/signin', {
            email: testEmail,
            password: testPassword
        });

        console.log('Login Response:', response.data);

    } catch (error) {
        console.error('Login Test Error:', error.response ? error.response.data : error.message);
    }
    process.exit();
};

testLogin();
