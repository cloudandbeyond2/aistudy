import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

const checkKeys = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await Admin.findOne({ type: 'main' });
        console.log("DB Admin found?", !!admin);
        if (admin) {
            console.log("geminiApiKey:", admin.geminiApiKey ? `Exists (length: ${admin.geminiApiKey.length})` : "Missing");
            console.log("KEY IS:", admin.geminiApiKey);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkKeys();
