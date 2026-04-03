
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

/* SEND INDIVIDUAL NOTIFICATION (Admin/Staff use) */
export const sendIndividualNotification = async (req, res) => {
    try {
        const { userId, message, type, link } = req.body;
        
        if (!userId || !message) {
            return res.status(400).json({ success: false, message: 'User ID and message are required' });
        }

        const notification = await Notification.create({
            user: userId,
            message,
            type: type || 'admin_message',
            link: link || ''
        });

        res.status(201).json({
            success: true,
            message: 'Notification sent successfully',
            data: notification
        });
    } catch (error) {
        console.error('Send individual notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
