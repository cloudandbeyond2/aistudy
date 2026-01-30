import express from 'express';
import { fetchPolicies } from '../controllers/policy.controller.js';

const router = express.Router();

router.get('/policies', fetchPolicies);

export default router;
