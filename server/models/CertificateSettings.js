import mongoose from 'mongoose';

const certificateSettingsSchema = new mongoose.Schema({
  ceoName: { type: String, default: 'Anandaraj' },
  ceoSignature: { type: String, default: '' }, // Base64
  vpName: { type: String, default: 'Mr. Ananda raj' },
  vpSignature: { type: String, default: '' }, // Base64
  logo: { type: String, default: '' }, // Base64
  qrCodeUrl: {
    type: String,
    default: 'http://localhost:4173/verify-certificate'
  }
});

export default mongoose.model(
  'CertificateSettings',
  certificateSettingsSchema
);
