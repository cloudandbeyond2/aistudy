import express from 'express';
import {
  getCertificateSettings,
  updateCertificateSettings
} from '../controllers/certificate.controller.js';
import {
  verifyCertificate,
  sendCertificateEmail
} from '../controllers/certificate.controller.js';

const router = express.Router();

// Public
router.get('/certificate-settings', getCertificateSettings);

// Admin
router.post('/admin/certificate-settings', updateCertificateSettings);
router.get('/verify-certificate/:id', verifyCertificate);
router.post('/sendcertificate', sendCertificateEmail);

export default router;
