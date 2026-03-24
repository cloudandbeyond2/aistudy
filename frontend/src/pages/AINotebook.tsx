import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
    FileText, Upload, Link as LinkIcon, MessageSquare, BookOpen, BrainCircuit, Sparkles, Send, Plus,
    Trash2, FileType, CheckCircle2, ChevronRight, RefreshCw, Lightbulb, Type, Video, Headphones, 
    Target, Layers, Loader2, Mic, Star, Zap, Compass, Globe, Database, Cloud, Bot, 
    CircleDot, GraduationCap, NotebookPen, PanelRightClose, PanelRightOpen, Waves, Menu, X
} from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { serverURL } from '@/constants';
import showdown from 'showdown';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    strikethrough: true,
    ghCodeBlocks: true,
    simplifiedAutoLink: true
});

interface Source {
    id: string;
    title: string;
    type: 'pdf' | 'url' | 'text';
    content: string;
    words: number;
    selected: boolean;
    uploadedAt?: Date;
}

interface ChatMessage {
    role: 'user' | 'system';
    content: string;
    timestamp?: Date;
}

const INITIAL_SOURCES: Source[] = [];

const SUGGESTED_QUESTIONS = [
    "What are the key insights from my sources?",
    "Create a summary table of main concepts",
    "Generate practice questions for review",
    "Connect ideas across different documents"
];

const QUICK_ACTIONS = [
    { title: 'Study Guide', desc: 'Structured learning path', icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500' },
    { title: 'Smart Summary', desc: 'AI-powered synthesis', icon: Zap, gradient: 'from-amber-500 to-orange-500' },
    { title: 'Concept Map', desc: 'Visual connections', icon: Compass, gradient: 'from-purple-500 to-pink-500' },
    { title: 'Q&A Bank', desc: 'Test your knowledge', icon: MessageSquare, gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Flashcards', desc: 'Active recall', icon: Layers, gradient: 'from-rose-500 to-red-500' },
    { title: 'Briefing Doc', desc: 'Executive overview', icon: FileText, gradient: 'from-indigo-500 to-blue-500' },
];

const AINotebook: React.FC = () => {
    useBranding();
    
    // State Management
    const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'system', content: '✨ Hi! I\'m your Colossus IQ Assistant. I\'ve analyzed your knowledge base and I\'m ready to help you learn smarter. What would you like to explore today?', timestamp: new Date() }
    ]);
    const [currentInput, setCurrentInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [notes, setNotes] = useState('');
    const [activeTab, setActiveTab] = useState('guide');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingSources, setIsLoadingSources] = useState(false);
    const [selectedSourceCount, setSelectedSourceCount] = useState(0);
    
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    
    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
    const isSmallDesktop = useMediaQuery('(min-width: 1025px) and (max-width: 1440px)');
    const isDesktop = useMediaQuery('(min-width: 1441px)');

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Update selected sources count
    useEffect(() => {
        setSelectedSourceCount(sources.filter(s => s.selected).length);
    }, [sources]);

    // Close mobile sources panel on route change
    useEffect(() => {
        setIsMobileSourcesOpen(false);
    }, [activeTab]);

    // Access check
    useEffect(() => {
        const checkAccess = async () => {
            const userType = sessionStorage.getItem('type');
            const userRole = sessionStorage.getItem('role');

            try {
                const res = await axios.get(`${serverURL}/api/settings`);
                if (res.data && res.data.notebookEnabled) {
                    const enabledSettings = res.data.notebookEnabled;
                    let isEnabled = false;

                    if (userRole === 'org_admin') isEnabled = enabledSettings.org_admin;
                    else if (userRole === 'student') isEnabled = enabledSettings.student;
                    else isEnabled = enabledSettings[userType || ''] || false;

                    if (!isEnabled) {
                        if (!['monthly', 'yearly', 'forever'].includes(userType || '')) {
                            navigate('/dashboard/pricing');
                            return;
                        }
                        navigate('/dashboard');
                    }
                }
            } catch (error) {
                console.error('Error checking notebook access:', error);
            }
        };

        checkAccess();
    }, [navigate]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoadingSources(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${serverURL}/api/notebook/upload-source`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSources(prev => [...prev, { ...res.data.source, selected: false }]);
                setTimeout(() => {
                    toggleSourceSelection(res.data.source.id);
                }, 100);
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsLoadingSources(false);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleSourceSelection = (id: string) => {
        setSources(prev => prev.map(s => 
            s.id === id ? { ...s, selected: !s.selected } : s
        ));
    };

    const handleSendMessage = async () => {
        if (!currentInput.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: currentInput, timestamp: new Date() };
        const newMessages = [...chatMessages, userMessage];
        setChatMessages(newMessages);
        setCurrentInput('');
        setIsGenerating(true);

        const selectedContext = sources
            .filter(s => s.selected)
            .map(s => s.content)
            .join('\n\n');

        try {
            const res = await axios.post(`${serverURL}/api/notebook/chat`, {
                messages: newMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
                context: selectedContext
            });

            if (res.data.success) {
                setChatMessages(prev => [...prev, { 
                    role: 'system', 
                    content: res.data.generatedText,
                    timestamp: new Date()
                }]);
            }
        } catch (error: any) {
            console.error('Chat error', error);
            const errMsg = error?.response?.data?.message || 'I encountered an issue. Please try again.';
            setChatMessages(prev => [...prev, { role: 'system', content: errMsg, timestamp: new Date() }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAction = async (actionDesc: string) => {
        if (sources.filter(s => s.selected).length === 0) {
            setChatMessages(prev => [...prev, { 
                role: 'system', 
                content: '⚠️ Please select at least one source first to generate content.',
                timestamp: new Date()
            }]);
            setIsChatOpen(true);
            return;
        }

        setIsGenerating(true);
        setActiveTab('notes');

        const selectedContext = sources
            .filter(s => s.selected)
            .map(s => s.content)
            .join('\n\n');

        try {
            const res = await axios.post(`${serverURL}/api/notebook/generate-action`, {
                action: actionDesc,
                context: selectedContext
            });

            if (res.data.success) {
                const timestamp = new Date().toLocaleString();
                const newNoteContent = `\n\n---\n## 📝 ${actionDesc} • ${timestamp}\n\n${res.data.generatedText}\n`;
                setNotes(prev => prev + newNoteContent);
                setIsEditMode(false);
            }
        } catch (error) {
            console.error('Action error', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileType className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />;
            case 'url': return <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />;
            default: return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />;
        }
    };

    // Sources Panel Component (Reused for both desktop and mobile)
    const SourcesPanel = () => (
        <Card className="h-full border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            
            <CardHeader className="relative px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent text-sm sm:text-base">
                                Knowledge Base
                            </span>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                            {selectedSourceCount} source{selectedSourceCount !== 1 ? 's' : ''} selected
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-2 sm:px-3 py-0.5 sm:py-1 text-xs">
                            {sources.length} total
                        </Badge>
                        {/* Show X button on mobile, tablet, and small desktop when sources panel is in overlay mode */}
                        {(isMobile || isTablet || (isSmallDesktop && isMobileSourcesOpen)) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileSourcesOpen(false)}
                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                {/* <X className="w-4 h-4 sm:w-5 sm:h-5" /> */}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <div className="p-3 sm:p-5">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        accept=".pdf,.txt,.md"
                    />
                    <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoadingSources}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg rounded-xl sm:rounded-2xl py-4 sm:py-6 text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] active:scale-98"
                    >
                        {isLoadingSources ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        )}
                        Upload Document
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3 sm:px-5 pb-3 sm:pb-5">
                    <div className="space-y-2 sm:space-y-3">
                        {sources.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-12 sm:py-16 text-center"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                    <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Your knowledge base is empty</p>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] sm:max-w-[200px] mx-auto">
                                    Upload PDFs or documents to start your AI-powered learning journey
                                </p>
                            </motion.div>
                        ) : (
                            sources.map((source, index) => (
                                <motion.div
                                    key={source.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => toggleSourceSelection(source.id)}
                                    className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden ${
                                        source.selected
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-2 border-indigo-300 dark:border-indigo-600 shadow-lg'
                                            : 'bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="mt-0.5">
                                            {source.selected ? (
                                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                                                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                                <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-slate-700/50">
                                                    {getSourceIcon(source.type)}
                                                </div>
                                                <p className="font-semibold text-xs sm:text-sm truncate">{source.title}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                                <Type className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                <span>{source.words.toLocaleString()} words</span>
                                                {source.type === 'pdf' && (
                                                    <>
                                                        <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                                                        <FileType className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                        <span>PDF</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-all h-6 w-6 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSources(prev => prev.filter(s => s.id !== source.id));
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                    </div>
                                    {source.selected && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );

    // Chat Panel Component
    const ChatPanel = () => (
        <Card className="h-full border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            
            <CardHeader className="relative px-4 sm:px-6 py-3 sm:py-5 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-sm sm:text-lg font-bold">Colossus IQ</CardTitle>
                            <CardDescription className="text-[10px] sm:text-xs">AI Learning Assistant</CardDescription>
                        </div>
                    </div>
                    {/* Always show X button when chat is in overlay mode (mobile, tablet, and small desktop) */}
                    {(isMobile || isTablet || isSmallDesktop) && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsChatOpen(false)}
                            className="rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 sm:h-9 sm:w-9"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-3 sm:p-6" ref={chatScrollRef}>
                <div className="space-y-3 sm:space-y-4">
                    {chatMessages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-md ${
                                msg.role === 'user'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
                                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                            }`}>
                                {msg.role === 'system' ? (
                                    <div
                                        className="text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"
                                        dangerouslySetInnerHTML={{ __html: converter.makeHtml(msg.content) }}
                                    />
                                ) : (
                                    <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-indigo-500" />
                                <span className="text-xs sm:text-sm text-slate-500">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </ScrollArea>

            <CardFooter className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/30">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full relative">
                    <Input
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Ask anything about your sources..."
                        className="pr-10 sm:pr-12 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!currentInput.trim() || isGenerating}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
            {/* Animated Background - Hidden on mobile for performance */}
            {!isMobile && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 -right-40 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
                </div>
            )}

            <div className="relative flex flex-col lg:flex-row min-h-screen w-full gap-3 sm:gap-4 lg:gap-5 p-3 sm:p-4 lg:p-6 overflow-hidden">
                {/* Desktop Sidebar - Always visible on large desktop (1441px+) */}
                {isDesktop && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-80 xl:w-96 shrink-0"
                    >
                        <SourcesPanel />
                    </motion.div>
                )}

                {/* Small Desktop Sidebar - Toggle with button (1025px to 1440px) */}
                {isSmallDesktop && (
                    <>
                        <Button
                            onClick={() => setIsMobileSourcesOpen(!isMobileSourcesOpen)}
                            variant="outline"
                            className="fixed bottom-4 left-4 z-40 rounded-full shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur lg:hidden"
                        >
                            <Database className="w-4 h-4 mr-2" />
                            Sources ({selectedSourceCount})
                        </Button>
                        <AnimatePresence>
                            {isMobileSourcesOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -300 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -300 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed inset-y-0 left-0 z-50 w-80 shadow-2xl"
                                >
                                    <div className="h-full">
                                        <SourcesPanel />
                                    </div>
                                    <div 
                                        className="fixed inset-0 bg-black/50 -z-10"
                                        onClick={() => setIsMobileSourcesOpen(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Mobile Sources Button */}
                {isMobile && (
                    <div className="fixed bottom-4 right-4 z-40 lg:hidden">
                        <Sheet open={isMobileSourcesOpen} onOpenChange={setIsMobileSourcesOpen}>
                            <SheetTrigger asChild>
                                <Button className="rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12">
                                    <Database className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 bg-transparent border-0">
                                <div className="h-full">
                                    <SourcesPanel />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                {/* Tablet Sidebar - Toggle with button */}
                {isTablet && (
                    <>
                        <Button
                            onClick={() => setIsMobileSourcesOpen(!isMobileSourcesOpen)}
                            variant="outline"
                            className="fixed bottom-4 left-4 z-40 rounded-full shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur"
                        >
                            <Database className="w-4 h-4 mr-2" />
                            Sources ({selectedSourceCount})
                        </Button>
                        <AnimatePresence>
                            {isMobileSourcesOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -300 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -300 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed inset-y-0 left-0 z-50 w-80 shadow-2xl"
                                >
                                    <div className="h-full">
                                        <SourcesPanel />
                                    </div>
                                    <div 
                                        className="fixed inset-0 bg-black/50 -z-10"
                                        onClick={() => setIsMobileSourcesOpen(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* MAIN CONTENT AREA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={`flex-1 min-w-0 transition-all duration-300 ${
                        (isMobile || isTablet || isSmallDesktop) && isChatOpen ? 'hidden' : 'block'
                    }`}
                >
                    <Card className="h-full border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
                        <CardHeader className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/30">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                                        <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                                            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-white" />
                                        </div>
                                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-base sm:text-xl lg:text-2xl">
                                            Neural Notebook
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1">
                                        Your AI-powered learning companion • {selectedSourceCount} active source{selectedSourceCount !== 1 ? 's' : ''}
                                    </CardDescription>
                                </div>
                                
                                {/* Action Buttons - Responsive */}
                                <div className="flex items-center gap-2">
                                    {/* Show source count button on all except large desktop */}
                                    {(!isDesktop) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsMobileSourcesOpen(true)}
                                            className="rounded-xl text-xs"
                                        >
                                            <Database className="w-3.5 h-3.5 mr-1" />
                                            {selectedSourceCount}
                                        </Button>
                                    )}
                                    
                                    <Button 
                                        onClick={() => setIsChatOpen(!isChatOpen)} 
                                        variant={isChatOpen ? "default" : "outline"}
                                        size={isMobile ? "sm" : "default"}
                                        className="rounded-xl sm:rounded-2xl shadow-md transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                    >
                                        {isChatOpen ? (
                                            <><PanelRightClose className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {!isMobile && 'Hide'}</>
                                        ) : (
                                            <><MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {!isMobile && 'Chat'}</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                                <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 border-b border-slate-200/50 dark:border-slate-700/50">
                                    <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1">
                                        <TabsTrigger 
                                            value="guide" 
                                            className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm transition-all"
                                        >
                                            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Learning</span> Studio
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="notes" 
                                            className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm transition-all"
                                        >
                                            <NotebookPen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            <span className={isMobile ? 'hidden sm:inline' : 'inline'}>My</span> Notes
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <ScrollArea className="flex-1">
                                    <TabsContent value="guide" className="p-4 sm:p-6 lg:p-8 m-0">
                                        {/* Hero Section - Responsive */}
                                        <div className="mb-6 sm:mb-8 lg:mb-10 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/30 dark:border-indigo-500/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                                            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl">
                                                    <Waves className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                                                </div>
                                                <div className="flex-1 text-center sm:text-left">
                                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Generate Audio Overview</h3>
                                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                                        Transform your selected sources into an engaging podcast-style discussion.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={() => handleGenerateAction("Audio Overview")}
                                                    disabled={isGenerating || selectedSourceCount === 0}
                                                    size={isMobile ? "sm" : "default"}
                                                    className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6 text-xs sm:text-sm lg:text-base"
                                                >
                                                    {isGenerating ? (
                                                        <><Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 animate-spin" /> Generating</>
                                                    ) : (
                                                        <><Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" /> Generate</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Quick Actions Grid - Responsive columns */}
                                        <div className="mb-6 sm:mb-8 lg:mb-10">
                                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5 flex items-center gap-2">
                                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                                                AI-Powered Actions
                                            </h3>
                                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {QUICK_ACTIONS.map((action, i) => (
                                                    <motion.div
                                                        key={action.title}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        onClick={() => handleGenerateAction(action.title)}
                                                        className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group ${
                                                            (isGenerating || selectedSourceCount === 0) ? 'opacity-50 pointer-events-none' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                                                            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}>
                                                                <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                                        </div>
                                                        <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{action.title}</h4>
                                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Suggested Questions - Responsive */}
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5 flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                                                Suggested Questions
                                            </h3>
                                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                                    <motion.div
                                                        key={q}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        onClick={() => {
                                                            setCurrentInput(q);
                                                            if (!isChatOpen) setIsChatOpen(true);
                                                        }}
                                                        className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
                                                    >
                                                        <span className="text-[11px] sm:text-xs lg:text-sm">{q}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notes" className="p-0 m-0 flex flex-col h-full">
                                        <div className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                                                    <NotebookPen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                </div>
                                                <span className="font-semibold text-xs sm:text-sm">Notebook Content</span>
                                            </div>
                                            <div className="flex gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
                                                <Button
                                                    variant={!isEditMode ? "default" : "ghost"}
                                                    size="sm"
                                                    className="rounded-md sm:rounded-lg px-2 sm:px-3 lg:px-4 text-xs sm:text-sm h-7 sm:h-8"
                                                    onClick={() => setIsEditMode(false)}
                                                >
                                                    <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" /> Preview
                                                </Button>
                                                <Button
                                                    variant={isEditMode ? "default" : "ghost"}
                                                    size="sm"
                                                    className="rounded-md sm:rounded-lg px-2 sm:px-3 lg:px-4 text-xs sm:text-sm h-7 sm:h-8"
                                                    onClick={() => setIsEditMode(true)}
                                                >
                                                    <FileType className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" /> Edit
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1">
                                            {isEditMode ? (
                                                <Textarea
                                                    className="w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border-0 focus-visible:ring-0 rounded-none resize-none p-4 sm:p-6 lg:p-8 text-xs sm:text-sm lg:text-base bg-transparent font-mono leading-relaxed"
                                                    placeholder="✍️ Start writing your thoughts here. Generate AI content from the Learning Studio tab..."
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                />
                                            ) : (
                                                <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
                                                    {notes ? (
                                                        <div
                                                            className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:mb-4 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:rounded-lg sm:prose-pre:rounded-xl"
                                                            dangerouslySetInnerHTML={{ __html: converter.makeHtml(notes) }}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-16 sm:py-24 lg:py-32 text-center">
                                                            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/30 flex items-center justify-center mb-4 sm:mb-6">
                                                                <NotebookPen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-indigo-400" />
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base lg:text-lg">Your notebook is empty</p>
                                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1 sm:mt-2 max-w-xs sm:max-w-sm">
                                                                Generate study guides, summaries, or quizzes from your sources to start building your knowledge base.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Chat Panel - Responsive */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: isMobile ? 300 : (isTablet || isSmallDesktop ? 400 : 100), scale: isMobile ? 1 : 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: isMobile ? 300 : (isTablet || isSmallDesktop ? 400 : 100), scale: isMobile ? 1 : 0.95 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                            className={`
                                ${isMobile ? 'fixed inset-0 z-50' : ''}
                                ${isTablet ? 'fixed inset-y-0 right-0 w-[400px] z-40' : ''}
                                ${isSmallDesktop ? 'fixed inset-y-0 right-0 w-[420px] z-40' : ''}
                                ${isDesktop ? 'w-[420px] shrink-0 relative' : ''}
                            `}
                        >
                            <ChatPanel />
                            {(isMobile || isTablet || isSmallDesktop) && (
                                <div 
                                    className="fixed inset-0 bg-black/50 -z-10"
                                    onClick={() => setIsChatOpen(false)}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile/Tablet/Small Desktop Chat Button */}
                {!isDesktop && !isChatOpen && (
                    <Button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-4 right-4 z-40 rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AINotebook;