import express from 'express';
import {
  submitContact,
  getContacts
} from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/contact', submitContact);
router.get('/getcontact', getContacts);

export default router;
