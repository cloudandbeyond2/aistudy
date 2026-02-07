import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkDB = async () => {
    let output = "Direct DB Check...\n";
    const uri = process.env.MONGODB_URI;
    output += `URI: ${uri ? 'Found' : 'Missing'}\n`;

    try {
        output += "Connecting with timeout 5s...\n";
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        output += "Connected!\n";
        const collections = await mongoose.connection.db.listCollections().toArray();
        output += `Collections: ${collections.map(c => c.name).join(', ')}\n`;

        const User = mongoose.model('UserTemp', new mongoose.Schema({}, { strict: false }), 'users');
        const orgs = await User.find({ isOrganization: true });
        output += `Found ${orgs.length} orgs\n`;
        orgs.forEach(o => {
            output += `- ${o.email}: ${JSON.stringify(o.organizationDetails)}\n`;
        });

    } catch (err) {
        output += `Error: ${err.message}\n`;
    } finally {
        fs.writeFileSync('db_check_direct.txt', output);
        mongoose.disconnect();
        process.exit();
    }
};

checkDB();
