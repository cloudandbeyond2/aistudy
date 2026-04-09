import LiveSupportMessage from './models/LiveSupportMessage.js';
import LiveSupportSession from './models/LiveSupportSession.js';
import Notification from './models/Notification.js';
import User from './models/User.js';

export default function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // --- SUPPORT CHAT ---
    
    socket.on('join-support-ticket', (sessionId) => {
      socket.join(sessionId);
      console.log(`User joined live support session room: ${sessionId}`);
    });

    socket.on('send-support-message', async (data) => {
      try {
        const { sessionId, senderId, senderModel, message } = data;
        
        const newMessage = await LiveSupportMessage.create({
          session: sessionId,
          sender: senderId,
          senderModel,
          message
        });

        try {
          const session = await LiveSupportSession.findById(sessionId).select('student organization department').lean();
          const sender = await User.findById(senderId).select('role department').lean();

          if (session) {
            const resolvedDepartmentId = session.department || sender?.department || null;

            if (!session.department && resolvedDepartmentId) {
              await LiveSupportSession.findByIdAndUpdate(sessionId, {
                department: resolvedDepartmentId
              });
            }

            if (sender?.role === 'dept_admin') {
              await Notification.create({
                user: session.student,
                message: 'Your department replied to your live support message.',
                type: 'info',
                link: '/dashboard/student'
              });
            }

            if (sender?.role === 'student') {
              const deptAdmins = resolvedDepartmentId
                ? await User.find({
                    role: 'dept_admin',
                    department: resolvedDepartmentId
                  }).select('_id').lean()
                : [];

              await Promise.all(
                deptAdmins.map((admin) =>
                  Notification.create({
                    user: admin._id,
                    message: 'A student replied to a department support conversation.',
                    type: 'info',
                    link: '/dashboard/dept-live-support'
                  })
                )
              );

              io.emit('live-support-notification', {
                sessionId,
                departmentId: resolvedDepartmentId,
                message: newMessage.message
              });
            }
          }
        } catch (notificationErr) {
          console.error('Live support notification error:', notificationErr);
        }
        
        io.to(sessionId).emit('receive-support-message', {
          _id: newMessage._id,
          session: sessionId,
          sender: senderId,
          senderModel,
          message: newMessage.message,
          createdAt: newMessage.createdAt
        });
      } catch (err) {
        console.error('Error sending support message:', err);
      }
    });

    // --- WebRTC VOICE COMMUNICATION SIGNALING ---
    socket.on('call-user', (data) => {
      socket.to(data.sessionId).emit('incoming-call', {
        signal: data.offer,
        from: socket.id
      });
    });

    socket.on('answer-call', (data) => {
      socket.to(data.sessionId).emit('call-answered', {
        signal: data.answer,
        from: socket.id
      });
    });

    socket.on('new-ice-candidate', (data) => {
      socket.to(data.sessionId).emit('receive-ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });

    socket.on('end-call', (data) => {
      socket.to(data.sessionId).emit('call-ended', { from: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
