import User from './models/User.js';
import connectDB from './config/db.js';
import './config/env.js';
import fs from 'fs';

const checkType = async () => {
    let output = "Checking type...\n";
    try {
        await connectDB();
        const user = await User.findOne({ email: 'ins@gmail.com' });
        if (user) {
            output += `Email: ${user.email}\n`;
            output += `isOrganization value: ${user.isOrganization}\n`;
            output += `isOrganization type: ${typeof user.isOrganization}\n`;
            output += `Direct comparison with true: ${user.isOrganization === true}\n`;
            output += `Direct comparison with 'true': ${user.isOrganization === 'true'}\n`;
        } else {
            output += "User not found\n";
        }
    } catch (err) {
        output += `Error: ${err.message}\n`;
    } finally {
        fs.writeFileSync('type_check.txt', output);
        process.exit();
    }
};

checkType();
