import Schedule from "../models/Schedule.js";
import Meeting from "../models/Meeting.js";
import User from "../models/User.js";

const getDayName = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

/* CREATE */
export const createSchedule = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.date && !payload.day) {
      payload.day = getDayName(payload.date) || payload.day;
    }

    if (!payload.visibility) {
      payload.visibility = payload.ownerId ? "personal" : "organization";
    }

    const schedule = new Schedule(payload);
    await schedule.save();

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* GET ALL */
export const getSchedules = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    let schedules = await Schedule.find({ ownerId }).sort({ date: 1, startTime: 1, createdAt: -1 }).lean();

    // Strict privacy enforcement for Google Sync events
    schedules = schedules.filter(s => {
      if (s.isGoogleEvent) {
        return String(s.ownerId) === String(ownerId);
      }
      return true;
    });

    const user = await User.findById(ownerId).select('role organization organizationId department studentDetails.department').lean();

    let meetingSchedules = [];

    if (user) {
      const role = user.role || 'user';
      const resolvedOrganizationId = String(user.organization || user.organizationId || '');
      const resolvedDepartmentId = String(user.department || user.studentDetails?.department || '');

      if (resolvedOrganizationId && ['org_admin', 'dept_admin', 'student'].includes(role)) {
        const meetingQuery = { organizationId: resolvedOrganizationId };

        if (role === 'dept_admin' || role === 'student') {
          meetingQuery.$or = [
            { department: resolvedDepartmentId },
            { department: 'all' },
            { department: '' },
            { department: null },
            { department: { $exists: false } }
          ];
        }

        const meetings = await Meeting.find(meetingQuery).sort({ date: 1, time: 1, createdAt: -1 }).lean();
        meetingSchedules = meetings.map((meeting) => ({
          _id: `meeting-${meeting._id}`,
          linkedMeetingId: String(meeting._id),
          date: meeting.date,
          day: getDayName(meeting.date) || '',
          name: meeting.title,
          description: `${meeting.platform || 'meeting'} session${meeting.link ? ` - ${meeting.link}` : ''}`,
          startTime: meeting.time,
          endTime: meeting.time,
          room: meeting.platform || 'Meeting',
          location: meeting.link || '',
          type: 'Meeting',
          visibility: 'organization',
          organizationId: resolvedOrganizationId,
          ownerId: String(ownerId),
          ownerRole: role,
          color: '#11a5e4',
          status: 'planned',
          sourceType: 'meeting',
          readOnly: true,
          department: meeting.department || 'all'
        }));
      }
    }

    const mergedSchedules = [...schedules, ...meetingSchedules].sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();
      if (aDate !== bDate) return aDate - bDate;
      const timeCompare = String(a.startTime || '').localeCompare(String(b.startTime || ''));
      if (timeCompare !== 0) return timeCompare;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    res.json({
      success: true,
      data: mergedSchedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* UPDATE */
export const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* DELETE */
export const deleteSchedule = async (req, res) => {
  try {

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Schedule deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
