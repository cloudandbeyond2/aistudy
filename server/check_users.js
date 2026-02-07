import User from './models/User.js';
import connectDB from './config/db.js';
import './config/env.js';

const checkUsers = async () => {
    console.log('--- START ---');
    try {
        console.log('Loading env...');
        // env imported at top
        console.log('Connecting DB...');
        await connectDB();
        console.log('Connected.');
        const users = await User.find({});
        console.log(`Found: ${users.length}`);
        for (const u of users) {
            console.log(`- ${u.email} (Org: ${u.isOrganization})`);
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        console.log('--- END ---');
        process.exit(0);
    }
};

checkUsers();
