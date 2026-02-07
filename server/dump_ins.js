import User from './models/User.js';
import connectDB from './config/db.js';
import './config/env.js';
import fs from 'fs';

const dumpUser = async () => {
    try {
        await connectDB();
        const user = await User.findOne({ email: 'ins@gmail.com' }).lean();
        fs.writeFileSync('user_ins_dump.json', JSON.stringify(user, null, 2));
    } catch (err) {
        fs.writeFileSync('user_ins_dump.json', JSON.stringify({ error: err.message }));
    } finally {
        process.exit();
    }
};

dumpUser();
