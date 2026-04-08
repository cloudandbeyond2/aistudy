import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
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

const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);
export default SupportMessage;
