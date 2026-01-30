const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    // ... other fields
});

const courseSchema = new mongoose.Schema({
    user: String,
    mainTopic: String,
    type: String,
    content: String,
    photo: String,
    completed: { type: Boolean, default: false },
    end: Date
});

const issuedCertificateSchema = new mongoose.Schema({
    certificateId: { type: String, unique: true, required: true },
    user: { type: String, required: true },
    course: { type: String, required: true },
    studentName: String,
    courseName: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const IssuedCertificate = mongoose.model('IssuedCertificate', issuedCertificateSchema);

async function setupData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'testuser_cert@gmail.com' });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('User found:', user._id);

        const course = new Course({
            user: user._id,
            mainTopic: 'Certificate Verification Test',
            type: 'text',
            content: JSON.stringify({ "certificate verification test": [{ subtopics: [{ title: "Test", content: "Test content", done: true }] }] }),
            photo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            completed: true,
            end: new Date()
        });
        await course.save();
        console.log('Course created:', course._id);

        const cert = new IssuedCertificate({
            certificateId: 'CERT-VERIFY-TEST',
            user: user._id,
            course: course._id,
            studentName: 'Test Cert User',
            courseName: 'Certificate Verification Test'
        });
        await cert.save();
        console.log('Certificate created:', cert.certificateId);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setupData();
