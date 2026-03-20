import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { uploadLogo } from '../config/upload.config.js';

const router = express.Router();

router.post('/dashboard', adminController.dashboard);

router.get('/getusers', adminController.getUsers);
router.get('/getpaid', adminController.getPaidUsers);
router.post('/admin/deleteuser', adminController.deleteUser);
router.post('/admin/updateuser', adminController.updateUser);
router.post('/admin/block-user', adminController.toggleBlockUser);

router.get('/getcourses', adminController.getCourses);
router.post('/admin/updatecourse', adminController.updateCourse);

router.get('/getadmins', adminController.getAdmins);
router.post('/addadmin', adminController.addAdmin);
router.post('/removeadmin', adminController.removeAdmin);

router.post('/saveadmin', adminController.saveAdmin);

router.get('/orders', adminController.getOrders);
router.put('/orders/:id', adminController.updateOrder);
router.get('/payment-settings', adminController.getPaymentSettings);
router.post('/payment-settings', adminController.updatePaymentSetting);

router.get('/organizations', adminController.getOrganizations);
router.get('/org-plan', adminController.getOrgPlan);
router.post('/organization/create', adminController.createOrganization);
router.post('/organization/:id', adminController.updateOrganization);
router.post('/organization/:id/block', adminController.toggleBlockOrganization);

router.get('/limit-requests', adminController.getLimitRequests);
router.post('/limit-request/process', adminController.processLimitRequest);

router.get('/settings', adminController.getAdminSettings);
router.post('/settings', adminController.updateAdminSettings);
router.post('/settings/upload-logo', uploadLogo.single('logo'), adminController.uploadLogo);

// We use a GET request here for easier fetching on the landing/login page
router.get('/public-stats', adminController.dashboard);
export default router;
