import Notification from '../models/Notification.js';

/* GET NOTIFICATIONS */
import mongoose from 'mongoose';

export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.body;

        const notifications = await Notification.find({
            user: new mongoose.Types.ObjectId(userId) // ✅ FIX HERE
        }).sort({ date: -1 });

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("Get notification error:", error);
        res.status(500).json({ success: false, message: error.message });
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

/* MARK READ BY LINK */
export const markByLinkAsRead = async (req, res) => {
    try {
        const { userId, link } = req.body;

        if (!userId || !link) {
            return res.status(400).json({ success: false, message: 'userId and link are required' });
        }

        await Notification.updateMany(
            {
                user: userId,
                link,
                isRead: false
            },
            { $set: { isRead: true } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark notifications by link error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/* CLEAR ALL NOTIFICATIONS */
export const clearNotifications = async (req, res) => {
    try {

    const { userId } = req.query;

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
          console.log("Sending to user:", userId);
        
        if (!userId || !message) {
            return res.status(400).json({ success: false, message: 'User ID and message are required' });
        }

        const notification = await Notification.create({
            user: userId,
            message,
          type: type || 'info',
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
