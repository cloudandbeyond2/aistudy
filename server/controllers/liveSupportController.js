import LiveSupportSession from '../models/LiveSupportSession.js';
import LiveSupportMessage from '../models/LiveSupportMessage.js';
import User from '../models/User.js';

export const getOrCreateSession = async (req, res) => {
  try {
    const { studentId, organizationId, departmentId } = req.body;
    const student = await User.findById(studentId).select('department role organization organizationId orgId').lean();
    const resolvedDepartmentId =
      departmentId ||
      student?.department ||
      null;
    const sessionQuery = { student: studentId, status: 'Active' };

    if (resolvedDepartmentId) {
      sessionQuery.department = resolvedDepartmentId;
    }

    let session = await LiveSupportSession.findOne(sessionQuery);

    if (!session) {
      session = await LiveSupportSession.create({
        student: studentId,
        organization: organizationId || null,
        department: resolvedDepartmentId
      });
    } else if (!session.department && resolvedDepartmentId) {
      session.department = resolvedDepartmentId;
      await session.save();
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
    const { organizationId, departmentId } = req.params;
    const query = { status: 'Active' };
    const sessions = await LiveSupportSession.find(query)
      .populate('student', 'mName email role department')
      .sort('-updatedAt');

    const normalizedDepartmentId =
      departmentId && departmentId !== 'undefined' && departmentId !== 'null'
        ? String(departmentId)
        : '';

    const filteredSessions = normalizedDepartmentId
      ? sessions.filter((session) => {
          const sessionDepartment = session.department ? String(session.department) : '';
          const studentDepartment = session.student?.department ? String(session.student.department) : '';
          return sessionDepartment === normalizedDepartmentId || studentDepartment === normalizedDepartmentId;
        })
      : organizationId && organizationId !== 'undefined' && organizationId !== 'null'
        ? sessions.filter((session) => String(session.organization || '') === String(organizationId))
        : sessions;

    res.status(200).json({ success: true, sessions: filteredSessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
