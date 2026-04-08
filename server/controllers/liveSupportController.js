import LiveSupportSession from '../models/LiveSupportSession.js';
import LiveSupportMessage from '../models/LiveSupportMessage.js';

export const getOrCreateSession = async (req, res) => {
  try {
    const { studentId, organizationId } = req.body;
    let session = await LiveSupportSession.findOne({ student: studentId, status: 'Active' });

    if (!session) {
      session = await LiveSupportSession.create({
        student: studentId,
        organization: organizationId || null
      });
    }

    res.status(200).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await LiveSupportMessage.find({ session: sessionId }).populate('sender', 'mName email role').sort('createdAt');
    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const { organizationId } = req.params;
    // Admins want to see active sessions. 
    // If super admin, organizationId might be empty.
    const query = { status: 'Active' };
    if (organizationId && organizationId !== 'undefined' && organizationId !== 'null') {
      query.organization = organizationId;
    }
    const sessions = await LiveSupportSession.find(query).populate('student', 'mName email role').sort('-updatedAt');
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
