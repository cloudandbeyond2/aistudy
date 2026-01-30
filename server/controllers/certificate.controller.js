import CertificateSettings from '../models/CertificateSettings.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import transporter from '../config/mail.js';

/**
 * GET CERTIFICATE SETTINGS
 */
export const getCertificateSettings = async (req, res) => {
  try {
    let settings = await CertificateSettings.findOne();

    if (!settings) {
      settings = new CertificateSettings();
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
    ceoName,
    ceoSignature,
    vpName,
    vpSignature,
    logo,
    qrCodeUrl
  } = req.body;

  try {
    let settings = await CertificateSettings.findOne();

    if (!settings) {
      settings = new CertificateSettings({
        ceoName,
        ceoSignature,
        vpName,
        vpSignature,
        logo,
        qrCodeUrl
      });
    } else {
      settings.ceoName = ceoName;
      settings.ceoSignature = ceoSignature;
      settings.vpName = vpName;
      settings.vpSignature = vpSignature;
      settings.logo = logo;
      settings.qrCodeUrl = qrCodeUrl;
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
