import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, PhoneCall, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../hooks/useWebRTC';
import { serverURL } from '../../constants';
import axios from 'axios';

interface Message {
  _id: string;
  sender: string | any;
  senderModel: string;
  message: string;
  createdAt: string;
}

const LiveSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { socket, isConnected } = useSocket();
  const { startCall, answerCall, endCall, isCalling, incomingCall, remoteStream, localStream } = useWebRTC(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const welcomeMessage: Message = {
    _id: "welcome",
    sender: "support",
    senderModel: "Organization",
    message: "Welcome to Live Support! Tell us what you need help with.",
    createdAt: new Date().toISOString(),
  };

  const ensureWelcome = (list: Message[]) => {
    if (Array.isArray(list) && list.length > 0) return list;
    return [welcomeMessage];
  };

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const currentUserId = sessionStorage.getItem('uid') || sessionStorage.getItem('userId');
  const role = sessionStorage.getItem('role');
  const token = sessionStorage.getItem('token');
  const orgId = sessionStorage.getItem('orgId');

  useEffect(() => {
    // Create/fetch a session when the widget opens (student/user).
    if (!currentUserId) return;
    if (!['student', 'user'].includes(role || '')) return;
    if (!isOpen) return;

    const initSession = async () => {
      try {
        const res = await axios.post(`${serverURL}/api/live-support/session`, {
          studentId: currentUserId,
          organizationId: orgId
        }, { headers: { Authorization: `Bearer ${token}` }});
        
        if (res.data.success) {
          const sid = res.data.session._id;
          setSessionId(sid);

          // Fetch past messages
          const msgRes = await axios.get(`${serverURL}/api/live-support/session/${sid}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (msgRes.data.success) {
            setMessages(ensureWelcome(msgRes.data.messages || []));
          }
        }
      } catch (err) {
        console.error('Failed to init live support', err);
      }
    };
    
    if (!sessionId) {
      initSession();
    }
  }, [currentUserId, role, isOpen, sessionId, orgId, token]);

  useEffect(() => {
    if (!isOpen) return;
    setMessages((prev) => ensureWelcome(prev));
  }, [isOpen]);

  useEffect(() => {
    if (!socket || !sessionId || !isOpen) return;
    socket.emit('join-support-ticket', sessionId);
  }, [socket, sessionId, isOpen]);

  useEffect(() => {
    if (!socket || !sessionId) return;
    
    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('receive-support-message', handleReceiveMessage);
    return () => {
      socket.off('receive-support-message', handleReceiveMessage);
    };
  }, [socket, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !socket || !sessionId) return;

    // Send via socket
    socket.emit('send-support-message', {
      sessionId,
      senderId: currentUserId,
      senderModel: 'User',
      message: inputVal
    });

    setInputVal('');
  };

  if (role !== 'student' && role !== 'user') return null; // Admins won't see the floating student widget

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl mb-4 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="font-semibold">Live Support</span>
            </div>
            <div className="flex items-center gap-3">
              {!isCalling && (
                <button title="Call Support" onClick={startCall} className="text-white/80 hover:text-white transition">
                  <PhoneCall size={18} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Incoming Call Banner */}
          {incomingCall && !isCalling && (
            <div className="bg-amber-500 text-white p-3 flex justify-between items-center" style={{ zIndex: 20 }}>
              <span className="flex items-center gap-2"><Phone className="animate-pulse w-4 h-4"/> Incoming Call...</span>
              <div className="flex gap-2">
                <button onClick={answerCall} className="bg-emerald-500 px-3 py-1 rounded shadow-sm text-sm font-medium hover:bg-emerald-600 transition">Answer</button>
                <button onClick={() => endCall(true)} className="bg-red-500 px-3 py-1 rounded shadow-sm text-sm font-medium hover:bg-red-600 transition">Decline</button>
              </div>
            </div>
          )}

          {/* Active Call Banner */}
          {isCalling && !incomingCall && (
            <div className="bg-emerald-600 text-white p-3 flex justify-between items-center" style={{ zIndex: 20 }}>
              <span className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4"/> Call Active</span>
              <div className="flex gap-2">
                <button onClick={() => {
                  if (localStream) {
                     localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
                  }
                }} className="bg-emerald-700 p-1.5 rounded-full hover:bg-emerald-800 transition">
                  <MicOff size={16} />
                </button>
                <button onClick={() => endCall()} className="bg-red-500 p-1.5 rounded-full hover:bg-red-600 transition">
                  <PhoneOff size={16} />
                </button>
              </div>
            </div>
          )}
          
          <audio ref={audioRef} autoPlay className="hidden" />

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg) => {
              const isMe =
                msg.senderModel === 'User' &&
                (msg.sender?._id === currentUserId || msg.sender === currentUserId);
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={!isConnected ? "Connecting..." : !sessionId ? "Starting chat..." : "Type a message..."}
              disabled={!isConnected || !sessionId}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              disabled={!isConnected || !sessionId || !inputVal.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 p-4 rounded-full shadow-lg text-white transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default LiveSupportWidget;
