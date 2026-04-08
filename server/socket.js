import LiveSupportMessage from './models/LiveSupportMessage.js';

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
