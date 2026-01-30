import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  profession: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  approved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Testimonial', testimonialSchema);
