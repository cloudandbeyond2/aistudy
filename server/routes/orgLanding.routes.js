import express from 'express';
import { 
    getOrgLandingBySlug, 
    getOrgLandingConfig, 
    updateOrgLandingConfig 
} from '../controllers/orgLanding.controller.js';

const router = express.Router();

// Public route to get landing page data by slug
router.get('/org-landing/public/:slug', getOrgLandingBySlug);

// Protected routes for Org Admin to manage their landing page
router.get('/org-landing/config', getOrgLandingConfig);
router.put('/org-landing/config', updateOrgLandingConfig);

export default router;
