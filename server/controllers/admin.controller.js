import * as adminService from '../services/admin.service.js';

/* DASHBOARD */
export const dashboard = async (req, res) => {
  try {
    const data = await adminService.getDashboardStatsWithOrgs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* USERS */
export const getUsers = async (req, res) => {
  res.json(await adminService.getAllUsers());
};

export const getPaidUsers = async (req, res) => {
  res.json(await adminService.getPaidUsers());
};

export const deleteUser = async (req, res) => {
  await adminService.deleteUser(req.body.userId);
  res.json({ success: true });
};

export const updateUser = async (req, res) => {
  await adminService.updateUser(req.body);
  res.json({ success: true });
};

/* COURSES */
export const getCourses = async (req, res) => {
  const courses = await adminService.getAllCourses();
  res.set('Cache-Control', 'public, max-age=3600');
  res.json(courses);
};

export const updateCourse = async (req, res) => {
  await adminService.adminUpdateCourse(req.body);
  res.json({ success: true });
};

/* ADMINS */
export const getAdmins = async (req, res) => {
  res.json(await adminService.getAdminsAndUsers());
};

export const addAdmin = async (req, res) => {
  await adminService.addAdmin(req.body.email);
  res.json({ success: true });
};

export const removeAdmin = async (req, res) => {
  await adminService.removeAdmin(req.body.email);
  res.json({ success: true });
};

/* POLICIES */
export const saveAdmin = async (req, res) => {
  await adminService.saveAdminPolicy(req.body);
  res.json({ success: true });
};

/* ORDERS */
export const getOrders = async (req, res) => {
  try {
    const orders = await adminService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/* PAYMENT SETTINGS */
export const getPaymentSettings = async (req, res) => {
  try {
    const settings = await adminService.getPaymentSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updatePaymentSetting = async (req, res) => {
  try {
    const setting = await adminService.updatePaymentSetting(req.body);
    res.json({ success: true, setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export const getDashboardWithOrgs = async (req, res) => {
  try {
    const data = await adminService.getDashboardStatsWithOrgs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrganizations = async (req, res) => {
  try {
    const orgs = await adminService.getAllOrganizations();
    res.json(orgs);
  } catch (err) {
    console.error('Error fetching organizations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await adminService.updateOrganization(id, req.body);
    res.json({ success: true, organization: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleBlockOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    await adminService.toggleBlockOrganization(id, isBlocked);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOrganization = async (req, res) => {
  try {
    const org = await adminService.createOrganization(req.body);
    res.json({ success: true, organization: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* SETTINGS */
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await adminService.getAdminSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    await adminService.updateAdminSettings(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // For Vercel/Memory storage, convert buffer to Base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({
      success: true,
      url: base64Image
    });
  } catch (err) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
