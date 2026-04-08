import mongoose from 'mongoose';

const liveSupportMessageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveSupportSession',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Organization']
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('LiveSupportMessage', liveSupportMessageSchema);
