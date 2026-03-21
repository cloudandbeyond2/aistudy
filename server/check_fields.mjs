import mongoose from 'mongoose';
import Course from './models/Course.js';
import dotenv from 'dotenv';
dotenv.config();

const checkFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aistudy');
    console.log('Connected to MongoDB');
    
    // Check if any course has 'organization' instead of 'organizationId'
    const coursesWithOrganizationField = await mongoose.connection.db.collection('courses').find({ organization: { $exists: true } }).toArray();
    console.log(`Courses with 'organization' field: ${coursesWithOrganizationField.length}`);
    if (coursesWithOrganizationField.length > 0) {
        console.log('Sample:', coursesWithOrganizationField[0]);
    }

    const coursesWithOrganizationIdField = await mongoose.connection.db.collection('courses').find({ organizationId: { $exists: true } }).toArray();
    console.log(`Courses with 'organizationId' field: ${coursesWithOrganizationIdField.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkFields();
