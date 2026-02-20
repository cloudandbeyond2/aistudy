import express from 'express';
import { fetchPolicies, updatePolicies } from '../controllers/policy.controller.js';

const router = express.Router();

router.get('/policies', fetchPolicies);
router.put('/policies', updatePolicies);

export default router;
