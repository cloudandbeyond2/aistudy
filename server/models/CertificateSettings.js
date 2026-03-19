import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  top: { type: String, default: '0%' },
  left: { type: String, default: '0%' },
  right: { type: String, default: 'auto' },
  bottom: { type: String, default: 'auto' }
}, { _id: false });

const certificateSettingsSchema = new mongoose.Schema({
  ceoName: { type: String, default: 'Anandaraj' },
  ceoSignature: { type: String, default: '' }, // Base64
  vpName: { type: String, default: 'Mr. Ananda raj' },
  vpSignature: { type: String, default: '' }, // Base64
  logo: { type: String, default: '' }, // Base64
  qrCodeUrl: {
    type: String,
    default: 'http://localhost:4173/verify-certificate'
  },
  // Customizable fields
  backgroundImage: { type: String, default: '' }, // Base64 background image
  organizationName: { type: String, default: 'AI Study' },
  organizationLogo: { type: String, default: '' }, // Base64 organization logo
  partnerLogo: { type: String, default: '' }, // Base64 partner logo
  certificateDescription: { type: String, default: 'This certificate is awarded for successfully completing the course with distinction.' },
  signatureTitle: { type: String, default: 'Director' },
  showOrganization: { type: Boolean, default: true },
  showPartnerLogo: { type: Boolean, default: true },
  
  // Dynamic Positions
  positions: {
    organizationLogo: { type: positionSchema, default: () => ({ bottom: '12%', left: '8%' }) },
    organizationName: { type: positionSchema, default: () => ({ bottom: '8%', left: '8%' }) },
    title: { type: positionSchema, default: () => ({ top: '25%', left: '50%' }) },
    subtitle: { type: positionSchema, default: () => ({ top: '32%', left: '50%' }) },
    certifyText: { type: positionSchema, default: () => ({ top: '38%', left: '50%' }) },
    name: { type: positionSchema, default: () => ({ top: '46%', left: '50%' }) },
    description: { type: positionSchema, default: () => ({ top: '56%', left: '50%' }) },
    courseName: { type: positionSchema, default: () => ({ top: '64%', left: '50%' }) },
    signature: { type: positionSchema, default: () => ({ bottom: '22%', left: '12%' }) },
    date: { type: positionSchema, default: () => ({ bottom: '22%', right: '12%' }) },
    qrCode: { type: positionSchema, default: () => ({ bottom: '14%', right: '7%' }) },
    footer: { type: positionSchema, default: () => ({ bottom: '4%', left: '50%' }) }
  },
  
  // Size customization
  sizes: {
    organizationLogoHeight: { type: String, default: '50px' },
    partnerLogoHeight: { type: String, default: '50px' },
    signatureHeight: { type: String, default: '40px' },
    qrCodeSize: { type: String, default: '55' }
  }
});

export default mongoose.model(
  'CertificateSettings',
  certificateSettingsSchema
);
