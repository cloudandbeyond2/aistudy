
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    mName: String,
    password: String,
    type: String,
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicourse';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        const email = 'admin@example.com';
        const password = 'password123';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            console.log('Email:', email);
            console.log('Password:', password);
        } else {
            const newUser = new User({
                email,
                mName: 'Admin User',
                password,
                type: 'forever'
            });
            await newUser.save();
            console.log('User created successfully');
            console.log('Email:', email);
            console.log('Password:', password);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
