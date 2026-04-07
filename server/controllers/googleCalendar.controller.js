import User from '../models/User.js';
import Schedule from '../models/Schedule.js';
import { google } from 'googleapis';

const PREMIUM_PLANS = ['monthly', 'yearly', 'forever'];

const isPremiumUser = (user) => {
  if (!user) return false;
  if (user.isOrganization || user.role === 'org_admin') return true;
  return PREMIUM_PLANS.includes(user.type);
};

const getOAuth2Client = () => {
  if (!google) return null;
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${process.env.SERVER_URL || 'http://localhost:5000'}/api/google-calendar/callback`
  );
};

/* ──────────────────────────────────────────────
   GET /api/google-calendar/auth-url?userId=...
   Returns a Google OAuth consent URL
────────────────────────────────────────────── */
export const getAuthUrl = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const user = await User.findById(userId).select('type role isOrganization').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!isPremiumUser(user)) {
      return res.status(403).json({ success: false, message: 'Google Calendar sync is a premium feature. Please upgrade your plan.' });
    }

    if (!google || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: 'Google Calendar integration is not yet configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your server .env file.'
      });
    }

    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      state: userId,
    });

    res.json({ success: true, url: authUrl });
  } catch (err) {
    console.error('Google Calendar getAuthUrl error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────────
   GET /api/google-calendar/callback
   Query: { code, state }
   Exchanges auth code for tokens and saves refresh token
────────────────────────────────────────────── */
export const handleCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    
    if (!code || !userId) {
      return res.status(400).send('<h1>Error</h1><p>Invalid callback request. Missing code or state.</p>');
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send('<h1>User Not Found</h1>');
    if (!isPremiumUser(user)) {
      return res.status(403).send('<h1>Premium Feature</h1><p>This feature is available for premium users only.</p>');
    }

    if (!google || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).send('<h1>Config Error</h1><p>Google Calendar is not configured on the server.</p>');
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      await User.findByIdAndUpdate(userId, {
        'googleCalendar.connected': true,
        'googleCalendar.refreshToken': tokens.refresh_token,
      });
    } else {
      // If no refresh token (user already authorized), we just mark as connected
      await User.findByIdAndUpdate(userId, {
        'googleCalendar.connected': true,
      });
    }

    // Return a nice success page that auto-closes or instructs to close
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
            <h1 style="color: #10b981;">Success!</h1>
            <p>Your Google Calendar has been connected.</p>
            <p style="color: #64748b; font-size: 0.875rem;">You can now close this window and return to your dashboard.</p>
            <button onclick="window.close()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #0f172a; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Close Window</button>
            <script>setTimeout(() => window.close(), 3000);</script>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Google Calendar callback error:', err);
    res.status(500).send(`<h1>Internal Server Error</h1><p>${err.message}</p>`);
  }
};

/* ──────────────────────────────────────────────
   GET /api/google-calendar/status?userId=...
   Returns connection status for the user
────────────────────────────────────────────── */
export const getStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const user = await User.findById(userId).select('type role isOrganization googleCalendar').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const premium = isPremiumUser(user);
    res.json({
      success: true,
      data: {
        isPremium: premium,
        connected: premium ? (user.googleCalendar?.connected || false) : false,
        lastSyncAt: user.googleCalendar?.lastSyncAt || null,
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────────
   POST /api/google-calendar/sync
   Body: { userId }
   Fetches upcoming events from Google Calendar and creates schedule items
────────────────────────────────────────────── */
export const syncEvents = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const user = await User.findById(userId).select('type role isOrganization googleCalendar').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!isPremiumUser(user)) {
      return res.status(403).json({ success: false, message: 'Premium feature only' });
    }
    if (!user.googleCalendar?.connected || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({ success: false, message: 'Google Calendar not connected' });
    }

    if (!google || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ success: false, message: 'Google Calendar not configured on server' });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: user.googleCalendar.refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: thirtyDaysLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = response.data.items || [];
    let created = 0;

    for (const event of events) {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      if (!start || !event.summary) continue;

      const startDate = new Date(start);
      const endDate = new Date(end || start);

      const startTime = event.start?.dateTime
        ? startDate.toTimeString().slice(0, 5)
        : '00:00';
      const endTime = event.end?.dateTime
        ? endDate.toTimeString().slice(0, 5)
        : '23:59';

      const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Avoid duplicates by checking same date + name + ownerId
      const existing = await Schedule.findOne({
        ownerId: userId,
        name: event.summary,
        date: startDate,
      }).lean();

      if (!existing) {
        await Schedule.create({
          name: event.summary,
          description: event.description || (event.location ? `📍 ${event.location}` : '') || '',
          date: startDate,
          day: dayName,
          startTime,
          endTime,
          room: event.location || 'Google Calendar',
          location: event.location || '',
          type: 'Meeting',
          visibility: 'personal',
          ownerId: userId,
          color: '#4285F4',
          status: 'planned',
          isGoogleEvent: true,
        });
        created++;
      }
    }

    await User.findByIdAndUpdate(userId, { 'googleCalendar.lastSyncAt': new Date() });

    res.json({
      success: true,
      message: `Sync complete. ${created} new event${created !== 1 ? 's' : ''} imported.`,
      data: { imported: created, total: events.length }
    });
  } catch (err) {
    console.error('Google Calendar sync error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ──────────────────────────────────────────────
   DELETE /api/google-calendar/disconnect?userId=...
   Removes Google Calendar connection
────────────────────────────────────────────── */
export const disconnect = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    await User.findByIdAndUpdate(userId, {
      'googleCalendar.connected': false,
      'googleCalendar.refreshToken': null,
    });

    res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
