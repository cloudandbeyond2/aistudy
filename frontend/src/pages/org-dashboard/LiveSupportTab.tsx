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
  student: { _id: string; name: string; email: string };
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
  const token = sessionStorage.getItem('token');
  const userId = sessionStorage.getItem('uid') || sessionStorage.getItem('userId');
  
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
    if (sessionStorage.getItem('role') !== 'org_admin' || !userId) return undefined;

    const markLiveSupportRead = async () => {
      try {
        await axios.post(`${serverURL}/api/notifications/read-by-link`, {
          userId,
          link: '/dashboard/org-live-support'
        });
        window.dispatchEvent(new CustomEvent('live-support-read'));
      } catch (error) {
        console.error('Failed to mark live support notifications as read:', error);
      }
    };

    void markLiveSupportRead();
  }, [userId]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const url = orgId ? `/api/live-support/sessions/active/${orgId}` : `/api/live-support/sessions/active`;
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
  }, [orgId, token]);

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
      senderModel: 'Organization',
      message: inputVal
    });

    setInputVal('');
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex gap-6">
      {/* Sessions List */}
      <Card className="w-1/3 flex flex-col h-full bg-card shadow-lg border">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" /> Active Live Support
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No active student support sessions.</p>
          ) : (
            sessions.map(s => (
              <div 
                key={s._id} 
                onClick={() => setSelectedSession(s)}
                className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedSession?._id === s._id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4 text-primary" />
                  {s.student?.name || 'Unknown Student'}
                </div>
                <div className="text-sm text-muted-foreground mt-1 px-6">
                  {s.student?.email}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="w-2/3 flex flex-col h-full bg-card border shadow-lg overflow-hidden relative">
        {selectedSession ? (
          <>
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">{selectedSession.student?.name}</h3>
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Active Session
                </p>
              </div>
              <div>
                {!isCalling && (
                  <Button variant="outline" size="sm" onClick={startCall}>
                    <PhoneCall className="w-4 h-4 mr-2"/> Call
                  </Button>
                )}
              </div>
            </div>

            {/* Call Action Bar */}
            {incomingCall && !isCalling && (
              <div className="bg-amber-500 text-white p-3 flex justify-between items-center text-sm shadow-inner relative z-10">
                <span className="flex items-center gap-2"><Phone className="animate-pulse w-4 h-4"/> Incoming Call...</span>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8" onClick={answerCall}>Answer</Button>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 h-8" onClick={() => endCall(true)}>Decline</Button>
                </div>
              </div>
            )}

            {isCalling && !incomingCall && (
              <div className="bg-emerald-600 text-white p-3 flex justify-between items-center text-sm shadow-inner relative z-10">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4"/> Call Active with {selectedSession.student?.name}</span>
                <div className="flex gap-2">
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

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10 relative z-0">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground text-sm">No messages yet. Send a response to the student.</p>
                </div>
              )}
              {messages.map(msg => {
                const isAdmin = msg.senderModel === 'Organization';
                return (
                  <div key={msg._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    {/* Timestamp and Sender name can be added here if needed */}
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-[15px] ${isAdmin ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-background border text-foreground rounded-bl-sm'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t bg-background flex gap-3">
              <Input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={isConnected ? "Reply to student..." : "Socket connecting..."}
                disabled={!isConnected}
                className="flex-1 border-muted-foreground/30 focus-visible:ring-primary h-12 rounded-xl px-4"
              />
              <Button type="submit" disabled={!isConnected || !inputVal.trim()} className="h-12 w-12 rounded-xl shrink-0 p-0 shadow-md">
                <Send className="w-5 h-5 mx-auto" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-muted-foreground space-y-4">
            <MessageCircle className="w-16 h-16 opacity-20" />
            <p className="text-lg">Select a student session to start chatting.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LiveSupportTab;
