import CertificateSettings from '../models/CertificateSettings.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import transporter from '../config/mail.js';

/**
 * GET CERTIFICATE SETTINGS
 */
export const getCertificateSettings = async (req, res) => {
  try {
    const type = req.query.type || 'regular';
    let settings = await CertificateSettings.findOne({ type });

    if (!settings) {
      settings = new CertificateSettings({ type });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.log('Error fetching certificate settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * UPDATE CERTIFICATE SETTINGS (ADMIN)
 */
export const updateCertificateSettings = async (req, res) => {
  const {
    type = 'regular',
    ceoName,
    ceoSignature,
    vpName,
    vpSignature,
    logo,
    qrCodeUrl,
    backgroundImage,
    organizationName,
    organizationLogo,
    partnerLogo,
    certificateDescription,
    signatureTitle,
    showOrganization,
    showPartnerLogo,
    positions,
    sizes
  } = req.body;

  try {
    let settings = await CertificateSettings.findOne({ type });

    if (!settings) {
      settings = new CertificateSettings({
        type,
        ceoName,
        ceoSignature,
        vpName,
        vpSignature,
        logo,
        qrCodeUrl,
        backgroundImage,
        organizationName,
        organizationLogo,
        partnerLogo,
        certificateDescription,
        signatureTitle,
        showOrganization,
        showPartnerLogo,
        positions,
        sizes
      });
    } else {
      settings.ceoName = ceoName;
      settings.ceoSignature = ceoSignature;
      settings.vpName = vpName;
      settings.vpSignature = vpSignature;
      settings.logo = logo;
      settings.qrCodeUrl = qrCodeUrl;
      settings.backgroundImage = backgroundImage;
      settings.organizationName = organizationName;
      settings.organizationLogo = organizationLogo;
      settings.partnerLogo = partnerLogo;
      settings.certificateDescription = certificateDescription;
      settings.signatureTitle = signatureTitle;
      settings.showOrganization = showOrganization;
      settings.showPartnerLogo = showPartnerLogo;
      if (positions) settings.positions = positions;
      if (sizes) settings.sizes = sizes;
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Certificate settings updated successfully'
    });
  } catch (error) {
    console.log('Error updating certificate settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
/**
 * VERIFY CERTIFICATE
 */
export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await IssuedCertificate.findOne({
      certificateId: req.params.id
    });

    if (certificate) {
      res.json({ success: true, certificate });
    } else {
      res.json({ success: false, message: 'Certificate not found' });
    }
  } catch (error) {
    console.log('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * SEND CERTIFICATE EMAIL
 */
export const sendCertificateEmail = async (req, res) => {
  const { html, email } = req.body;

  try {
    const options = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Certification of completion',
      html
    };

    await transporter.sendMail(options);

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};
