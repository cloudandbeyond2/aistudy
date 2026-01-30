import express from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/dashboard', adminController.dashboard);

router.get('/getusers', adminController.getUsers);
router.get('/getpaid', adminController.getPaidUsers);
router.post('/admin/deleteuser', adminController.deleteUser);
router.post('/admin/updateuser', adminController.updateUser);

router.get('/getcourses', adminController.getCourses);
router.post('/admin/updatecourse', adminController.updateCourse);

router.get('/getadmins', adminController.getAdmins);
router.post('/addadmin', adminController.addAdmin);
router.post('/removeadmin', adminController.removeAdmin);

router.post('/saveadmin', adminController.saveAdmin);

export default router;
