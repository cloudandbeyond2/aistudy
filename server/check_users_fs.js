import User from './models/User.js';
import connectDB from './config/db.js';
import './config/env.js';
import fs from 'fs';

const checkUsers = async () => {
    let output = "Starting...\n";
    try {
        await connectDB();
        output += "Connected.\n";
        const users = await User.find({});
        output += `Found ${users.length} users\n`;
        users.forEach(u => {
            if (u.isOrganization) {
                output += `Email: ${u.email}, Details: ${JSON.stringify(u.organizationDetails)}\n`;
            } else {
                output += `Email: ${u.email}, isOrg: false\n`;
            }
        });
    } catch (err) {
        output += `Error: ${err.message}\n`;
    } finally {
        fs.writeFileSync('users_dump_v3.txt', output);
        process.exit();
    }
};

checkUsers();
