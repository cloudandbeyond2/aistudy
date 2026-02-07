
import Notification from '../models/Notification.js';

/* GET NOTIFICATIONS */
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.body; // or req.user.id
        const notifications = await Notification.find({ user: userId }).sort({ date: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* MARK READ */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.body;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

/* CREATE (Internal use mostly) */
export const createNotification = async ({ user, message, type }) => {
    await Notification.create({ user, message, type });
};
