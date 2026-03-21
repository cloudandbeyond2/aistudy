import mongoose from 'mongoose';
import User from './models/User.js';
import Organization from './models/Organization.js';
import Course from './models/Course.js';
import dotenv from 'dotenv';
dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aistudy');
    console.log('Connected to MongoDB');
    
    const orgAdmins = await User.find({ role: 'org_admin' }).lean();
    console.log(`Total org_admins: ${orgAdmins.length}`);
    
    for (const admin of orgAdmins) {
      console.log(`Admin Email: ${admin.email}, Organization Field: ${admin.organization}`);
      if (!admin.organization) {
        // Try to find Organization by email
        const org = await Organization.findOne({ email: admin.email });
        if (org) {
          console.log(`  Found matching Organization: ${org._id}. Needs update!`);
        } else {
          console.log('  No matching Organization found by email.');
        }
      }
    }

    const deptAdmins = await User.find({ role: 'dept_admin' }).lean();
    console.log(`Total dept_admins: ${deptAdmins.length}`);
    for (const admin of deptAdmins) {
        console.log(`Dept Admin Email: ${admin.email}, Organization Field: ${admin.organization}`);
    }

    // Check courses again
    const courses = await Course.find({}).lean().limit(10);
    console.log('Sample courses:', JSON.stringify(courses.map(c => ({ _id: c._id, user: c.user, organizationId: c.organizationId })), null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkData();
