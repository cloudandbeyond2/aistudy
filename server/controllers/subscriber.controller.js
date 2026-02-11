import Subscriber from '../models/Subscriber.js';

/**
 * SUBSCRIBE TO NEWSLETTER
 */
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if already subscribed
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You are already subscribed!'
            });
        }

        const subscriber = new Subscriber({ email });
        await subscriber.save();

        res.json({
            success: true,
            message: 'Subscribed successfully!'
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

/**
 * GET ALL SUBSCRIBERS (For Admin)
 */
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
