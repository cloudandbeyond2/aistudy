import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
    Mic, MicOff, Volume2, VolumeX, 
    Send, Brain, X, MessageSquare, 
    Zap, Sparkles, User, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Web Speech API types for TypeScript
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}
interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    transcript: string;
}

const AiMockRoom = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const driveId = searchParams.get('drive');
    const userId = sessionStorage.getItem('uid');

    const [session, setSession] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        startSession();
        setupSpeech();
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const startSession = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/mock-interview/session`, { driveId }, {
                headers: { 'user-id': userId }
            });
            if (res.data.success) {
                setSession(res.data.data);
                // Trigger arrival greeting
                handleSendMessage('', true, res.data.data._id);
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to start session", variant: "destructive" });
            navigate('/dashboard/interview-training');
        }
    };

    const setupSpeech = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                handleSendMessage(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
                toast({ title: "Mic Error", description: "Could not hear you. Try typing.", variant: "destructive" });
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast({ title: "Not Supported", description: "Speech recognition not supported in this browser." });
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const speak = (text: string) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleSendMessage = async (msg?: string, isArrival = false, sessId?: string) => {
        const messageToSend = msg || inputValue;
        if (!messageToSend && !isArrival) return;

        if (!isArrival) {
            setMessages(prev => [...prev, { role: 'user', message: messageToSend }]);
            setInputValue('');
        }

        setIsThinking(true);
        try {
            const res = await axios.post(`${serverURL}/api/mock-interview/chat`, {
                applicationId: sessId || session?._id,
                message: messageToSend,
                isArrival
            });

            if (res.data.success) {
                const aiMsg = res.data.aiResponse;
                setMessages(prev => [...prev, { role: 'ai', message: aiMsg }]);
                speak(aiMsg);

                // Check if session wrapped up (Gemini prompt includes a trigger phrase)
                if (aiMsg.toLowerCase().includes("performance blueprint")) {
                    setTimeout(() => finalizeSession(sessId || session?._id), 3000);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsThinking(false);
        }
    };

    const finalizeSession = async (id: string) => {
        try {
            const res = await axios.post(`${serverURL}/api/mock-interview/finalize`, { applicationId: id });
            if (res.data.success) {
                navigate(`/dashboard/mock-report/${id}`);
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to generate report" });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#050810] flex flex-col font-sans selection:bg-primary/30">
            {/* High-End Tech Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            {/* Premium Header */}
            <header className="relative z-10 h-20 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                        <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold tracking-tight">AI Interview Room</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Live Session</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-full" onClick={() => navigate('/dashboard/interview-training')}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Chat Arena */}
            <main className="relative z-10 flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full pt-8 px-4">
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-8 pb-32 thin-scrollbar p-4"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-800 border-white/10' 
                                            : 'bg-primary/20 border-primary/30'
                                    }`}>
                                        {msg.role === 'user' ? <User className="w-5 h-5 text-slate-300" /> : <Brain className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className={`p-4 rounded-3xl ${
                                        msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-tr-none' 
                                            : 'bg-white/5 text-slate-100 border border-white/10 backdrop-blur-md rounded-tl-none'
                                    }`}>
                                        <p className="text-[15px] leading-relaxed tracking-tight">{msg.message}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isThinking && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                             <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse">
                                    <Brain className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                </div>
                             </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Bottom Controls */}
            <div className="relative z-20 pb-10 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Visualizer simulated */}
                    <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
                        {(isSpeaking || isListening) ? Array.from({length: 12}).map((_, i) => (
                            <motion.div 
                                key={i}
                                animate={{ height: [4, Math.random() * 24 + 10, 4] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                className="w-1 bg-primary rounded-full"
                            />
                        )) : (
                            <div className="h-1 w-24 bg-white/10 rounded-full" />
                        )}
                    </div>

                    <div className="relative flex items-center gap-4 bg-white/5 border border-white/10 p-2 pl-6 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-slate-500 py-3 text-lg"
                            placeholder={isListening ? "Listening..." : "Type your answer here..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isThinking}
                        />
                        
                        <div className="flex items-center gap-2">
                             <Button 
                                onClick={toggleListening}
                                className={`w-14 h-14 rounded-full transition-all duration-300 ${
                                    isListening 
                                        ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                                disabled={isThinking || isSpeaking}
                            >
                                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </Button>
                            <Button 
                                size="icon"
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue || isThinking}
                                className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                            >
                                <Send className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center mt-6 gap-8">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" /> Secure Session
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" /> High Precision AI
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiMockRoom;
