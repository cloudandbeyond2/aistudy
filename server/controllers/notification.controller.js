
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

/* CLEAR ALL NOTIFICATIONS */
export const clearNotifications = async (req, res) => {
    try {

        const { userId } = req.body;

        await Notification.deleteMany({ user: userId });

        res.json({
            success: true,
            message: "Notifications cleared"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

/* CREATE (Internal use mostly) */
export const createNotification = async ({ user, message, type, link }) => {
    await Notification.create({ user, message, type, link });
};
