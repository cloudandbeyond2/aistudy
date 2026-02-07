import User from './models/User.js';
import connectDB from './config/db.js';
import './config/env.js';

const checkOrgs = async () => {
    await connectDB();
    try {
        const orgs = await User.find({ isOrganization: true });
        console.log(`Found ${orgs.length} organizations`);
        console.log(JSON.stringify(orgs, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

checkOrgs();
