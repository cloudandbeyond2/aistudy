import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, PhoneCall, Phone, PhoneOff, MicOff, Mic, User } from 'lucide-react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../hooks/useWebRTC';

interface Session {
  _id: string;
  student: { _id: string; name?: string; mName?: string; email?: string; role?: string };
  status: string;
}

interface Message {
  _id: string;
  session: string;
  sender: string | any;
  senderModel: string;
  message: string;
  createdAt: string;
}

const LiveSupportTab = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  
  const orgId = sessionStorage.getItem('orgId');
  const deptId = sessionStorage.getItem('deptId');
  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('uid') || sessionStorage.getItem('userId');
  const role = sessionStorage.getItem('role');
  
  const { socket, isConnected } = useSocket();
  const { startCall, answerCall, endCall, isCalling, incomingCall, remoteStream, localStream } = useWebRTC(selectedSession?._id || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (role !== 'dept_admin' || !userId) return undefined;

    const markLiveSupportRead = async () => {
      try {
        await axios.post(`${serverURL}/api/notifications/read-by-link`, {
          userId,
          link: '/dashboard/dept-live-support'
        });
        window.dispatchEvent(new CustomEvent('live-support-read'));
      } catch (error) {
        console.error('Failed to mark live support notifications as read:', error);
      }
    };

    void markLiveSupportRead();
  }, [role, userId]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const url = deptId
          ? `/api/live-support/sessions/active/department/${deptId}`
          : orgId
            ? `/api/live-support/sessions/active/${orgId}`
            : `/api/live-support/sessions/active`;
        const res = await axios.get(`${serverURL}${url}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setSessions(res.data.sessions);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };
    
    fetchSessions(); // initially
    const interval = setInterval(fetchSessions, 10000); // refresh active sessions
    return () => clearInterval(interval);
  }, [deptId, orgId, token]);

  useEffect(() => {
    if (!selectedSession || !socket) return;
    
    const sid = selectedSession._id;
    socket.emit('join-support-ticket', sid);
    
    // fetch history
    axios.get(`${serverURL}/api/live-support/session/${sid}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    });

    const handleReceive = (data: Message) => {
      if (data.session === sid) {
        setMessages(prev => [...prev, data]);
      }
    };
    
    socket.on('receive-support-message', handleReceive);
    return () => {
      socket.off('receive-support-message', handleReceive);
    };
  }, [selectedSession, socket, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !socket || !selectedSession || !userId) return;

    socket.emit('send-support-message', {
      sessionId: selectedSession._id,
      senderId: userId,
      senderModel: 'User',
      message: inputVal
    });

    setInputVal('');
  };

  if (role !== 'dept_admin') {
    return (
      <div className="p-4 sm:p-6 text-muted-foreground">
        Live Support is available to department admins only.
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 h-full">
        {/* Sessions List */}
        <Card className="w-full xl:w-[360px] xl:max-w-[360px] flex flex-col bg-card shadow-lg border overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageCircle className="w-5 h-5 text-primary" /> Active Live Support
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[32vh] sm:max-h-[36vh] xl:max-h-none">
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 sm:py-10 text-sm sm:text-base">
                No active student support sessions.
              </p>
            ) : (
              sessions.map(s => (
                <div
                  key={s._id}
                  onClick={() => setSelectedSession(s)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedSession?._id === s._id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium leading-5 truncate text-sm sm:text-base">
                        {s.student?.mName || s.student?.name || 'Unknown Student'}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                        {s.student?.email || 'No email available'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="w-full flex-1 min-h-[60vh] xl:min-h-0 flex flex-col bg-card border shadow-lg overflow-hidden relative">
          {selectedSession ? (
          <>
              <div className="p-3 sm:p-4 border-b bg-muted/30 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                    {selectedSession.student?.mName || selectedSession.student?.name || 'Student'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                    {selectedSession.student?.email || 'No email available'}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span> Active Session
                  </p>
                </div>
                <div className="flex items-center justify-start sm:justify-end">
                  {!isCalling && (
                    <Button variant="outline" size="sm" onClick={startCall} className="w-full sm:w-auto">
                      <PhoneCall className="w-4 h-4 mr-2"/> Call
                    </Button>
                  )}
                </div>
              </div>

            {/* Call Action Bar */}
            {incomingCall && !isCalling && (
              <div className="bg-amber-500 text-white p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm shadow-inner relative z-10">
                <span className="flex items-center gap-2"><Phone className="animate-pulse w-4 h-4"/> Incoming Call...</span>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8 w-full sm:w-auto" onClick={answerCall}>Answer</Button>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 h-8 w-full sm:w-auto" onClick={() => endCall(true)}>Decline</Button>
                </div>
              </div>
            )}

            {isCalling && !incomingCall && (
              <div className="bg-emerald-600 text-white p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm shadow-inner relative z-10">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4"/> Call Active with {selectedSession.student?.name}</span>
                <div className="flex gap-2 self-start sm:self-auto">
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white" onClick={() => {
                    if (localStream) {
                      localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
                    }
                  }}>
                    <MicOff className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white" onClick={() => endCall(true)}>
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <audio ref={audioRef} autoPlay className="hidden" />

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 bg-muted/10 relative z-0">
              {messages.length === 0 && (
                <div className="flex h-full min-h-[220px] items-center justify-center">
                  <p className="text-muted-foreground text-sm text-center px-6">
                    No messages yet. Send a response to the student.
                  </p>
                </div>
              )}
              {messages.map(msg => {
                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                const isAdmin = String(senderId) === String(userId);
                return (
                  <div key={msg._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    {/* Timestamp and Sender name can be added here if needed */}
                    <div className={`max-w-[86%] sm:max-w-[75%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm text-sm sm:text-[15px] break-words ${isAdmin ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border text-foreground rounded-bl-sm'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 sm:p-4 border-t bg-background flex flex-col sm:flex-row gap-3">
              <Input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={isConnected ? "Reply to student..." : "Socket connecting..."}
                disabled={!isConnected}
                className="flex-1 border-muted-foreground/30 focus-visible:ring-primary h-11 sm:h-12 rounded-xl px-4"
              />
              <Button type="submit" disabled={!isConnected || !inputVal.trim()} className="h-11 sm:h-12 w-full sm:w-12 rounded-xl shrink-0 p-0 shadow-md">
                <Send className="w-5 h-5 mx-auto" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col h-full min-h-[320px] items-center justify-center text-muted-foreground space-y-4 p-6 text-center">
            <MessageCircle className="w-14 h-14 sm:w-16 sm:h-16 opacity-20" />
            <p className="text-base sm:text-lg">Select a student session to start chatting.</p>
          </div>
        )}
        </Card>
      </div>
    </div>
  );
};

export default LiveSupportTab;
