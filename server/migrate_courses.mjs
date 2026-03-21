import mongoose from 'mongoose';
import Course from './models/Course.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const migrateCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aistudy');
    console.log('Connected to MongoDB');
    
    const courses = await Course.find({ organizationId: null }).limit(20);
    console.log(`Checking first ${courses.length} courses...`);
    
    let updatedCount = 0;
    for (const course of courses) {
      console.log(`Checking Course: ${course._id}, User: ${course.user}`);
      if (course.user) {
        const user = await User.findById(course.user).lean();
        if (user) {
          console.log(`  User found: ${user.email}, Role: ${user.role}, Org Field: ${user.organization}`);
          if (user.organization) {
            await Course.findByIdAndUpdate(course._id, { $set: { organizationId: user.organization } });
            console.log(`  Updated course ${course._id} with org ${user.organization}`);
            updatedCount++;
          } else {
             console.log(`  User has no organization field set.`);
          }
        } else {
          console.log(`  User NOT found for ID: ${course.user}`);
        }
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} courses.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration Error:', error);
  }
};

migrateCourses();
