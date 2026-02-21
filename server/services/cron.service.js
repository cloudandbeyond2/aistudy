import cron from 'node-cron';
import User from '../models/User.js';
import { sendExpiryWarningEmail } from './subscriptionEmail.service.js';

export const startCronJobs = () => {
    // Run everyday at 08:00 (server time)
    cron.schedule('0 8 * * *', async () => {
        console.log('⏳ Running daily subscription expiry check...');
        try {
            const today = new Date();
            // Calculate date range for exactly 7 days from now
            // Let's find users whose subscriptionEnd is between 7 days from now at 00:00:00 and 7 days from now at 23:59:59
            const targetDateStart = new Date(today);
            targetDateStart.setDate(targetDateStart.getDate() + 7);
            targetDateStart.setHours(0, 0, 0, 0);

            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setHours(23, 59, 59, 999);

            const expiringUsers = await User.find({
                subscriptionEnd: {
                    $gte: targetDateStart,
                    $lte: targetDateEnd
                }
            });

            console.log(`Found ${expiringUsers.length} users with subscription expiring in 7 days.`);

            for (const user of expiringUsers) {
                if (user.email) {
                    try {
                        await sendExpiryWarningEmail(user.email, user.mName || 'User');
                        console.log(`✅ Expiry warning email sent to ${user.email}`);
                    } catch (emailError) {
                        console.error(`❌ Failed to send expiry warning to ${user.email}:`, emailError);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error in subscription expiry cron job:', error);
        }
    });

    console.log('⏰ Cron jobs initialized.');
};
