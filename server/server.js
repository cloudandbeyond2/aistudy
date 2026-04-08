import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import setupSocket from './socket.js';

const PORT = process.env.PORT || 5001;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
