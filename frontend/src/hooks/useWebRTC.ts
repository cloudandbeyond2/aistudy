import { useState, useRef, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export const useWebRTC = (sessionId: string | null) => {
  const { socket, isConnected } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ signal: any, from: string } | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleIncomingCall = (data: { signal: any, from: string }) => {
      // console.log('Incoming call...', data);
      setIsCalling(true);
      setIncomingCall({ signal: data.signal, from: data.from });
    };

    const handleCallAnswered = async (data: { signal: any, from: string }) => {
      // console.log('Call answered...', data);
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal));
      }
    };

    const handleIceCandidate = async (data: { candidate: any, from: string }) => {
      if (peerConnection.current && data.candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ice candidate", err);
        }
      }
    };

    const handleCallEnded = () => {
      endCall(false);
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answered', handleCallAnswered);
    socket.on('receive-ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-answered', handleCallAnswered);
      socket.off('receive-ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, sessionId]);

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get media stream', err);
      return null;
    }
  };

  const createPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && sessionId) {
        socket.emit('new-ice-candidate', {
          sessionId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async () => {
    if (!sessionId || !socket) return;
    setIsCalling(true);
    
    const stream = localStream || await initLocalStream();
    if (!stream) return;

    const pc = createPeerConnection(stream);
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('call-user', {
      sessionId,
      offer
    });
  };

  const answerCall = async () => {
    if (!sessionId || !socket || !incomingCall) return;
    
    const stream = localStream || await initLocalStream();
    if (!stream) return;

    const pc = createPeerConnection(stream);
    
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('answer-call', {
      sessionId,
      answer
    });
    
    setIncomingCall(null);
  };

  const endCall = (emitEvent = true) => {
    if (emitEvent && socket && sessionId) {
      socket.emit('end-call', { sessionId });
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setIsCalling(false);
    setIncomingCall(null);
  };

  return {
    localStream,
    remoteStream,
    isCalling,
    incomingCall,
    startCall,
    answerCall,
    endCall
  };
};
