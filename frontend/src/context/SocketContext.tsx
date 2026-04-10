import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { serverURL } from '../constants';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // useEffect(() => {
  //   // Determine backend URL, fallback to window.location.origin
  //   const backendUrl = serverURL.replace('/api', '');
    
  //   const socketInstance = io(backendUrl, {
  //     transports: ['websocket', 'polling'],
  //   });

  //   setSocket(socketInstance);

  //   socketInstance.on('connect', () => {
  //     setIsConnected(true);
  //   });

  //   socketInstance.on('disconnect', () => {
  //     setIsConnected(false);
  //   });

  //   return () => {
  //     socketInstance.disconnect();
  //   };
  // }, []);


  useEffect(() => {
  const backendUrl = new URL(serverURL).origin;

  const socketInstance = io(backendUrl, {
    transports: ['websocket'],
  });

  setSocket(socketInstance);

  socketInstance.on('connect', () => {
    // console.log("Connected:", socketInstance.id);
    setIsConnected(true);
  });

  socketInstance.on('disconnect', () => {
    setIsConnected(false);
  });

  return () => {
    socketInstance.disconnect();
  };
}, []);
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
