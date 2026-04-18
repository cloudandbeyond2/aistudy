// // import React, { useState, useEffect, useRef } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// // import { Input } from '@/components/ui/input';
// // import { Textarea } from '@/components/ui/textarea';
// // import { ScrollArea } from '@/components/ui/scroll-area';
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// // import { Badge } from '@/components/ui/badge';
// // import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
// // import {
// //     FileText, Upload, Link as LinkIcon, MessageSquare, BookOpen, BrainCircuit, Sparkles, Send, Plus,
// //     Trash2, FileType, CheckCircle2, ChevronRight, RefreshCw, Lightbulb, Type, Video, Headphones, 
// //     Target, Layers, Loader2, Mic, Star, Zap, Compass, Globe, Database, Cloud, Bot, 
// //     CircleDot, GraduationCap, NotebookPen, PanelRightClose, PanelRightOpen, Waves, Menu, X
// // } from 'lucide-react';
// // import { useBranding } from '@/contexts/BrandingContext';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import axios from 'axios';
// // import { serverURL } from '@/constants';
// // import showdown from 'showdown';
// // import { useNavigate } from 'react-router-dom';
// // import { useMediaQuery } from '@/hooks/useMediaQuery';

// // const converter = new showdown.Converter({
// //     tables: true,
// //     tasklists: true,
// //     strikethrough: true,
// //     ghCodeBlocks: true,
// //     simplifiedAutoLink: true
// // });

// // interface Source {
// //     id: string;
// //     title: string;
// //     type: 'pdf' | 'url' | 'text';
// //     content: string;
// //     words: number;
// //     selected: boolean;
// //     uploadedAt?: Date;
// // }

// // interface ChatMessage {
// //     role: 'user' | 'system';
// //     content: string;
// //     timestamp?: Date;
// // }

// // const INITIAL_SOURCES: Source[] = [];

// // const SUGGESTED_QUESTIONS = [
// //     "What are the key insights from my sources?",
// //     "Create a summary table of main concepts",
// //     "Generate practice questions for review",
// //     "Connect ideas across different documents"
// // ];

// // const QUICK_ACTIONS = [
// //     { title: 'Study Guide', desc: 'Structured learning path', icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500' },
// //     { title: 'Smart Summary', desc: 'AI-powered synthesis', icon: Zap, gradient: 'from-amber-500 to-orange-500' },
// //     { title: 'Concept Map', desc: 'Visual connections', icon: Compass, gradient: 'from-purple-500 to-pink-500' },
// //     { title: 'Q&A Bank', desc: 'Test your knowledge', icon: MessageSquare, gradient: 'from-blue-500 to-cyan-500' },
// //     { title: 'Flashcards', desc: 'Active recall', icon: Layers, gradient: 'from-rose-500 to-red-500' },
// //     { title: 'Briefing Doc', desc: 'Executive overview', icon: FileText, gradient: 'from-indigo-500 to-blue-500' },
// // ];

// // const AINotebook: React.FC = () => {
// //     useBranding();
    
// //     // State Management
// //     const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
// //     const [isChatOpen, setIsChatOpen] = useState(false);
// //     const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState(false);
// //     const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
// //         { role: 'system', content: '✨ Hi! I\'m your Colossus IQ Assistant. I\'ve analyzed your knowledge base and I\'m ready to help you learn smarter. What would you like to explore today?', timestamp: new Date() }
// //     ]);
// //     const [currentInput, setCurrentInput] = useState('');
// //     const [isGenerating, setIsGenerating] = useState(false);
// //     const [notes, setNotes] = useState('');
// //     const [activeTab, setActiveTab] = useState('guide');
// //     const [isEditMode, setIsEditMode] = useState(false);
// //     const [isLoadingSources, setIsLoadingSources] = useState(false);
// //     const [selectedSourceCount, setSelectedSourceCount] = useState(0);
    
// //     const navigate = useNavigate();
// //     const fileInputRef = useRef<HTMLInputElement>(null);
// //     const chatScrollRef = useRef<HTMLDivElement>(null);
    
// //     // Responsive breakpoints
// //     const isMobile = useMediaQuery('(max-width: 768px)');
// //     const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
// //     const isSmallDesktop = useMediaQuery('(min-width: 1025px) and (max-width: 1440px)');
// //     const isDesktop = useMediaQuery('(min-width: 1441px)');

// //     // Auto-scroll chat to bottom
// //     useEffect(() => {
// //         if (chatScrollRef.current) {
// //             chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
// //         }
// //     }, [chatMessages]);

// //     // Update selected sources count
// //     useEffect(() => {
// //         setSelectedSourceCount(sources.filter(s => s.selected).length);
// //     }, [sources]);

// //     // Close mobile sources panel on route change
// //     useEffect(() => {
// //         setIsMobileSourcesOpen(false);
// //     }, [activeTab]);

// //     // Access check
// //     useEffect(() => {
// //         const checkAccess = async () => {
// //             const userType = sessionStorage.getItem('type');
// //             const userRole = sessionStorage.getItem('role');

// //             try {
// //                 const res = await axios.get(`${serverURL}/api/settings`);
// //                 if (res.data && res.data.notebookEnabled) {
// //                     const enabledSettings = res.data.notebookEnabled;
// //                     let isEnabled = false;

// //                     if (userRole === 'org_admin') isEnabled = enabledSettings.org_admin;
// //                     else if (userRole === 'student') isEnabled = enabledSettings.student;
// //                     else isEnabled = enabledSettings[userType || ''] || false;

// //                     if (!isEnabled) {
// //                         if (!['monthly', 'yearly', 'forever'].includes(userType || '')) {
// //                             navigate('/dashboard/pricing');
// //                             return;
// //                         }
// //                         navigate('/dashboard');
// //                     }
// //                 }
// //             } catch (error) {
// //                 console.error('Error checking notebook access:', error);
// //             }
// //         };

// //         checkAccess();
// //     }, [navigate]);

// //     const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
// //         const file = event.target.files?.[0];
// //         if (!file) return;

// //         setIsLoadingSources(true);
// //         const formData = new FormData();
// //         formData.append('file', file);

// //         try {
// //             const res = await axios.post(`${serverURL}/api/notebook/upload-source`, formData, {
// //                 headers: { 'Content-Type': 'multipart/form-data' }
// //             });
// //             if (res.data.success) {
// //                 setSources(prev => [...prev, { ...res.data.source, selected: false }]);
// //                 setTimeout(() => {
// //                     toggleSourceSelection(res.data.source.id);
// //                 }, 100);
// //             }
// //         } catch (error) {
// //             console.error('Upload failed', error);
// //         } finally {
// //             setIsLoadingSources(false);
// //         }
// //         if (fileInputRef.current) fileInputRef.current.value = '';
// //     };

// //     const toggleSourceSelection = (id: string) => {
// //         setSources(prev => prev.map(s => 
// //             s.id === id ? { ...s, selected: !s.selected } : s
// //         ));
// //     };

// //     const handleSendMessage = async () => {
// //         if (!currentInput.trim()) return;

// //         const userMessage: ChatMessage = { role: 'user', content: currentInput, timestamp: new Date() };
// //         const newMessages = [...chatMessages, userMessage];
// //         setChatMessages(newMessages);
// //         setCurrentInput('');
// //         setIsGenerating(true);

// //         const selectedContext = sources
// //             .filter(s => s.selected)
// //             .map(s => s.content)
// //             .join('\n\n');

// //         try {
// //             const res = await axios.post(`${serverURL}/api/notebook/chat`, {
// //                 messages: newMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
// //                 context: selectedContext
// //             });

// //             if (res.data.success) {
// //                 setChatMessages(prev => [...prev, { 
// //                     role: 'system', 
// //                     content: res.data.generatedText,
// //                     timestamp: new Date()
// //                 }]);
// //             }
// //         } catch (error: any) {
// //             console.error('Chat error', error);
// //             const errMsg = error?.response?.data?.message || 'I encountered an issue. Please try again.';
// //             setChatMessages(prev => [...prev, { role: 'system', content: errMsg, timestamp: new Date() }]);
// //         } finally {
// //             setIsGenerating(false);
// //         }
// //     };

// //     const handleGenerateAction = async (actionDesc: string) => {
// //         if (sources.filter(s => s.selected).length === 0) {
// //             setChatMessages(prev => [...prev, { 
// //                 role: 'system', 
// //                 content: '⚠️ Please select at least one source first to generate content.',
// //                 timestamp: new Date()
// //             }]);
// //             setIsChatOpen(true);
// //             return;
// //         }

// //         setIsGenerating(true);
// //         setActiveTab('notes');

// //         const selectedContext = sources
// //             .filter(s => s.selected)
// //             .map(s => s.content)
// //             .join('\n\n');

// //         try {
// //             const res = await axios.post(`${serverURL}/api/notebook/generate-action`, {
// //                 action: actionDesc,
// //                 context: selectedContext
// //             });

// //             if (res.data.success) {
// //                 const timestamp = new Date().toLocaleString();
// //                 const newNoteContent = `\n\n---\n## 📝 ${actionDesc} • ${timestamp}\n\n${res.data.generatedText}\n`;
// //                 setNotes(prev => prev + newNoteContent);
// //                 setIsEditMode(false);
// //             }
// //         } catch (error) {
// //             console.error('Action error', error);
// //         } finally {
// //             setIsGenerating(false);
// //         }
// //     };

// //     const getSourceIcon = (type: string) => {
// //         switch (type) {
// //             case 'pdf': return <FileType className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />;
// //             case 'url': return <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />;
// //             default: return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />;
// //         }
// //     };

// //     // Sources Panel Component (Reused for both desktop and mobile)
// //     const SourcesPanel = () => (
// //         <Card className="h-full border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
// //             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            
// //             <CardHeader className="relative px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-200/50 dark:border-slate-700/50">
// //                 <div className="flex items-center justify-between">
// //                     <div className="flex-1">
// //                         <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
// //                             <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
// //                                 <Database className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
// //                             </div>
// //                             <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent text-sm sm:text-base">
// //                                 Knowledge Base
// //                             </span>
// //                         </CardTitle>
// //                         <CardDescription className="text-xs sm:text-sm mt-1">
// //                             {selectedSourceCount} source{selectedSourceCount !== 1 ? 's' : ''} selected
// //                         </CardDescription>
// //                     </div>
// //                     <div className="flex items-center gap-2">
// //                         <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-2 sm:px-3 py-0.5 sm:py-1 text-xs">
// //                             {sources.length} total
// //                         </Badge>
// //                         {/* Show X button on mobile, tablet, and small desktop when sources panel is in overlay mode */}
// //                         {(isMobile || isTablet || (isSmallDesktop && isMobileSourcesOpen)) && (
// //                             <Button
// //                                 variant="ghost"
// //                                 size="icon"
// //                                 onClick={() => setIsMobileSourcesOpen(false)}
// //                                 className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
// //                             >
// //                                 {/* <X className="w-4 h-4 sm:w-5 sm:h-5" /> */}
// //                             </Button>
// //                         )}
// //                     </div>
// //                 </div>
// //             </CardHeader>

// //             <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
// //                 <div className="p-3 sm:p-5">
// //                     <input
// //                         type="file"
// //                         ref={fileInputRef}
// //                         style={{ display: 'none' }}
// //                         onChange={handleFileUpload}
// //                         accept=".pdf,.txt,.md"
// //                     />
// //                     <Button 
// //                         onClick={() => fileInputRef.current?.click()}
// //                         disabled={isLoadingSources}
// //                         className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg rounded-xl sm:rounded-2xl py-4 sm:py-6 text-sm sm:text-base transition-all duration-300 hover:scale-[1.02] active:scale-98"
// //                     >
// //                         {isLoadingSources ? (
// //                             <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
// //                         ) : (
// //                             <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
// //                         )}
// //                         Upload Document
// //                     </Button>
// //                 </div>

// //                 <ScrollArea className="flex-1 px-3 sm:px-5 pb-3 sm:pb-5">
// //                     <div className="space-y-2 sm:space-y-3">
// //                         {sources.length === 0 ? (
// //                             <motion.div 
// //                                 initial={{ opacity: 0, y: 10 }}
// //                                 animate={{ opacity: 1, y: 0 }}
// //                                 className="py-12 sm:py-16 text-center"
// //                             >
// //                                 <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
// //                                     <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
// //                                 </div>
// //                                 <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Your knowledge base is empty</p>
// //                                 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] sm:max-w-[200px] mx-auto">
// //                                     Upload PDFs or documents to start your AI-powered learning journey
// //                                 </p>
// //                             </motion.div>
// //                         ) : (
// //                             sources.map((source, index) => (
// //                                 <motion.div
// //                                     key={source.id}
// //                                     initial={{ opacity: 0, y: 10 }}
// //                                     animate={{ opacity: 1, y: 0 }}
// //                                     transition={{ delay: index * 0.05 }}
// //                                     onClick={() => toggleSourceSelection(source.id)}
// //                                     className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden ${
// //                                         source.selected
// //                                             ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-2 border-indigo-300 dark:border-indigo-600 shadow-lg'
// //                                             : 'bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
// //                                     }`}
// //                                 >
// //                                     <div className="flex items-start gap-2 sm:gap-3">
// //                                         <div className="mt-0.5">
// //                                             {source.selected ? (
// //                                                 <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
// //                                                     <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
// //                                                 </div>
// //                                             ) : (
// //                                                 <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 transition-colors" />
// //                                             )}
// //                                         </div>
// //                                         <div className="flex-1 min-w-0">
// //                                             <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
// //                                                 <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-white/50 dark:bg-slate-700/50">
// //                                                     {getSourceIcon(source.type)}
// //                                                 </div>
// //                                                 <p className="font-semibold text-xs sm:text-sm truncate">{source.title}</p>
// //                                             </div>
// //                                             <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
// //                                                 <Type className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
// //                                                 <span>{source.words.toLocaleString()} words</span>
// //                                                 {source.type === 'pdf' && (
// //                                                     <>
// //                                                         <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
// //                                                         <FileType className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
// //                                                         <span>PDF</span>
// //                                                     </>
// //                                                 )}
// //                                             </div>
// //                                         </div>
// //                                         <Button
// //                                             variant="ghost"
// //                                             size="icon"
// //                                             className="opacity-0 group-hover:opacity-100 transition-all h-6 w-6 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 setSources(prev => prev.filter(s => s.id !== source.id));
// //                                             }}
// //                                         >
// //                                             <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
// //                                         </Button>
// //                                     </div>
// //                                     {source.selected && (
// //                                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
// //                                     )}
// //                                 </motion.div>
// //                             ))
// //                         )}
// //                     </div>
// //                 </ScrollArea>
// //             </CardContent>
// //         </Card>
// //     );

// //     // Chat Panel Component
// //     const ChatPanel = () => (
// //         <Card className="h-full border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
// //             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            
// //             <CardHeader className="relative px-4 sm:px-6 py-3 sm:py-5 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
// //                 <div className="flex items-center justify-between">
// //                     <div className="flex items-center gap-2 sm:gap-3">
// //                         <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
// //                             <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
// //                         </div>
// //                         <div>
// //                             <CardTitle className="text-sm sm:text-lg font-bold">Colossus IQ</CardTitle>
// //                             <CardDescription className="text-[10px] sm:text-xs">AI Learning Assistant</CardDescription>
// //                         </div>
// //                     </div>
// //                     {/* Always show X button when chat is in overlay mode (mobile, tablet, and small desktop) */}
// //                     {(isMobile || isTablet || isSmallDesktop) && (
// //                         <Button 
// //                             variant="ghost" 
// //                             size="icon" 
// //                             onClick={() => setIsChatOpen(false)}
// //                             className="rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 sm:h-9 sm:w-9"
// //                         >
// //                             <X className="w-4 h-4 sm:w-5 sm:h-5" />
// //                         </Button>
// //                     )}
// //                 </div>
// //             </CardHeader>

// //             <ScrollArea className="flex-1 p-3 sm:p-6" ref={chatScrollRef}>
// //                 <div className="space-y-3 sm:space-y-4">
// //                     {chatMessages.map((msg, i) => (
// //                         <motion.div
// //                             key={i}
// //                             initial={{ opacity: 0, y: 10 }}
// //                             animate={{ opacity: 1, y: 0 }}
// //                             transition={{ delay: i * 0.05 }}
// //                             className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
// //                         >
// //                             <div className={`max-w-[85%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-md ${
// //                                 msg.role === 'user'
// //                                     ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
// //                                     : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md'
// //                             }`}>
// //                                 {msg.role === 'system' ? (
// //                                     <div
// //                                         className="text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"
// //                                         dangerouslySetInnerHTML={{ __html: converter.makeHtml(msg.content) }}
// //                                     />
// //                                 ) : (
// //                                     <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
// //                                 )}
// //                             </div>
// //                         </motion.div>
// //                     ))}
// //                     {isGenerating && (
// //                         <motion.div
// //                             initial={{ opacity: 0 }}
// //                             animate={{ opacity: 1 }}
// //                             className="flex justify-start"
// //                         >
// //                             <div className="rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
// //                                 <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-indigo-500" />
// //                                 <span className="text-xs sm:text-sm text-slate-500">Thinking...</span>
// //                             </div>
// //                         </motion.div>
// //                     )}
// //                 </div>
// //             </ScrollArea>

// //             <CardFooter className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/30">
// //                 <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="w-full relative">
// //                     <Input
// //                         value={currentInput}
// //                         onChange={(e) => setCurrentInput(e.target.value)}
// //                         placeholder="Ask anything about your sources..."
// //                         className="pr-10 sm:pr-12 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
// //                     />
// //                     <Button
// //                         type="submit"
// //                         size="icon"
// //                         disabled={!currentInput.trim() || isGenerating}
// //                         className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
// //                     >
// //                         <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
// //                     </Button>
// //                 </form>
// //             </CardFooter>
// //         </Card>
// //     );

// //     return (
// //         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
// //             {/* Animated Background - Hidden on mobile for performance */}
// //             {!isMobile && (
// //                 <div className="fixed inset-0 overflow-hidden pointer-events-none">
// //                     <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
// //                     <div className="absolute bottom-20 -right-40 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
// //                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
// //                 </div>
// //             )}

// //             <div className="relative flex flex-col lg:flex-row min-h-screen w-full gap-3 sm:gap-4 lg:gap-5 p-3 sm:p-4 lg:p-6 overflow-hidden">
// //                 {/* Desktop Sidebar - Always visible on large desktop (1441px+) */}
// //                 {isDesktop && (
// //                     <motion.div
// //                         initial={{ opacity: 0, x: -20 }}
// //                         animate={{ opacity: 1, x: 0 }}
// //                         transition={{ duration: 0.4 }}
// //                         className="w-80 xl:w-96 shrink-0"
// //                     >
// //                         <SourcesPanel />
// //                     </motion.div>
// //                 )}

// //                 {/* Small Desktop Sidebar - Toggle with button (1025px to 1440px) */}
// //                 {isSmallDesktop && (
// //                     <>
// //                         <Button
// //                             onClick={() => setIsMobileSourcesOpen(!isMobileSourcesOpen)}
// //                             variant="outline"
// //                             className="fixed bottom-4 left-4 z-40 rounded-full shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur lg:hidden"
// //                         >
// //                             <Database className="w-4 h-4 mr-2" />
// //                             Sources ({selectedSourceCount})
// //                         </Button>
// //                         <AnimatePresence>
// //                             {isMobileSourcesOpen && (
// //                                 <motion.div
// //                                     initial={{ opacity: 0, x: -300 }}
// //                                     animate={{ opacity: 1, x: 0 }}
// //                                     exit={{ opacity: 0, x: -300 }}
// //                                     transition={{ duration: 0.3 }}
// //                                     className="fixed inset-y-0 left-0 z-50 w-80 shadow-2xl"
// //                                 >
// //                                     <div className="h-full">
// //                                         <SourcesPanel />
// //                                     </div>
// //                                     <div 
// //                                         className="fixed inset-0 bg-black/50 -z-10"
// //                                         onClick={() => setIsMobileSourcesOpen(false)}
// //                                     />
// //                                 </motion.div>
// //                             )}
// //                         </AnimatePresence>
// //                     </>
// //                 )}

// //                 {/* Mobile Sources Button */}
// //                 {isMobile && (
// //                     <div className="fixed bottom-4 right-4 z-40 lg:hidden">
// //                         <Sheet open={isMobileSourcesOpen} onOpenChange={setIsMobileSourcesOpen}>
// //                             <SheetTrigger asChild>
// //                                 <Button className="rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12">
// //                                     <Database className="w-5 h-5" />
// //                                 </Button>
// //                             </SheetTrigger>
// //                             <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 bg-transparent border-0">
// //                                 <div className="h-full">
// //                                     <SourcesPanel />
// //                                 </div>
// //                             </SheetContent>
// //                         </Sheet>
// //                     </div>
// //                 )}

// //                 {/* Tablet Sidebar - Toggle with button */}
// //                 {isTablet && (
// //                     <>
// //                         <Button
// //                             onClick={() => setIsMobileSourcesOpen(!isMobileSourcesOpen)}
// //                             variant="outline"
// //                             className="fixed bottom-4 left-4 z-40 rounded-full shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur"
// //                         >
// //                             <Database className="w-4 h-4 mr-2" />
// //                             Sources ({selectedSourceCount})
// //                         </Button>
// //                         <AnimatePresence>
// //                             {isMobileSourcesOpen && (
// //                                 <motion.div
// //                                     initial={{ opacity: 0, x: -300 }}
// //                                     animate={{ opacity: 1, x: 0 }}
// //                                     exit={{ opacity: 0, x: -300 }}
// //                                     transition={{ duration: 0.3 }}
// //                                     className="fixed inset-y-0 left-0 z-50 w-80 shadow-2xl"
// //                                 >
// //                                     <div className="h-full">
// //                                         <SourcesPanel />
// //                                     </div>
// //                                     <div 
// //                                         className="fixed inset-0 bg-black/50 -z-10"
// //                                         onClick={() => setIsMobileSourcesOpen(false)}
// //                                     />
// //                                 </motion.div>
// //                             )}
// //                         </AnimatePresence>
// //                     </>
// //                 )}

// //                 {/* MAIN CONTENT AREA */}
// //                 <motion.div
// //                     initial={{ opacity: 0, y: 20 }}
// //                     animate={{ opacity: 1, y: 0 }}
// //                     transition={{ duration: 0.4, delay: 0.1 }}
// //                     className={`flex-1 min-w-0 transition-all duration-300 ${
// //                         (isMobile || isTablet || isSmallDesktop) && isChatOpen ? 'hidden' : 'block'
// //                     }`}
// //                 >
// //                     <Card className="h-full border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
// //                         <CardHeader className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/30">
// //                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
// //                                 <div>
// //                                     <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
// //                                         <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
// //                                             <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-white" />
// //                                         </div>
// //                                         <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-base sm:text-xl lg:text-2xl">
// //                                             Neural Notebook
// //                                         </span>
// //                                     </CardTitle>
// //                                     <CardDescription className="text-xs sm:text-sm mt-1">
// //                                         Your AI-powered learning companion • {selectedSourceCount} active source{selectedSourceCount !== 1 ? 's' : ''}
// //                                     </CardDescription>
// //                                 </div>
                                
// //                                 {/* Action Buttons - Responsive */}
// //                                 <div className="flex items-center gap-2">
// //                                     {/* Show source count button on all except large desktop */}
// //                                     {(!isDesktop) && (
// //                                         <Button
// //                                             variant="outline"
// //                                             size="sm"
// //                                             onClick={() => setIsMobileSourcesOpen(true)}
// //                                             className="rounded-xl text-xs"
// //                                         >
// //                                             <Database className="w-3.5 h-3.5 mr-1" />
// //                                             {selectedSourceCount}
// //                                         </Button>
// //                                     )}
                                    
// //                                     <Button 
// //                                         onClick={() => setIsChatOpen(!isChatOpen)} 
// //                                         variant={isChatOpen ? "default" : "outline"}
// //                                         size={isMobile ? "sm" : "default"}
// //                                         className="rounded-xl sm:rounded-2xl shadow-md transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
// //                                     >
// //                                         {isChatOpen ? (
// //                                             <><PanelRightClose className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {!isMobile && 'Hide'}</>
// //                                         ) : (
// //                                             <><MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {!isMobile && 'Chat'}</>
// //                                         )}
// //                                     </Button>
// //                                 </div>
// //                             </div>
// //                         </CardHeader>

// //                         <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
// //                             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
// //                                 <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 border-b border-slate-200/50 dark:border-slate-700/50">
// //                                     <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1">
// //                                         <TabsTrigger 
// //                                             value="guide" 
// //                                             className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm transition-all"
// //                                         >
// //                                             <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
// //                                             <span className={isMobile ? 'hidden sm:inline' : 'inline'}>Learning</span> Studio
// //                                         </TabsTrigger>
// //                                         <TabsTrigger 
// //                                             value="notes" 
// //                                             className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm transition-all"
// //                                         >
// //                                             <NotebookPen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
// //                                             <span className={isMobile ? 'hidden sm:inline' : 'inline'}>My</span> Notes
// //                                         </TabsTrigger>
// //                                     </TabsList>
// //                                 </div>

// //                                 <ScrollArea className="flex-1">
// //                                     <TabsContent value="guide" className="p-4 sm:p-6 lg:p-8 m-0">
// //                                         {/* Hero Section - Responsive */}
// //                                         <div className="mb-6 sm:mb-8 lg:mb-10 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/30 dark:border-indigo-500/20 relative overflow-hidden">
// //                                             <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
// //                                             <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
// //                                                 <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl">
// //                                                     <Waves className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
// //                                                 </div>
// //                                                 <div className="flex-1 text-center sm:text-left">
// //                                                     <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Generate Audio Overview</h3>
// //                                                     <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
// //                                                         Transform your selected sources into an engaging podcast-style discussion.
// //                                                     </p>
// //                                                 </div>
// //                                                 <Button
// //                                                     onClick={() => handleGenerateAction("Audio Overview")}
// //                                                     disabled={isGenerating || selectedSourceCount === 0}
// //                                                     size={isMobile ? "sm" : "default"}
// //                                                     className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6 text-xs sm:text-sm lg:text-base"
// //                                                 >
// //                                                     {isGenerating ? (
// //                                                         <><Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 animate-spin" /> Generating</>
// //                                                     ) : (
// //                                                         <><Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" /> Generate</>
// //                                                     )}
// //                                                 </Button>
// //                                             </div>
// //                                         </div>

// //                                         {/* Quick Actions Grid - Responsive columns */}
// //                                         <div className="mb-6 sm:mb-8 lg:mb-10">
// //                                             <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5 flex items-center gap-2">
// //                                                 <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
// //                                                 AI-Powered Actions
// //                                             </h3>
// //                                             <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
// //                                                 {QUICK_ACTIONS.map((action, i) => (
// //                                                     <motion.div
// //                                                         key={action.title}
// //                                                         initial={{ opacity: 0, y: 20 }}
// //                                                         animate={{ opacity: 1, y: 0 }}
// //                                                         transition={{ delay: i * 0.05 }}
// //                                                         onClick={() => handleGenerateAction(action.title)}
// //                                                         className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group ${
// //                                                             (isGenerating || selectedSourceCount === 0) ? 'opacity-50 pointer-events-none' : ''
// //                                                         }`}
// //                                                     >
// //                                                         <div className="flex items-start justify-between mb-2 sm:mb-3">
// //                                                             <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}>
// //                                                                 <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
// //                                                             </div>
// //                                                             <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
// //                                                         </div>
// //                                                         <h4 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{action.title}</h4>
// //                                                         <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
// //                                                     </motion.div>
// //                                                 ))}
// //                                             </div>
// //                                         </div>

// //                                         {/* Suggested Questions - Responsive */}
// //                                         <div>
// //                                             <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5 flex items-center gap-2">
// //                                                 <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
// //                                                 Suggested Questions
// //                                             </h3>
// //                                             <div className="flex flex-wrap gap-2 sm:gap-3">
// //                                                 {SUGGESTED_QUESTIONS.map((q, i) => (
// //                                                     <motion.div
// //                                                         key={q}
// //                                                         initial={{ opacity: 0, scale: 0.9 }}
// //                                                         animate={{ opacity: 1, scale: 1 }}
// //                                                         transition={{ delay: i * 0.05 }}
// //                                                         onClick={() => {
// //                                                             setCurrentInput(q);
// //                                                             if (!isChatOpen) setIsChatOpen(true);
// //                                                         }}
// //                                                         className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
// //                                                     >
// //                                                         <span className="text-[11px] sm:text-xs lg:text-sm">{q}</span>
// //                                                     </motion.div>
// //                                                 ))}
// //                                             </div>
// //                                         </div>
// //                                     </TabsContent>

// //                                     <TabsContent value="notes" className="p-0 m-0 flex flex-col h-full">
// //                                         <div className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
// //                                             <div className="flex items-center gap-2 sm:gap-3">
// //                                                 <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
// //                                                     <NotebookPen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
// //                                                 </div>
// //                                                 <span className="font-semibold text-xs sm:text-sm">Notebook Content</span>
// //                                             </div>
// //                                             <div className="flex gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg sm:rounded-xl">
// //                                                 <Button
// //                                                     variant={!isEditMode ? "default" : "ghost"}
// //                                                     size="sm"
// //                                                     className="rounded-md sm:rounded-lg px-2 sm:px-3 lg:px-4 text-xs sm:text-sm h-7 sm:h-8"
// //                                                     onClick={() => setIsEditMode(false)}
// //                                                 >
// //                                                     <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" /> Preview
// //                                                 </Button>
// //                                                 <Button
// //                                                     variant={isEditMode ? "default" : "ghost"}
// //                                                     size="sm"
// //                                                     className="rounded-md sm:rounded-lg px-2 sm:px-3 lg:px-4 text-xs sm:text-sm h-7 sm:h-8"
// //                                                     onClick={() => setIsEditMode(true)}
// //                                                 >
// //                                                     <FileType className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" /> Edit
// //                                                 </Button>
// //                                             </div>
// //                                         </div>
                                        
// //                                         <div className="flex-1">
// //                                             {isEditMode ? (
// //                                                 <Textarea
// //                                                     className="w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border-0 focus-visible:ring-0 rounded-none resize-none p-4 sm:p-6 lg:p-8 text-xs sm:text-sm lg:text-base bg-transparent font-mono leading-relaxed"
// //                                                     placeholder="✍️ Start writing your thoughts here. Generate AI content from the Learning Studio tab..."
// //                                                     value={notes}
// //                                                     onChange={(e) => setNotes(e.target.value)}
// //                                                 />
// //                                             ) : (
// //                                                 <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
// //                                                     {notes ? (
// //                                                         <div
// //                                                             className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:mb-4 prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:rounded-lg sm:prose-pre:rounded-xl"
// //                                                             dangerouslySetInnerHTML={{ __html: converter.makeHtml(notes) }}
// //                                                         />
// //                                                     ) : (
// //                                                         <div className="flex flex-col items-center justify-center py-16 sm:py-24 lg:py-32 text-center">
// //                                                             <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/30 flex items-center justify-center mb-4 sm:mb-6">
// //                                                                 <NotebookPen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-indigo-400" />
// //                                                             </div>
// //                                                             <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base lg:text-lg">Your notebook is empty</p>
// //                                                             <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1 sm:mt-2 max-w-xs sm:max-w-sm">
// //                                                                 Generate study guides, summaries, or quizzes from your sources to start building your knowledge base.
// //                                                             </p>
// //                                                         </div>
// //                                                     )}
// //                                                 </div>
// //                                             )}
// //                                         </div>
// //                                     </TabsContent>
// //                                 </ScrollArea>
// //                             </Tabs>
// //                         </CardContent>
// //                     </Card>
// //                 </motion.div>

// //                 {/* Chat Panel - Responsive */}
// //                 <AnimatePresence>
// //                     {isChatOpen && (
// //                         <motion.div
// //                             initial={{ opacity: 0, x: isMobile ? 300 : (isTablet || isSmallDesktop ? 400 : 100), scale: isMobile ? 1 : 0.95 }}
// //                             animate={{ opacity: 1, x: 0, scale: 1 }}
// //                             exit={{ opacity: 0, x: isMobile ? 300 : (isTablet || isSmallDesktop ? 400 : 100), scale: isMobile ? 1 : 0.95 }}
// //                             transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
// //                             className={`
// //                                 ${isMobile ? 'fixed inset-0 z-50' : ''}
// //                                 ${isTablet ? 'fixed inset-y-0 right-0 w-[400px] z-40' : ''}
// //                                 ${isSmallDesktop ? 'fixed inset-y-0 right-0 w-[420px] z-40' : ''}
// //                                 ${isDesktop ? 'w-[420px] shrink-0 relative' : ''}
// //                             `}
// //                         >
// //                             <ChatPanel />
// //                             {(isMobile || isTablet || isSmallDesktop) && (
// //                                 <div 
// //                                     className="fixed inset-0 bg-black/50 -z-10"
// //                                     onClick={() => setIsChatOpen(false)}
// //                                 />
// //                             )}
// //                         </motion.div>
// //                     )}
// //                 </AnimatePresence>

// //                 {/* Mobile/Tablet/Small Desktop Chat Button */}
// //                 {!isDesktop && !isChatOpen && (
// //                     <Button
// //                         onClick={() => setIsChatOpen(true)}
// //                         className="fixed bottom-4 right-4 z-40 rounded-full shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12"
// //                     >
// //                         <MessageSquare className="w-5 h-5" />
// //                     </Button>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default AINotebook;

// import React, { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Sheet, SheetContent } from '@/components/ui/sheet';
// import {
//     FileText, Upload, MessageSquare, BookOpen, BrainCircuit, Send,
//     Trash2, FileType, CheckCircle2, ChevronRight, Lightbulb, Headphones,
//     Layers, Loader2, Mic, Zap, Compass, Globe, Database, Cloud, Bot,
//     GraduationCap, NotebookPen, Waves, X,
//     ChevronLeft, RotateCcw, ThumbsUp, ThumbsDown, Save, CheckCheck
// } from 'lucide-react';
// import { useBranding } from '@/contexts/BrandingContext';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { serverURL } from '@/constants';
// import showdown from 'showdown';
// import { useNavigate } from 'react-router-dom';
// import { useMediaQuery } from '@/hooks/useMediaQuery';

// // ── DESIGN TOKENS ──────────────────────────────────────────────
// const DESIGN_SYSTEM = `
//   :root {
//     --nb-brand-900: #0f2744;
//     --nb-brand-800: #1a3a5c;
//     --nb-brand-700: #1e4976;
//     --nb-brand-600: #1d6fa4;
//     --nb-brand-500: #2196c4;
//     --nb-brand-400: #38b2d8;
//     --nb-brand-300: #67cde8;
//     --nb-brand-200: #a8e4f3;
//     --nb-brand-100: #d9f3fb;
//     --nb-brand-50:  #edfafd;
//     --nb-accent:    #2196c4;
//     --nb-muted:     #64748b;
//     --nb-strong:    #0f2744;
//     --nb-h1: 1.75rem; --nb-h1-weight:700; --nb-h1-lh:1.2;
//     --nb-h2: 1.25rem; --nb-h2-weight:600; --nb-h2-lh:1.3;
//     --nb-h3: 1rem;    --nb-h3-weight:600; --nb-h3-lh:1.4;
//     --nb-body: 0.875rem; --nb-body-lh:1.6;
//     --nb-small:0.75rem;  --nb-small-weight:500;
//     --nb-xs:0.6875rem;
//   }
//   .dark {
//     --nb-strong: #e2f4fb;
//     --nb-muted:  #94a3b8;
//   }
//   .nb-h1 { font-size:var(--nb-h1);font-weight:var(--nb-h1-weight);line-height:var(--nb-h1-lh);letter-spacing:-0.025em;color:var(--nb-strong); }
//   .nb-h2 { font-size:var(--nb-h2);font-weight:var(--nb-h2-weight);line-height:var(--nb-h2-lh);letter-spacing:-0.015em;color:var(--nb-strong); }
//   .nb-h3 { font-size:var(--nb-h3);font-weight:var(--nb-h3-weight);line-height:var(--nb-h3-lh);color:var(--nb-strong); }
//   .nb-body { font-size:var(--nb-body);line-height:var(--nb-body-lh);color:var(--nb-muted); }
//   .nb-small { font-size:var(--nb-small);font-weight:var(--nb-small-weight);color:var(--nb-muted); }
//   .nb-xs { font-size:var(--nb-xs);color:var(--nb-muted); }

//   /* Flashcard */
//   .fc-scene { perspective:1200px; }
//   .fc-card { position:relative;transform-style:preserve-3d;transition:transform 0.55s cubic-bezier(0.4,0,0.2,1);min-height:240px; }
//   .fc-card.flipped { transform:rotateY(180deg); }
//   .fc-face { position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:1.25rem;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;text-align:center; }
//   .fc-back { transform:rotateY(180deg); }

//   /* Prose */
//   .nb-prose { width:100%;max-width:100%; }
//   .nb-prose h1{font-size:var(--nb-h1);font-weight:700;margin:1.75rem 0 0.875rem;color:var(--nb-strong);}
//   .nb-prose h2{font-size:var(--nb-h2);font-weight:600;margin:1.5rem 0 0.625rem;color:var(--nb-accent);}
//   .nb-prose h3{font-size:var(--nb-h3);font-weight:600;margin:1.25rem 0 0.5rem;color:var(--nb-strong);}
//   .nb-prose p{font-size:var(--nb-body);line-height:var(--nb-body-lh);color:var(--nb-muted);margin-bottom:0.875rem;}
//   .nb-prose ul,.nb-prose ol{padding-left:1.5rem;margin-bottom:0.875rem;}
//   .nb-prose li{font-size:var(--nb-body);line-height:var(--nb-body-lh);color:var(--nb-muted);margin-bottom:0.375rem;}
//   .nb-prose strong{color:var(--nb-strong);font-weight:600;}
//   .nb-prose blockquote{border-left:3px solid var(--nb-accent);padding:0.75rem 1.25rem;background:rgba(33,150,196,0.06);border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0;font-style:italic;}
//   .nb-prose table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:var(--nb-small);}
//   .nb-prose th{background:rgba(33,150,196,0.1);padding:0.625rem 1rem;text-align:left;font-weight:600;color:var(--nb-strong);border-bottom:2px solid rgba(33,150,196,0.2);}
//   .nb-prose td{padding:0.5rem 1rem;border-bottom:1px solid rgba(33,150,196,0.1);color:var(--nb-muted);}

//   /* Components */
//   .nb-badge-progress{background:var(--nb-accent)!important;color:#fff!important;font-size:var(--nb-xs);font-weight:600;padding:0.2rem 0.65rem;border-radius:999px;display:inline-flex;align-items:center;}
//   .nb-btn-show-answer{width:100%;padding:1rem;font-size:1rem;border-radius:1rem;border:2px solid #a8e4f3;background:transparent;color:#1e4976!important;font-weight:600;cursor:pointer;transition:all 0.2s;}
//   .nb-btn-show-answer:hover{background:#edfafd;border-color:#38b2d8;}
//   .dark .nb-btn-show-answer{color:#a8e4f3!important;border-color:#1d6fa4;}
//   .dark .nb-btn-show-answer:hover{background:rgba(33,150,196,0.1);}
//   .nb-chat-active{background:#1e4976!important;color:#fff!important;border-color:#1e4976!important;box-shadow:0 2px 8px rgba(30,73,118,0.4);}
//   .nb-chat-active svg{color:#fff!important;stroke:#fff!important;}
//   .nb-chat-inactive{background:rgba(255,255,255,0.12);color:#a8e4f3;border-color:rgba(255,255,255,0.2);}
//   .nb-chat-inactive:hover{background:rgba(255,255,255,0.2);}
//   .nb-save-toast{position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);background:#1e4976;color:#fff;padding:0.5rem 1.25rem;border-radius:999px;font-size:0.75rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);}

//   /* ── MOBILE FIXES ───────────────────────────────────────────── */

//   /* Chat textarea — prevent iOS zoom (font-size must be ≥16px) */
//   .nb-chat-textarea {
//     font-size: 16px !important;
//     -webkit-appearance: none;
//     appearance: none;
//     resize: none;
//     min-height: 44px;
//     max-height: 120px;
//     overflow-y: auto;
//     line-height: 1.5;
//     border: 1px solid #e2e8f0;
//     border-radius: 0.75rem;
//     padding: 10px 12px;
//     width: 100%;
//     outline: none;
//     font-family: inherit;
//     color: #0f2744;
//     background: #fff;
//     transition: border-color 0.2s;
//   }
//   .nb-chat-textarea:focus { border-color: #2196c4; }
//   .dark .nb-chat-textarea { background:#1e293b; color:#e2f4fb; border-color:#334155; }

//   /* Notes tab bar — horizontal scroll, no wrap */
//   .nb-tab-bar {
//     display: flex;
//     gap: 0;
//     overflow-x: auto;
//     -webkit-overflow-scrolling: touch;
//     scrollbar-width: none;
//     border-bottom: 1px solid #f1f5f9;
//     background: rgba(255,255,255,0.6);
//     padding: 0 12px;
//   }
//   .nb-tab-bar::-webkit-scrollbar { display:none; }

//   /* Bottom FABs — keep them spaced apart */
//   .nb-fab-right { position:fixed;bottom:1.25rem;right:1rem;z-index:40; }
//   .nb-fab-left  { position:fixed;bottom:1.25rem;left:1rem;z-index:40; }

//   /* Safe-area insets for modern iPhones */
//   @supports (padding-bottom: env(safe-area-inset-bottom)) {
//     .nb-fab-right, .nb-fab-left {
//       bottom: calc(1.25rem + env(safe-area-inset-bottom));
//     }
//     .nb-chat-footer {
//       padding-bottom: calc(0.75rem + env(safe-area-inset-bottom)) !important;
//     }
//   }

//   /* Flashcard smaller on phones */
//   @media(max-width:480px){
//     .fc-card { min-height:190px; }
//     .fc-face { padding:1.25rem 1rem; }
//     .nb-h1  { font-size:1.3rem; }
//     .nb-h2  { font-size:1rem; }
//     .nb-prose { padding:0 4px; }
//     .nb-prose h1 { font-size:1.2rem; }
//     .nb-prose h2 { font-size:1rem; }
//     .nb-prose p  { font-size:13px;line-height:1.5; }
//   }
// `;

// const converter = new showdown.Converter({tables:true,tasklists:true,strikethrough:true,ghCodeBlocks:true,simplifiedAutoLink:true});

// interface Source { id:string;title:string;type:'pdf'|'url'|'text';content:string;words:number;selected:boolean; }
// interface ChatMessage { role:'user'|'system';content:string;timestamp?:Date; }
// interface Flashcard { question:string;answer:string; }
// interface ConceptNode { id:string;label:string;children?:ConceptNode[]; }

// const SUGGESTED_QUESTIONS = [
//     "Key insights from my sources?",
//     "Summary table of main concepts",
//     "Practice questions for review",
//     "Connect ideas across documents"
// ];

// const QUICK_ACTIONS = [
//     { title:'Study Guide',   desc:'Structured learning path', icon:GraduationCap, gradient:'from-teal-500 to-cyan-600',   bg:'rgba(20,184,166,0.07)' },
//     { title:'Smart Summary', desc:'AI-powered synthesis',     icon:Zap,            gradient:'from-blue-500 to-cyan-500',   bg:'rgba(59,130,246,0.07)' },
//     { title:'Concept Map',   desc:'Visual connections',       icon:Compass,        gradient:'from-indigo-500 to-blue-600', bg:'rgba(99,102,241,0.07)' },
//     { title:'Q&A Bank',      desc:'Test your knowledge',      icon:MessageSquare,  gradient:'from-sky-500 to-blue-500',    bg:'rgba(14,165,233,0.07)' },
//     { title:'Flashcards',    desc:'Active recall',            icon:Layers,         gradient:'from-cyan-500 to-teal-500',   bg:'rgba(6,182,212,0.07)'  },
//     { title:'Briefing Doc',  desc:'Executive overview',       icon:FileText,       gradient:'from-blue-600 to-indigo-600', bg:'rgba(37,99,235,0.07)'  },
// ];

// const SH: React.FC<{icon:React.ElementType;label:string;sub?:string}> = ({icon:Icon,label,sub}) => (
//     <div className="flex items-center gap-2 sm:gap-3 mb-4">
//         <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
//             style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//             <Icon className="w-3.5 h-3.5 text-white"/>
//         </div>
//         <div>
//             <h2 className="nb-h2 text-sm sm:text-base">{label}</h2>
//             {sub && <p className="nb-xs mt-0.5 hidden sm:block">{sub}</p>}
//         </div>
//     </div>
// );

// // ── FLASHCARD VIEWER ─────────────────────────────────────────────
// const FlashcardViewer: React.FC<{cards:Flashcard[]}> = ({cards}) => {
//     const [index,setIndex] = useState(0);
//     const [flipped,setFlipped] = useState(false);
//     const [known,setKnown] = useState<Set<number>>(new Set());
//     const [unknown,setUnknown] = useState<Set<number>>(new Set());
//     const [done,setDone] = useState(false);
//     const total=cards.length; const current=cards[index];
//     const progress=(index/total)*100;
//     const respond=(ok:boolean)=>{if(ok)setKnown(p=>new Set([...p,index]));else setUnknown(p=>new Set([...p,index]));setFlipped(false);setTimeout(()=>{if(index+1>=total)setDone(true);else setIndex(i=>i+1);},300);};
//     const restart=()=>{setIndex(0);setFlipped(false);setKnown(new Set());setUnknown(new Set());setDone(false);};

//     if(done){
//         const pct=Math.round((known.size/total)*100);
//         return (
//             <div className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[380px]">
//                 <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-xl" style={{background:'linear-gradient(135deg,#1d6fa4,#38b2d8)'}}>
//                     <span className="text-4xl">🎉</span>
//                 </div>
//                 <h2 className="nb-h1 mb-1" style={{color:'#0f2744'}}>Great Job!</h2>
//                 <p className="text-lg font-semibold mb-6" style={{color:'#1d6fa4'}}>{known.size}/{total} correct · {pct}%</p>
//                 <div className="flex gap-8 mb-8">
//                     <div className="text-center"><div className="text-3xl font-bold" style={{color:'#059669'}}>{known.size}</div><div className="nb-small">Got it</div></div>
//                     <div className="text-center"><div className="text-3xl font-bold text-rose-500">{unknown.size}</div><div className="nb-small">Review</div></div>
//                 </div>
//                 <Button onClick={restart} className="rounded-2xl text-white px-8 py-5 shadow-lg" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                     <RotateCcw className="w-4 h-4 mr-2"/> Study Again
//                 </Button>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
//             <div className="mb-4 sm:mb-5">
//                 <div className="flex justify-between items-center mb-2">
//                     <div className="flex items-center gap-2 flex-wrap">
//                         <span className="font-semibold text-xs sm:text-sm" style={{color:'#1d6fa4'}}>Card {index+1}/{total}</span>
//                         <span className="nb-badge-progress">{Math.round(progress)}% done</span>
//                     </div>
//                     <div className="flex gap-3 text-xs">
//                         <span className="flex items-center gap-1" style={{color:'#059669'}}><ThumbsUp className="w-3 h-3"/>{known.size}</span>
//                         <span className="flex items-center gap-1 text-rose-500"><ThumbsDown className="w-3 h-3"/>{unknown.size}</span>
//                     </div>
//                 </div>
//                 <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'rgba(33,150,196,0.12)'}}>
//                     <motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${progress}%`}} transition={{duration:0.4}}
//                         style={{background:'linear-gradient(90deg,#1e4976,#2196c4,#38b2d8)'}}/>
//                 </div>
//             </div>

//             <div className="fc-scene cursor-pointer select-none mb-4 sm:mb-5" onClick={()=>setFlipped(!flipped)}>
//                 <div className={`fc-card ${flipped?'flipped':''}`}>
//                     <div className="fc-face" style={{background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)',border:'2px solid #38b2d8'}}>
//                         <div className="text-center">
//                             <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full mb-3 sm:mb-4 text-xs font-bold tracking-widest"
//                                 style={{background:'rgba(33,150,196,0.12)',color:'#1e4976'}}>QUESTION</div>
//                             <p className="font-semibold leading-snug max-w-[38ch] mx-auto text-xs sm:text-sm md:text-base" style={{color:'#0f2744'}}>
//                                 {current.question}
//                             </p>
//                         </div>
//                         <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs" style={{color:'#38b2d8'}}>
//                             <span>Tap to reveal</span><ChevronRight className="w-3 h-3"/>
//                         </div>
//                     </div>
//                     <div className="fc-face fc-back" style={{background:'linear-gradient(135deg,#ecfdf5,#f0fdf4)',border:'2px solid #10b981'}}>
//                         <div className="text-center">
//                             <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full mb-3 sm:mb-4 text-xs font-bold tracking-widest"
//                                 style={{background:'rgba(16,185,129,0.12)',color:'#065f46'}}>ANSWER</div>
//                             <p className="nb-body leading-relaxed max-w-[42ch] mx-auto text-xs sm:text-sm text-slate-700">{current.answer}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex flex-col gap-2 sm:gap-3">
//                 {!flipped ? (
//                     <button className="nb-btn-show-answer" onClick={()=>setFlipped(true)}>Show Answer</button>
//                 ):(
//                     <div className="grid grid-cols-2 gap-2">
//                         <Button onClick={()=>respond(false)} variant="outline"
//                             className="py-4 sm:py-5 rounded-2xl border-rose-200 hover:bg-rose-50 text-rose-600 text-xs sm:text-sm">
//                             <ThumbsDown className="w-3.5 h-3.5 mr-1.5"/>Still Learning
//                         </Button>
//                         <Button onClick={()=>respond(true)} className="py-4 sm:py-5 rounded-2xl text-white text-xs sm:text-sm"
//                             style={{background:'linear-gradient(135deg,#059669,#10b981)'}}>
//                             <ThumbsUp className="w-3.5 h-3.5 mr-1.5"/>Got It!
//                         </Button>
//                     </div>
//                 )}
//                 <div className="flex justify-between items-center">
//                     <Button variant="ghost" size="sm" onClick={()=>setIndex(Math.max(0,index-1))} disabled={index===0}
//                         className="text-xs px-2" style={{color:'#1e4976'}}>
//                         <ChevronLeft className="w-3.5 h-3.5 mr-1"/>Prev
//                     </Button>
//                     <Button variant="ghost" size="sm" onClick={()=>{setUnknown(u=>new Set([...u,index]));setFlipped(false);if(index+1<total)setIndex(i=>i+1);else setDone(true);}}
//                         className="text-xs text-slate-400 px-2">Skip</Button>
//                     <Button variant="ghost" size="sm" onClick={()=>setIndex(Math.min(total-1,index+1))} disabled={index===total-1}
//                         className="text-xs px-2" style={{color:'#1e4976'}}>
//                         Next<ChevronRight className="w-3.5 h-3.5 ml-1"/>
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ── CONCEPT MAP ──────────────────────────────────────────────────
// const ConceptMapRenderer: React.FC<{nodes:ConceptNode[]}> = ({nodes}) => {
//     const [expanded,setExpanded] = useState<Set<string>>(new Set(nodes.map(n=>n.id)));
//     const toggle=(id:string)=>setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
//     const DS=[{bg:'#dbeafe',border:'#3b82f6',text:'#1e3a8a'},{bg:'#ede9fe',border:'#8b5cf6',text:'#4c1d95'},{bg:'#cffafe',border:'#06b6d4',text:'#164e63'},{bg:'#f1f5f9',border:'#94a3b8',text:'#334155'}];
//     const rNode=(node:ConceptNode,d=0):React.ReactNode=>{
//         const open=expanded.has(node.id);const kids=!!(node.children?.length);const s=DS[Math.min(d,3)];
//         return (
//             <div key={node.id} className={d>0?'ml-4 sm:ml-6 mt-2':'mt-3'}>
//                 <div className="flex items-center gap-2">
//                     {d>0&&<div className="w-4 h-px shrink-0" style={{background:s.border}}/>}
//                     <button onClick={()=>kids&&toggle(node.id)} className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl border text-left ${kids?'cursor-pointer hover:opacity-80':'cursor-default'} transition-all`}
//                         style={{background:s.bg,borderColor:s.border,color:s.text}}>
//                         {kids&&<span className="text-xs opacity-60">{open?'▾':'▸'}</span>}
//                         <span className="font-medium text-xs sm:text-sm">{node.label}</span>
//                     </button>
//                 </div>
//                 {kids&&open&&(<div className="ml-4 sm:ml-6 mt-1 pl-2 border-l-2 border-dashed" style={{borderColor:s.border+'60'}}>{node.children!.map(c=>rNode(c,d+1))}</div>)}
//             </div>
//         );
//     };
//     return (
//         <div className="py-4 px-2">
//             <div className="flex gap-3 mb-4">
//                 <button onClick={()=>setExpanded(new Set(nodes.map(n=>n.id)))} className="nb-xs hover:underline" style={{color:'#2196c4'}}>Expand all</button>
//                 <span className="nb-xs opacity-30">|</span>
//                 <button onClick={()=>setExpanded(new Set())} className="nb-xs hover:underline text-slate-500">Collapse all</button>
//             </div>
//             {nodes.map(n=>rNode(n,0))}
//         </div>
//     );
// };

// // ── AUDIO PLAYER ─────────────────────────────────────────────────
// const AudioPlayer: React.FC<{script:string}> = ({script}) => {
//     const [isPlaying,setIsPlaying] = useState(false);
//     const lines=script.split('\n').filter(l=>l.trim()).map(line=>{const m=line.match(/^\*\*(Host [AB]|Alex|Ben):\*\*\s*(.+)/)||line.match(/^(Alex|Ben):\s*(.+)/);if(m)return{host:m[1],text:m[2]};return{host:'',text:line.replace(/^\*\*|\*\*$/g,'')};}).filter(l=>l.text.length>10);
//     const togglePlay=()=>{if(!isPlaying){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(script.replace(/\*\*/g,'').replace(/\n/g,' ').slice(0,1200));u.onend=()=>setIsPlaying(false);speechSynthesis.speak(u);setIsPlaying(true);}else{speechSynthesis.cancel();setIsPlaying(false);}};
//     return (
//         <div className="max-w-2xl mx-auto py-5 sm:py-7 px-3 sm:px-4">
//             <div className="rounded-2xl p-4 sm:p-6 text-white shadow-2xl mb-6" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                 <div className="flex items-center gap-3 mb-4">
//                     <div className="p-2 rounded-xl" style={{background:'rgba(255,255,255,0.15)'}}><Waves className="w-4 h-4 sm:w-5 sm:h-5"/></div>
//                     <div><p className="font-semibold text-sm sm:text-base">Audio Overview</p><p className="text-xs opacity-70">AI-generated podcast</p></div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                     <p className="text-xs opacity-60">Browser TTS · Preview</p>
//                     <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg font-bold text-base" style={{color:'#1e4976'}}>{isPlaying?'⏸':'▶'}</button>
//                 </div>
//             </div>
//             <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{color:'#0f2744'}}><Mic className="w-4 h-4" style={{color:'#2196c4'}}/> Transcript</h3>
//             <div className="space-y-2 sm:space-y-3">
//                 {lines.slice(0,30).map((line,i)=>{
//                     const L=line.host==='Alex'||line.host==='Host A';
//                     return (
//                         <div key={i} className={`flex gap-2 sm:gap-3 ${L?'':'flex-row-reverse'}`}>
//                             {line.host&&<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={L?{background:'#dbeafe',color:'#1e3a8a'}:{background:'#ede9fe',color:'#4c1d95'}}>{line.host[0]?.toUpperCase()}</div>}
//                             <div className={`flex-1 rounded-xl px-3 py-2 max-w-[92%] sm:max-w-[80%] ${L?'bg-slate-100 dark:bg-slate-800':'bg-blue-50 dark:bg-blue-950/30'}`}>
//                                 {line.host&&<span className="block mb-0.5 text-xs font-semibold" style={{color:'#2196c4'}}>{line.host}</span>}
//                                 <p className="text-xs sm:text-sm" style={{color:'inherit'}}>{line.text}</p>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// // ── CONTENT RENDERER ─────────────────────────────────────────────
// const ContentRenderer: React.FC<{content:string;title:string;isEditMode:boolean;onContentChange:(v:string)=>void}> = ({content,title,isEditMode,onContentChange}) => {
//     const hdr=(
//         <div className="mb-6 pb-4 sm:pb-5 border-b border-slate-200">
//             <h1 className="nb-h1 bg-clip-text text-transparent" style={{backgroundImage:'linear-gradient(135deg,#1e4976,#2196c4)'}}>{title}</h1>
//             <p className="nb-small mt-2 text-xs sm:text-sm">AI-generated from your selected knowledge sources</p>
//         </div>
//     );
//     if(isEditMode) return (
//         <div className="p-4 sm:p-6 lg:p-10">{hdr}
//             <Textarea className="w-full min-h-[400px] font-mono text-sm leading-relaxed bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 resize-y" value={content} onChange={e=>onContentChange(e.target.value)}/>
//         </div>
//     );
//     return <div className="p-3 sm:p-5 lg:p-8 w-full">{hdr}<div className="nb-prose" dangerouslySetInnerHTML={{__html: typeof content==="string" ? converter.makeHtml(content) : ""}}/></div>;
// };

// // ── PARSE HELPERS ─────────────────────────────────────────────────
// const parseFlashcards=(text:string):Flashcard[]=>{
//     const cards:Flashcard[]=[]; const blocks=text.split(/\n(?=Q:|Question:)/i);
//     for(const b of blocks){const q=b.match(/^(?:Q|Question)\s*\d*[:.]\s*(.+?)(?:\n|$)/i);const a=b.match(/(?:A|Answer)\s*\d*[:.]\s*([\s\S]+?)(?:\n\n|$)/i);if(q&&a)cards.push({question:q[1].trim(),answer:a[1].trim()});}
//     if(cards.length>0)return cards;
//     const lines=text.split('\n').filter(l=>l.trim());
//     for(let i=0;i<lines.length-1;i+=2){const q=lines[i].replace(/^\d+[\.\)]\s*|\*\*/g,'').trim();const a=lines[i+1].replace(/^\d+[\.\)]\s*|\*\*/g,'').trim();if(q&&a)cards.push({question:q,answer:a});}
//     return cards.slice(0,30);
// };
// const parseConceptMap=(text:string):ConceptNode[]=>{
//     const lines=text.split('\n').filter(l=>l.trim());const root:ConceptNode[]=[]; const stack:{node:ConceptNode;depth:number}[]=[];
//     for(const line of lines){
//         const s=line.replace(/^#+\s*/,'').replace(/^\*+\s*/,'').replace(/^-+\s*/,'').replace(/\*\*/g,'').trim();
//         if(!s||s.length<3)continue;
//         let d=0;if(/^#{3,}/.test(line))d=2;else if(/^#{2}/.test(line))d=1;else if(/^#/.test(line))d=0;else{const sp=line.match(/^(\s*)/)?.[1].length||0;d=Math.min(Math.floor(sp/2),3);}
//         const node:ConceptNode={id:`${d}-${s.slice(0,20)}-${Math.random()}`,label:s,children:[]};
//         if(d===0||stack.length===0){root.push(node);stack.length=0;stack.push({node,depth:d});}
//         else{while(stack.length>0&&stack[stack.length-1].depth>=d)stack.pop();if(stack.length>0){stack[stack.length-1].node.children=stack[stack.length-1].node.children||[];stack[stack.length-1].node.children!.push(node);}else root.push(node);stack.push({node,depth:d});}
//     }
//     return root;
// };

// // ════════════════════════════════════════════════════════════════
// const AINotebook: React.FC = () => {
//     useBranding();
//     const [sources,setSources] = useState<Source[]>([]);

//     useEffect(() => {
//         const saved = localStorage.getItem("nb_sources");
//         if (saved) setSources(JSON.parse(saved));
//     }, []);
//     useEffect(() => {
//         localStorage.setItem("nb_sources", JSON.stringify(sources));
//     }, [sources]);

//     const [isChatOpen,setIsChatOpen] = useState(false);
//     const [isMobileSourcesOpen,setIsMobileSourcesOpen] = useState(false);
//     const [chatMessages,setChatMessages] = useState<ChatMessage[]>([
//         {role:'system',content:"✨ Hi! I'm your AI Assistant. I've analyzed your knowledge base and I'm ready to help you learn smarter. What would you like to explore today?"}
//     ]);
//     const [currentInput,setCurrentInput] = useState('');
//     const [isGenerating,setIsGenerating] = useState(false);
//     const [loadingAction,setLoadingAction] = useState<string|null>(null);
//     const [generatedContent,setGeneratedContent] = useState<Record<string,string>>({});
//     const [activeNoteKey,setActiveNoteKey] = useState<string|null>(null);
//     const [activeTab,setActiveTab] = useState('guide');
//     const [isEditMode,setIsEditMode] = useState(false);
//     const [isLoadingSources,setIsLoadingSources] = useState(false);
//     const [selectedSourceCount,setSelectedSourceCount] = useState(0);
//     const [isSaving,setIsSaving] = useState(false);
//     const [saveToast,setSaveToast] = useState('');
//     const [notebookId,setNotebookId] = useState<string|null>(null);
//     const [isLoadingNotes,setIsLoadingNotes] = useState(true);

//     const navigate = useNavigate();
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     // FIX: use a plain div ref for chat scroll — ScrollArea doesn't forward refs to viewport
//     const chatScrollRef = useRef<HTMLDivElement>(null);
//     const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//     const isMobile = useMediaQuery('(max-width:768px)');
//     const isTablet = useMediaQuery('(min-width:769px) and (max-width:1024px)');
//     const isSmallDesktop = useMediaQuery('(min-width:1025px) and (max-width:1440px)');
//     const isDesktop = useMediaQuery('(min-width:1441px)');

//     // Chat auto-scroll — targets the plain div, not ScrollArea
//     useEffect(() => {
//         if (!isGenerating) return;
//         if (chatScrollRef.current) {
//             chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
//         }
//     }, [chatMessages, isGenerating]);

//     useEffect(()=>{setSelectedSourceCount(sources.filter(s=>s.selected).length);},[sources]);
//     useEffect(()=>{setIsMobileSourcesOpen(false);},[activeTab]);

//     // Access check
//     useEffect(()=>{
//         const check=async()=>{
//             const uType=sessionStorage.getItem('type'); const uRole=sessionStorage.getItem('role');
//             try{
//                 const res=await axios.get(`${serverURL}/api/settings`);
//                 if(res.data?.notebookEnabled){
//                     const s=res.data.notebookEnabled; let ok=false;
//                     if(uRole==='org_admin')ok=s.org_admin;else if(uRole==='student')ok=s.student;else ok=s[uType||'']||false;
//                     if(!ok){if(!['monthly','yearly','forever'].includes(uType||'')){navigate('/dashboard/pricing');return;}navigate('/dashboard');}
//                 }
//             }catch(e){console.error(e);}
//         };
//         check();
//     },[navigate]);

//     // Load saved notes
//     useEffect(()=>{
//         const load = async () => {
//             setIsLoadingNotes(true);
//             try {
//                 let userId = localStorage.getItem("nbUserId");
//                 if (!userId) { userId = Date.now().toString(); localStorage.setItem("nbUserId", userId); }
//                 const res = await axios.get(`${serverURL}/api/notebook/load`, { params: { userId } });
//                 if (res.data.success) {
//                     const notebooks = res.data.notebooks || [];
//                     if (notebooks.length > 0) {
//                         const first = notebooks[0];
//                         setNotebookId(first._id);
//                         setGeneratedContent(first.generatedContent || {});
//                         setSources(first.sources || []);
//                         setChatMessages(first.chatHistory?.length ? first.chatHistory : [{role:"system",content:"✨ Hi! I'm your AI Assistant 🚀"}]);
//                         const keys = Object.keys(first.generatedContent || {});
//                         if (keys.length > 0) setActiveNoteKey(keys[0]);
//                     }
//                 }
//             } catch(e) { console.log('No saved notebook'); }
//             finally { setIsLoadingNotes(false); }
//         };
//         load();
//     },[]);

//     // Auto-save 3s after change
//     useEffect(()=>{
//         if(Object.keys(generatedContent).length===0)return;
//         if(saveTimer.current)clearTimeout(saveTimer.current);
//         saveTimer.current=setTimeout(()=>saveNotes(false),3000);
//         return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};
//     },[generatedContent]);

//     const saveNotes = async (manual = false) => {
//         if (Object.keys(generatedContent).length === 0) return;
//         setIsSaving(true);
//         try {
//             let userId = localStorage.getItem("nbUserId");
//             if (!userId) { userId = Date.now().toString(); localStorage.setItem("nbUserId", userId); }
//             const res = await axios.post(`${serverURL}/api/notebook/save`, { userId, notebookId, generatedContent, sources, chatHistory: chatMessages });
//             if (res.data.success) {
//                 if (res.data.notebookId) setNotebookId(res.data.notebookId);
//                 if (manual) { setSaveToast('✓ Notes saved!'); setTimeout(()=>setSaveToast(''),2500); }
//             }
//         } catch(e) {
//             console.error("Save error:", e);
//             if (manual) { setSaveToast('⚠ Save failed'); setTimeout(()=>setSaveToast(''),2500); }
//         } finally { setIsSaving(false); }
//     };

//     const handleFileUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
//         const file=e.target.files?.[0];
//         if(!file)return;
//         setGeneratedContent({});
//         setChatMessages([{role:"system",content:"✨ New notebook started. Upload and generate fresh content 🚀"}]);
//         setNotebookId(null);
//         setSources([]);
//         setIsLoadingSources(true);
//         const fd=new FormData();
//         fd.append('file',file);
//         try{
//             const res=await axios.post(`${serverURL}/api/notebook/upload-source`,fd,{headers:{'Content-Type':'multipart/form-data'}});
//             if(res.data.success) setSources([{...res.data.source,selected:true}]);
//         }catch(e){ console.error(e); }
//         finally{ setIsLoadingSources(false); }
//         if(fileInputRef.current)fileInputRef.current.value='';
//     };

//     const toggleSrc=(id:string)=>setSources(p=>p.map(s=>s.id===id?{...s,selected:!s.selected}:s));

//     const sendChat=async()=>{
//         if(!currentInput.trim())return;
//         if(sources.filter(s=>s.selected).length===0){
//             setChatMessages(prev=>[...prev,{role:'system',content:'⚠️ Please select at least one source first.'}]);
//             return;
//         }
//         const uMsg:ChatMessage={role:'user',content:currentInput};
//         const msgs=[...chatMessages,uMsg];
//         setChatMessages(msgs);setCurrentInput('');setIsGenerating(true);
//         const ctx=sources.filter(s=>s.selected).map(s=>s.content).join('\n\n');
//         try{
//             const res=await axios.post(`${serverURL}/api/notebook/chat`,{messages:msgs.slice(1).map(m=>({role:m.role,content:m.content})),context:ctx});
//             if(res.data.success)setChatMessages(p=>[...p,{role:'system',content:res.data.generatedText}]);
//         }catch(err:any){
//             setChatMessages(p=>[...p,{role:'system',content:err?.response?.data?.message||'Error. Try again.'}]);
//         }
//         finally{ setIsGenerating(false); }
//     };

//     const genAction=async(action:string)=>{
//         if(sources.filter(s=>s.selected).length===0){setChatMessages(p=>[...p,{role:'system',content:'⚠️ Select at least one source first.'}]);setIsChatOpen(true);return;}
//         setActiveTab('notes');setActiveNoteKey(action);
//         if(generatedContent[action])return;
//         setIsGenerating(true);setLoadingAction(action);
//         const ctx=sources.filter(s=>s.selected).map(s=>s.content).join('\n\n');
//         try{
//             const res=await axios.post(`${serverURL}/api/notebook/generate-action`,{action,context:ctx});
//             if(res.data.success){setGeneratedContent(p=>({...p,[action]:res.data.generatedText}));setIsEditMode(false);}
//         }catch(e){console.error(e);}
//         finally{setIsGenerating(false);setLoadingAction(null);}
//     };

//     const srcIcon=(type:string)=>{
//         if(type==='pdf')return<FileType className="w-3.5 h-3.5 text-rose-500"/>;
//         if(type==='url')return<Globe className="w-3.5 h-3.5 text-sky-500"/>;
//         return<FileText className="w-3.5 h-3.5 text-slate-400"/>;
//     };

//     // ── SOURCES PANEL ─────────────────────────────────────────────
//     const SourcesPanel=()=>(
//         <Card className="h-full border-0 shadow-2xl rounded-2xl overflow-hidden flex flex-col" style={{background:'rgba(15,39,68,0.97)'}}>
//             <CardHeader className="px-4 py-4 border-b" style={{borderColor:'rgba(56,178,216,0.2)'}}>
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                             <Database className="w-4 h-4 text-white"/>
//                         </div>
//                         <div>
//                             <h2 className="font-semibold text-sm text-white">Knowledge Base</h2>
//                             <p className="text-xs mt-0.5" style={{color:'#67cde8'}}>{selectedSourceCount} selected · {sources.length} total</p>
//                         </div>
//                     </div>
//                     {/* Close button — always visible on non-desktop */}
//                     {!isDesktop && (
//                         <button onClick={()=>setIsMobileSourcesOpen(false)}
//                             className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors touch-manipulation">
//                             <X className="w-4 h-4 text-white/70"/>
//                         </button>
//                     )}
//                 </div>
//             </CardHeader>
//             <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
//                 <div className="p-3">
//                     <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} accept=".pdf,.txt,.md"/>
//                     <Button onClick={()=>fileInputRef.current?.click()} disabled={isLoadingSources}
//                         className="w-full rounded-xl py-4 text-white text-sm font-semibold hover:scale-[1.02] shadow-md touch-manipulation"
//                         style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                         {isLoadingSources?<Loader2 className="w-4 h-4 mr-2 animate-spin"/>:<Upload className="w-4 h-4 mr-2"/>} Upload Document
//                     </Button>
//                 </div>
//                 <ScrollArea className="flex-1 px-3 pb-3">
//                     {sources.length===0?(
//                         <div className="py-10 text-center">
//                             <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{background:'rgba(56,178,216,0.1)'}}>
//                                 <Cloud className="w-7 h-7" style={{color:'#38b2d8'}}/>
//                             </div>
//                             <p className="font-semibold text-sm text-white/80 mb-1">No sources yet</p>
//                             <p className="text-xs max-w-[180px] mx-auto" style={{color:'#67cde8'}}>Upload PDFs or documents to start your AI learning</p>
//                         </div>
//                     ):(
//                         <div className="space-y-2">
//                             {sources.map((src,i)=>(
//                                 <motion.div key={src.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
//                                     onClick={()=>toggleSrc(src.id)}
//                                     className="relative p-3 rounded-xl cursor-pointer transition-all group touch-manipulation"
//                                     style={src.selected?{background:'rgba(33,150,196,0.18)',border:'2px solid rgba(56,178,216,0.6)'}:{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}>
//                                     <div className="flex items-start gap-2">
//                                         <div className="mt-0.5 shrink-0">
//                                             {src.selected
//                                                 ?<div className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}><CheckCircle2 className="w-3 h-3 text-white"/></div>
//                                                 :<div className="w-5 h-5 rounded-full border-2" style={{borderColor:'rgba(255,255,255,0.3)'}}/>}
//                                         </div>
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex items-center gap-1.5 mb-0.5">{srcIcon(src.type)}<p className="font-semibold truncate text-xs" style={{color:'#e0f2fe'}}>{src.title}</p></div>
//                                             <p className="text-xs" style={{color:'#67cde8'}}>{src.words.toLocaleString()} words · {src.type.toUpperCase()}</p>
//                                         </div>
//                                         <button onClick={e=>{e.stopPropagation();setSources(p=>p.filter(s=>s.id!==src.id));}}
//                                             className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all touch-manipulation"
//                                             style={{opacity: 1}}>
//                                             <Trash2 className="w-3 h-3"/>
//                                         </button>
//                                     </div>
//                                     {src.selected&&<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl" style={{background:'linear-gradient(90deg,#1e4976,#38b2d8)'}}/>}
//                                 </motion.div>
//                             ))}
//                         </div>
//                     )}
//                 </ScrollArea>
//             </CardContent>
//         </Card>
//     );

//     // ── CHAT PANEL ─────────────────────────────────────────────────
//     // FIX: replaced ScrollArea with a plain overflow div so ref works for auto-scroll
//     const ChatPanel=()=>(
//         <Card className="h-full border-0 shadow-2xl rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900">
//             <CardHeader className="px-4 py-3 border-b border-slate-100 shrink-0" style={{background:'linear-gradient(135deg,rgba(30,73,118,0.05),rgba(33,150,196,0.05))'}}>
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                             <Bot className="w-4 h-4 text-white"/>
//                         </div>
//                         <div>
//                             <h2 className="font-semibold text-sm" style={{color:'#0f2744'}}>AI Assistant</h2>
//                             <p className="text-xs text-slate-500">Powered by your sources</p>
//                         </div>
//                     </div>
//                     {!isDesktop && (
//                         <button onClick={()=>setIsChatOpen(false)}
//                             className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 touch-manipulation">
//                             <X className="w-4 h-4 text-slate-500"/>
//                         </button>
//                     )}
//                 </div>
//             </CardHeader>

//             {/* FIX: plain div with overflow-y-auto — ref now correctly targets the scroll container */}
//             <div
//                 ref={chatScrollRef}
//                 className="flex-1 overflow-y-auto p-3 sm:p-4"
//                 style={{WebkitOverflowScrolling:'touch'}}
//             >
//                 <div className="space-y-3">
//                     {chatMessages.map((msg,i)=>(
//                         <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
//                             <div className={`max-w-[95%] sm:max-w-[85%] rounded-2xl px-3 py-2.5 shadow-sm ${msg.role==='user'?'rounded-br-md':'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md'}`}
//                                 style={msg.role==='user'?{background:'linear-gradient(135deg,#1e4976,#2196c4)'}:{}}>
//                                 {msg.role==='system'
//                                     ?<div className="nb-body prose prose-sm max-w-none text-xs sm:text-sm" dangerouslySetInnerHTML={{__html:converter.makeHtml(msg.content)}}/>
//                                     :<p className="text-xs sm:text-sm" style={{color:'#ffffff'}}>{msg.content}</p>}
//                             </div>
//                         </motion.div>
//                     ))}
//                     {isGenerating&&(
//                         <div className="flex justify-start">
//                             <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-slate-100 border border-slate-200 flex items-center gap-2">
//                                 <Loader2 className="w-3.5 h-3.5 animate-spin" style={{color:'#2196c4'}}/>
//                                 <span className="text-xs text-slate-500">Thinking…</span>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Quick chips */}
//             {chatMessages.length<=2&&(
//                 <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
//                     {SUGGESTED_QUESTIONS.slice(0,2).map(q=>(
//                         <button key={q} onClick={()=>setCurrentInput(q)}
//                             className="px-2.5 py-1.5 rounded-full text-xs border transition-all hover:opacity-80 touch-manipulation"
//                             style={{background:'rgba(33,150,196,0.08)',borderColor:'rgba(33,150,196,0.25)',color:'#1e4976'}}>
//                             {q}
//                         </button>
//                     ))}
//                 </div>
//             )}

//             {/* FIX: textarea with 16px font to prevent iOS zoom; resize:none; safe-area padding */}
//             <CardFooter className="p-3 border-t border-slate-100 nb-chat-footer shrink-0">
//                 <div className="w-full">
//                     <div className="flex gap-2 items-end">
//                         <textarea
//                             value={currentInput}
//                             onChange={(e)=>setCurrentInput(e.target.value)}
//                             onKeyDown={(e)=>{
//                                 if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}
//                             }}
//                             placeholder="Type your question…"
//                             className="nb-chat-textarea flex-1"
//                             rows={1}
//                         />
//                         <Button onClick={sendChat} disabled={!currentInput.trim()||isGenerating}
//                             className="shrink-0 w-11 h-11 rounded-xl text-white p-0 shadow-md touch-manipulation"
//                             style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                             {isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
//                         </Button>
//                     </div>
//                     <p className="text-xs text-slate-400 mt-1 text-center">Shift+Enter for new line</p>
//                 </div>
//             </CardFooter>
//         </Card>
//     );

//     // ── COMPUTE CHAT PANEL CLASS — clean, explicit per breakpoint ──
//     const getChatPanelClass = () => {
//         if (isMobile)        return 'fixed inset-0 z-50 p-2';
//         if (isTablet)        return 'fixed inset-y-0 right-0 w-[340px] z-40 p-3';
//         if (isSmallDesktop)  return 'fixed inset-y-0 right-0 w-[380px] z-40 p-3';
//         return 'w-[400px] shrink-0'; // isDesktop
//     };

//     return (
//         <>
//             <style dangerouslySetInnerHTML={{__html:DESIGN_SYSTEM}}/>

//             <AnimatePresence>
//                 {saveToast&&(
//                     <motion.div className="nb-save-toast" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>
//                         <CheckCheck className="w-3.5 h-3.5"/> {saveToast}
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <div className="min-h-screen" style={{background:'linear-gradient(135deg,#f0f9ff 0%,#e8f4fd 50%,#edfafd 100%)'}}>
//                 <div className="relative flex flex-col lg:flex-row min-h-screen w-full gap-2 sm:gap-3 p-1 sm:p-2 lg:p-4">

//                     {/* Desktop sidebar — only render when truly desktop */}
//                     {isDesktop && (
//                         <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.4}} className="w-72 xl:w-80 shrink-0">
//                             <SourcesPanel/>
//                         </motion.div>
//                     )}

//                     {/* Tablet / small-desktop — slide-in overlay */}
//                     {(isSmallDesktop||isTablet) && (
//                         <AnimatePresence>
//                             {isMobileSourcesOpen && (
//                                 <>
//                                     <motion.div
//                                         initial={{opacity:0,x:-300}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-300}}
//                                         transition={{duration:0.3}}
//                                         className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl p-3">
//                                         <SourcesPanel/>
//                                     </motion.div>
//                                     <div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setIsMobileSourcesOpen(false)}/>
//                                 </>
//                             )}
//                         </AnimatePresence>
//                     )}

//                     {/* Mobile — bottom sheet */}
//                     {isMobile && (
//                         <Sheet open={isMobileSourcesOpen} onOpenChange={setIsMobileSourcesOpen}>
//                             <SheetContent side="left" className="w-[85vw] max-w-[300px] p-0 bg-transparent border-0">
//                                 <div className="h-full p-2"><SourcesPanel/></div>
//                             </SheetContent>
//                         </Sheet>
//                     )}

//                     {/* ── MAIN CONTENT ─────────────────────────────────────── */}
//                     <motion.div
//                         initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}}
//                         className="flex-1 min-w-0"
//                         // FIX: on mobile, hide main when chat is open (instead of using hidden class conditionally)
//                         style={{display:(isMobile&&isChatOpen)?'none':'flex',flexDirection:'column'}}
//                     >
//                         <Card className="flex-1 border-0 shadow-2xl rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900">

//                             {/* ── HEADER ───────────────────────────────────────── */}
//                             <CardHeader className="px-3 sm:px-5 py-2 sm:py-3 border-b shrink-0"
//                                 style={{background:'linear-gradient(135deg,#0f2744,#1e4976)',borderColor:'rgba(56,178,216,0.2)'}}>
//                                 <div className="flex items-center justify-between gap-2 min-w-0">

//                                     {/* Left: icon + title */}
//                                     <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//                                         <div className="p-1.5 sm:p-2 rounded-xl shrink-0" style={{background:'rgba(255,255,255,0.15)'}}>
//                                             <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
//                                         </div>
//                                         <div className="min-w-0">
//                                             <h1 className="font-bold text-sm sm:text-base leading-tight truncate" style={{color:'#ffffff'}}>Neural Notebook</h1>
//                                             {/* FIX: removed xs: breakpoint — use sm: instead */}
//                                             <p className="text-xs hidden sm:block truncate" style={{color:'#67cde8'}}>
//                                                 {selectedSourceCount} source{selectedSourceCount!==1?'s':''} · {isLoadingNotes?'Loading…':Object.keys(generatedContent).length+' notes saved'}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Right: action buttons */}
//                                     <div className="flex items-center gap-1 shrink-0">
//                                         {Object.keys(generatedContent).length>0 && (
//                                             <button onClick={()=>saveNotes(true)} disabled={isSaving}
//                                                 className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-white/20 touch-manipulation"
//                                                 style={{background:'rgba(255,255,255,0.1)',color:'#a8e4f3',border:'1px solid rgba(255,255,255,0.15)'}}>
//                                                 {isSaving?<Loader2 className="w-3 h-3 animate-spin"/>:<Save className="w-3 h-3"/>}
//                                                 <span className="hidden sm:inline ml-0.5">{isSaving?'Saving…':'Save'}</span>
//                                             </button>
//                                         )}
//                                         {/* Sources button — visible on all non-desktop */}
//                                         {!isDesktop && (
//                                             <button onClick={()=>setIsMobileSourcesOpen(true)}
//                                                 className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-white/20 touch-manipulation"
//                                                 style={{background:'rgba(255,255,255,0.1)',color:'#a8e4f3',border:'1px solid rgba(255,255,255,0.15)'}}>
//                                                 <Database className="w-3 h-3"/>
//                                                 <span className="ml-0.5">{selectedSourceCount}</span>
//                                             </button>
//                                         )}
//                                         <button onClick={()=>setIsChatOpen(!isChatOpen)}
//                                             className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-medium touch-manipulation ${isChatOpen?'nb-chat-active':'nb-chat-inactive'}`}>
//                                             <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
//                                             <span className="hidden sm:inline">{isChatOpen?'Hide Chat':'Chat'}</span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             </CardHeader>

//                             {/* ── TABS ─────────────────────────────────────────── */}
//                             <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
//                                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
//                                     <div className="px-3 sm:px-5 pt-3 border-b border-slate-100 shrink-0">
//                                         <TabsList className="p-1 rounded-xl gap-1 h-auto" style={{background:'rgba(15,39,68,0.06)'}}>
//                                             <TabsTrigger value="guide"
//                                                 className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:font-semibold transition-all touch-manipulation">
//                                                 <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5"/>
//                                                 <span className="hidden sm:inline">Learning Studio</span>
//                                                 <span className="sm:hidden">Studio</span>
//                                             </TabsTrigger>
//                                             <TabsTrigger value="notes"
//                                                 className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:font-semibold transition-all touch-manipulation">
//                                                 <NotebookPen className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5"/>
//                                                 My Notes
//                                                 {Object.keys(generatedContent).length>0 && (
//                                                     <span className="ml-1 px-1.5 py-0.5 rounded-full text-white text-xs font-bold" style={{background:'#2196c4'}}>
//                                                         {Object.keys(generatedContent).length}
//                                                     </span>
//                                                 )}
//                                             </TabsTrigger>
//                                         </TabsList>
//                                     </div>

//                                     {/* FIX: removed ScrollArea wrapper — use plain overflow div for correct height */}
//                                     <div className="flex-1 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>

//                                         {/* ── LEARNING STUDIO ─────────────────────────── */}
//                                         <TabsContent value="guide" className="p-3 sm:p-5 m-0">
//                                             {isLoadingNotes && (
//                                                 <div className="flex items-center gap-2 mb-4 p-3 rounded-xl text-xs" style={{background:'rgba(33,150,196,0.08)',color:'#1e4976'}}>
//                                                     <Loader2 className="w-3.5 h-3.5 animate-spin"/> Loading your saved notes…
//                                                 </div>
//                                             )}

//                                             {/* Audio Hero */}
//                                             <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-2xl relative overflow-hidden"
//                                                 style={{background:'linear-gradient(135deg,rgba(30,73,118,0.07),rgba(33,150,196,0.1))',border:'1px solid rgba(33,150,196,0.2)'}}>
//                                                 <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
//                                                     <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                                                         <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
//                                                     </div>
//                                                     <div className="flex-1 text-center sm:text-left">
//                                                         <h2 className="nb-h2 mb-0.5 text-sm sm:text-base" style={{color:'#0f2744'}}>Generate Audio Overview</h2>
//                                                         <p className="nb-body text-xs sm:text-sm">Transform sources into an engaging podcast-style discussion.</p>
//                                                     </div>
//                                                     <Button onClick={()=>genAction("Audio Overview")} disabled={isGenerating||selectedSourceCount===0}
//                                                         className="rounded-xl text-white text-xs sm:text-sm px-4 py-3 sm:py-4 w-full sm:w-auto shadow-lg touch-manipulation"
//                                                         style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                                                         {isGenerating?<Loader2 className="w-3.5 h-3.5 mr-2 animate-spin"/>:<Headphones className="w-3.5 h-3.5 mr-2"/>} Generate
//                                                     </Button>
//                                                 </div>
//                                             </div>

//                                             {/* Quick Actions */}
//                                             <div className="mb-5 sm:mb-6">
//                                                 <SH icon={Zap} label="AI-Powered Actions" sub="Click any action to generate content in My Notes"/>
//                                                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
//                                                     {QUICK_ACTIONS.map((action,i)=>{
//                                                         const loading=loadingAction===action.title;
//                                                         const done=!!generatedContent[action.title];
//                                                         return (
//                                                             <motion.div key={action.title} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
//                                                                 onClick={()=>!isGenerating&&selectedSourceCount>0&&genAction(action.title)}
//                                                                 className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group touch-manipulation ${loading?'ring-2 shadow-md':''} ${(isGenerating&&!loading)||selectedSourceCount===0?'opacity-50 pointer-events-none':''}`}
//                                                                 style={{background:action.bg,border:done?'1.5px solid rgba(33,150,196,0.4)':'1px solid rgba(33,150,196,0.12)'}}>
//                                                                 <div className="flex items-start justify-between mb-2">
//                                                                     <div className={`p-2 rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm`}>
//                                                                         {loading?<Loader2 className="w-3.5 h-3.5 text-white animate-spin"/>:<action.icon className="w-3.5 h-3.5 text-white"/>}
//                                                                     </div>
//                                                                     {done?<CheckCheck className="w-3.5 h-3.5" style={{color:'#2196c4'}}/>
//                                                                         :loading?<span className="text-xs animate-pulse" style={{color:'#2196c4'}}>…</span>
//                                                                         :<ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100"/>}
//                                                                 </div>
//                                                                 <h3 className="font-semibold text-xs sm:text-sm mb-0.5" style={{color:'#0f2744'}}>{action.title}</h3>
//                                                                 <p className="text-xs text-slate-500 hidden sm:block">{action.desc}</p>
//                                                             </motion.div>
//                                                         );
//                                                     })}
//                                                 </div>
//                                             </div>

//                                             {/* Suggested Questions */}
//                                             <div>
//                                                 <SH icon={Lightbulb} label="Suggested Questions" sub="Click to send to AI chat"/>
//                                                 <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                                                     {SUGGESTED_QUESTIONS.map((q,i)=>(
//                                                         <motion.button key={q} initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}}
//                                                             onClick={()=>{setCurrentInput(q);if(!isChatOpen)setIsChatOpen(true);}}
//                                                             className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all hover:shadow-sm touch-manipulation"
//                                                             style={{background:'white',border:'1px solid rgba(33,150,196,0.25)',color:'#1e4976'}}>
//                                                             {q}
//                                                         </motion.button>
//                                                     ))}
//                                                 </div>
//                                             </div>

//                                             {/* Bottom padding to clear FABs on mobile */}
//                                             <div className="h-20 sm:h-4"/>
//                                         </TabsContent>

//                                         {/* ── MY NOTES ────────────────────────────────── */}
//                                         <TabsContent value="notes" className="p-0 m-0 flex flex-col h-full">

//                                             {/* Sticky notes toolbar */}
//                                             <div className="sticky top-0 z-20 px-3 sm:px-5 py-2.5 border-b border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
//                                                 <div className="flex items-center gap-2 min-w-0 flex-1">
//                                                     <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                                                         <NotebookPen className="w-3 h-3 text-white"/>
//                                                     </div>
//                                                     <span className="font-semibold text-xs sm:text-sm" style={{color:'#0f2744'}}>My Notes</span>
//                                                     {loadingAction && <span className="hidden sm:flex items-center gap-1 text-xs animate-pulse" style={{color:'#2196c4'}}><Loader2 className="w-3 h-3 animate-spin"/> Generating {loadingAction}…</span>}
//                                                     {isSaving && <span className="flex items-center gap-1 text-xs" style={{color:'#2196c4'}}><Loader2 className="w-3 h-3 animate-spin"/> Saving…</span>}
//                                                 </div>
//                                                 {activeNoteKey && generatedContent[activeNoteKey] && (
//                                                     <div className="flex p-0.5 rounded-xl gap-0.5 shrink-0" style={{background:'rgba(15,39,68,0.06)'}}>
//                                                         {[{label:'Preview',icon:BookOpen,val:false},{label:'Edit',icon:FileType,val:true}].map(btn=>(
//                                                             <button key={btn.label} onClick={()=>setIsEditMode(btn.val)}
//                                                                 className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation"
//                                                                 style={isEditMode===btn.val?{background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',color:'#0f2744'}:{color:'#64748b'}}>
//                                                                 <btn.icon className="w-3 h-3"/>
//                                                                 <span className="hidden sm:inline ml-1">{btn.label}</span>
//                                                             </button>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                             </div>

//                                             {/* FIX: note tab bar uses custom CSS class for horizontal scroll */}
//                                             {Object.keys(generatedContent).length > 0 && (
//                                                 <div className="nb-tab-bar shrink-0">
//                                                     {[{title:'Audio Overview',icon:Waves},...QUICK_ACTIONS]
//                                                         .filter(a=>generatedContent[a.title]||loadingAction===a.title)
//                                                         .map(action=>{
//                                                             const active=activeNoteKey===action.title;
//                                                             const loading=loadingAction===action.title;
//                                                             return (
//                                                                 <button key={action.title} onClick={()=>setActiveNoteKey(action.title)}
//                                                                     className="flex items-center gap-1 px-2 sm:px-3 py-2 border-b-2 text-xs font-medium whitespace-nowrap transition-all shrink-0 touch-manipulation"
//                                                                     style={active?{borderColor:'#2196c4',color:'#1e4976'}:{borderColor:'transparent',color:'#64748b'}}>
//                                                                     {loading?<Loader2 className="w-3 h-3 animate-spin"/>:<action.icon className="w-3 h-3"/>}
//                                                                     <span className="ml-1">{action.title}</span>
//                                                                     {generatedContent[action.title] && <span className="w-1.5 h-1.5 rounded-full ml-1" style={{background:'#2196c4'}}/>}
//                                                                 </button>
//                                                             );
//                                                         })}
//                                                 </div>
//                                             )}

//                                             <div className="flex-1 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>
//                                                 {Object.keys(generatedContent).length===0 && !loadingAction && (
//                                                     <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
//                                                         <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4" style={{background:'linear-gradient(135deg,rgba(30,73,118,0.07),rgba(33,150,196,0.1))'}}>
//                                                             <NotebookPen className="w-8 h-8 sm:w-10 sm:h-10" style={{color:'#2196c4'}}/>
//                                                         </div>
//                                                         <h2 className="nb-h2 mb-2 text-sm sm:text-base" style={{color:'#0f2744'}}>Your notebook is empty</h2>
//                                                         <p className="nb-body text-xs sm:text-sm max-w-[260px]">
//                                                             Go to <span className="font-semibold" style={{color:'#2196c4'}}>Learning Studio</span> and click any action. Notes auto-save to your account.
//                                                         </p>
//                                                         <Button size="sm" variant="outline" onClick={()=>setActiveTab('guide')}
//                                                             className="mt-4 rounded-xl text-xs sm:text-sm touch-manipulation" style={{borderColor:'rgba(33,150,196,0.4)',color:'#1e4976'}}>
//                                                             <Compass className="w-3 h-3 mr-1.5"/> Go to Learning Studio
//                                                         </Button>
//                                                     </div>
//                                                 )}
//                                                 {activeNoteKey && (
//                                                     <>
//                                                         {loadingAction===activeNoteKey && !generatedContent[activeNoteKey] ? (
//                                                             <div className="flex flex-col items-center justify-center py-16 text-center">
//                                                                 <Loader2 className="w-8 h-8 animate-spin mb-4" style={{color:'#2196c4'}}/>
//                                                                 <p className="nb-body text-xs sm:text-sm">Generating {activeNoteKey}…</p>
//                                                             </div>
//                                                         ) : generatedContent[activeNoteKey] ? (()=>{
//                                                             const c=generatedContent[activeNoteKey];
//                                                             if(activeNoteKey==='Flashcards'){const cards=parseFlashcards(c);return cards.length>0?<FlashcardViewer cards={cards}/>:<div className="p-8 text-center nb-body text-xs">Could not parse flashcards. Switch to Edit mode.</div>;}
//                                                             if(activeNoteKey==='Concept Map'){const nodes=parseConceptMap(c);return(<div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto"><div className="mb-6 pb-4 border-b border-slate-200"><h1 className="nb-h1 bg-clip-text text-transparent" style={{backgroundImage:'linear-gradient(135deg,#1e4976,#2196c4)'}}>Concept Map</h1><p className="nb-small mt-2 text-xs sm:text-sm">Visual connections between key ideas</p></div>{nodes.length>0?<ConceptMapRenderer nodes={nodes}/>:<p className="nb-body text-xs">Could not parse.</p>}</div>);}
//                                                             if(activeNoteKey==='Audio Overview')return<AudioPlayer script={c}/>;
//                                                             return<ContentRenderer content={c} title={activeNoteKey} isEditMode={isEditMode} onContentChange={v=>setGeneratedContent(p=>({...p,[activeNoteKey]:v}))}/>;
//                                                         })() : null}
//                                                     </>
//                                                 )}
//                                                 {/* Bottom padding to clear FABs */}
//                                                 <div className="h-20 sm:h-4"/>
//                                             </div>
//                                         </TabsContent>
//                                     </div>
//                                 </Tabs>
//                             </CardContent>
//                         </Card>
//                     </motion.div>

//                     {/* ── CHAT PANEL ───────────────────────────────────── */}
//                     <AnimatePresence>
//                         {isChatOpen && (
//                             <motion.div
//                                 initial={{opacity:0, x: isMobile ? 300 : 80, scale: isMobile ? 1 : 0.97}}
//                                 animate={{opacity:1, x:0, scale:1}}
//                                 exit={{opacity:0, x: isMobile ? 300 : 80, scale: isMobile ? 1 : 0.97}}
//                                 transition={{duration:0.3, type:'spring', stiffness:300, damping:28}}
//                                 className={getChatPanelClass()}
//                             >
//                                 <ChatPanel/>
//                                 {/* Backdrop for non-desktop */}
//                                 {!isDesktop && (
//                                     <div className="fixed inset-0 bg-black/40 -z-10" onClick={()=>setIsChatOpen(false)}/>
//                                 )}
//                             </motion.div>
//                         )}
//                     </AnimatePresence>

//                     {/* ── MOBILE FABs ───────────────────────────────────── */}
//                     {/* FIX: use dedicated CSS classes to keep left/right FABs from overlapping */}
//                     {!isDesktop && !isChatOpen && (
//                         <button
//                             onClick={()=>setIsChatOpen(true)}
//                             className="nb-fab-right w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white touch-manipulation"
//                             style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
//                             <MessageSquare className="w-5 h-5"/>
//                         </button>
//                     )}
//                     {isMobile && !isMobileSourcesOpen && (
//                         <button
//                             onClick={()=>setIsMobileSourcesOpen(true)}
//                             className="nb-fab-left w-12 h-12 rounded-full shadow-xl flex items-center justify-center touch-manipulation"
//                             style={{background:'#0f2744',border:'2px solid rgba(56,178,216,0.4)'}}>
//                             <Database className="w-5 h-5" style={{color:'#38b2d8'}}/>
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default AINotebook;

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
    FileText, Upload, MessageSquare, BookOpen, BrainCircuit, Send,
    Trash2, FileType, CheckCircle2, ChevronRight, Lightbulb, Headphones,
    Layers, Loader2, Mic, Zap, Compass, Globe, Database, Cloud, Bot,
    GraduationCap, NotebookPen, Waves, X,
    ChevronLeft, RotateCcw, ThumbsUp, ThumbsDown, Save, CheckCheck, Eye
} from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { serverURL } from '@/constants';
import showdown from 'showdown';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ── DESIGN TOKENS ──────────────────────────────────────────────
const DESIGN_SYSTEM = `
  :root {
    --nb-brand-900: #0f2744;
    --nb-brand-800: #1a3a5c;
    --nb-brand-700: #1e4976;
    --nb-brand-600: #1d6fa4;
    --nb-brand-500: #2196c4;
    --nb-brand-400: #38b2d8;
    --nb-brand-300: #67cde8;
    --nb-brand-200: #a8e4f3;
    --nb-brand-100: #d9f3fb;
    --nb-brand-50:  #f8fbff;
    --nb-accent:    #2196c4;
    --nb-muted:     #64748b;
    --nb-strong:    #1e293b;
    --nb-surface:   #ffffff;
    --nb-border:    #e8edf2;
    --nb-h1: 1.75rem; --nb-h1-weight:700; --nb-h1-lh:1.2;
    --nb-h2: 1.25rem; --nb-h2-weight:600; --nb-h2-lh:1.3;
    --nb-h3: 1rem;    --nb-h3-weight:600; --nb-h3-lh:1.4;
    --nb-body: 0.875rem; --nb-body-lh:1.6;
    --nb-small:0.75rem;  --nb-small-weight:500;
    --nb-xs:0.6875rem;
  }
  .dark {
    --nb-strong: #e2f4fb;
    --nb-muted:  #94a3b8;
    --nb-surface: #0f172a;
    --nb-border: #1e293b;
  }
  .nb-h1 { font-size:var(--nb-h1);font-weight:var(--nb-h1-weight);line-height:var(--nb-h1-lh);letter-spacing:-0.025em;color:var(--nb-strong); }
  .nb-h2 { font-size:var(--nb-h2);font-weight:var(--nb-h2-weight);line-height:var(--nb-h2-lh);letter-spacing:-0.015em;color:var(--nb-strong); }
  .nb-h3 { font-size:var(--nb-h3);font-weight:var(--nb-h3-weight);line-height:var(--nb-h3-lh);color:var(--nb-strong); }
  .nb-body { font-size:var(--nb-body);line-height:var(--nb-body-lh);color:var(--nb-muted); }
  .nb-small { font-size:var(--nb-small);font-weight:var(--nb-small-weight);color:var(--nb-muted); }
  .nb-xs { font-size:var(--nb-xs);color:var(--nb-muted); }

  /* Prose */
  .nb-prose { width:100%;max-width:100%; }
  .nb-prose h1{font-size:var(--nb-h1);font-weight:700;margin:1.75rem 0 0.875rem;color:var(--nb-strong);}
  .nb-prose h2{font-size:var(--nb-h2);font-weight:600;margin:1.5rem 0 0.625rem;color:var(--nb-accent);}
  .nb-prose h3{font-size:var(--nb-h3);font-weight:600;margin:1.25rem 0 0.5rem;color:var(--nb-strong);}
  .nb-prose p{font-size:var(--nb-body);line-height:var(--nb-body-lh);color:var(--nb-muted);margin-bottom:0.875rem;overflow-wrap:anywhere;word-break:break-word;}
  .nb-prose ul,.nb-prose ol{padding-left:1.5rem;margin-bottom:0.875rem;}
  .nb-prose li{font-size:var(--nb-body);line-height:var(--nb-body-lh);color:var(--nb-muted);margin-bottom:0.375rem;overflow-wrap:anywhere;word-break:break-word;}
  .nb-prose strong{color:var(--nb-strong);font-weight:600;}
  .nb-prose blockquote{border-left:3px solid var(--nb-accent);padding:0.75rem 1.25rem;background:rgba(33,150,196,0.06);border-radius:0 0.5rem 0.5rem 0;margin:1.25rem 0;font-style:italic;}
  .nb-prose table{width:100%;max-width:100%;display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;border-collapse:collapse;margin:1.5rem 0;font-size:var(--nb-small);}
  .nb-prose th{background:rgba(33,150,196,0.08);padding:0.625rem 1rem;text-align:left;font-weight:600;color:var(--nb-strong);border-bottom:2px solid rgba(33,150,196,0.15);}
  .nb-prose td{padding:0.5rem 1rem;border-bottom:1px solid rgba(33,150,196,0.08);color:var(--nb-muted);white-space:normal;overflow-wrap:anywhere;word-break:break-word;}
  .nb-prose th{white-space:normal;overflow-wrap:anywhere;word-break:break-word;}
  .nb-prose pre,.nb-prose code{max-width:100%;overflow-x:auto;white-space:pre-wrap;word-break:break-word;}
  .nb-prose pre{padding:0.9rem 1rem;border-radius:0.875rem;background:#0f172a;color:#e2e8f0;}
  .nb-prose img,.nb-prose iframe,.nb-prose video{max-width:100%;height:auto;border-radius:0.75rem;}

  /* Components */
  .nb-badge-progress{background:var(--nb-accent)!important;color:#fff!important;font-size:var(--nb-xs);font-weight:600;padding:0.2rem 0.65rem;border-radius:999px;display:inline-flex;align-items:center;}
  .nb-chat-active{background:#1e4976!important;color:#fff!important;border-color:#1e4976!important;box-shadow:0 2px 8px rgba(30,73,118,0.3);}
  .nb-chat-active svg{color:#fff!important;stroke:#fff!important;}
  .nb-chat-inactive{background:#f1f5f9;color:#475569;border-color:#e2e8f0;}
  .nb-chat-inactive:hover{background:#e2e8f0;}
  .nb-save-toast{position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:0.5rem 1.25rem;border-radius:999px;font-size:0.75rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);}

  /* ── FLASHCARD — simplified reveal design ──────────────── */
  .fc-question-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 1.25rem;
    padding: 2rem 1.75rem;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .fc-answer-reveal {
    background: #f0fdf4;
    border: 1.5px solid #86efac;
    border-radius: 1.25rem;
    padding: 1.75rem;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(34,197,94,0.08);
    margin-top: 0.875rem;
  }
  .fc-reveal-btn {
    width: 100%;
    padding: 0.875rem;
    font-size: 0.9rem;
    border-radius: 1rem;
    border: 1.5px dashed #94a3b8;
    background: #f8fafc;
    color: #475569;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.875rem;
  }
  .fc-reveal-btn:hover { background: #f1f5f9; border-color: #64748b; color: #334155; }

  /* Chat textarea */
  .nb-chat-textarea {
    font-size: 16px !important;
    -webkit-appearance: none;
    appearance: none;
    resize: none;
    min-height: 44px;
    max-height: 120px;
    overflow-y: auto;
    line-height: 1.5;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 10px 12px;
    width: 100%;
    outline: none;
    font-family: inherit;
    color: #1e293b;
    background: #f8fafc;
    transition: border-color 0.2s, background 0.2s;
  }
  .nb-chat-textarea:focus { border-color: #2196c4; background: #fff; }
  .dark .nb-chat-textarea { background:#1e293b; color:#e2f4fb; border-color:#334155; }

  /* Notes tab bar */
 .nb-tab-bar {
  display: flex;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  padding: 0 8px;
  min-width: 0;
}
.nb-tab-bar::-webkit-scrollbar { display: none; }

  /* FABs */
  .nb-fab-right { position:fixed;bottom:1.25rem;right:1rem;z-index:40; }
  .nb-fab-left  { position:fixed;bottom:1.25rem;left:1rem;z-index:40; }

  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .nb-fab-right, .nb-fab-left {
      bottom: calc(1.25rem + env(safe-area-inset-bottom));
    }
    .nb-chat-footer {
      padding-bottom: calc(0.75rem + env(safe-area-inset-bottom)) !important;
    }
  }

  @media(max-width:480px){
    .nb-h1  { font-size:1.3rem; }
    .nb-h2  { font-size:1rem; }
  .nb-prose { padding:0 4px; }
    .nb-prose h1 { font-size:1.2rem; }
    .nb-prose h2 { font-size:1rem; }
    .nb-prose p  { font-size:13px;line-height:1.5; }
    .nb-prose table { font-size:12px; }
    .nb-prose th, .nb-prose td { padding:0.45rem 0.65rem; }
  .fc-question-card { padding:1.5rem 1.25rem; min-height:140px; }
    .fc-answer-reveal { padding:1.25rem; }
  }
`;

const converter = new showdown.Converter({tables:true,tasklists:true,strikethrough:true,ghCodeBlocks:true,simplifiedAutoLink:true});

interface Source { id:string;title:string;type:'pdf'|'url'|'text';content:string;words:number;selected:boolean; }
interface ChatMessage { role:'user'|'system';content:string;timestamp?:Date; }
interface Flashcard { question:string;answer:string; }
interface ConceptNode { id:string;label:string;children?:ConceptNode[]; }

const SUGGESTED_QUESTIONS = [
    "Key insights from my sources?",
    "Summary table of main concepts",
    "Practice questions for review",
    "Connect ideas across documents"
];

const QUICK_ACTIONS = [
    { title:'Study Guide',   desc:'Structured learning path', icon:GraduationCap, color:'#0ea5e9', bg:'#f0f9ff' },
    { title:'Smart Summary', desc:'AI-powered synthesis',     icon:Zap,            color:'#6366f1', bg:'#f5f3ff' },
    { title:'Concept Map',   desc:'Visual connections',       icon:Compass,        color:'#8b5cf6', bg:'#faf5ff' },
    { title:'Q&A Bank',      desc:'Test your knowledge',      icon:MessageSquare,  color:'#10b981', bg:'#f0fdf4' },
    { title:'Flashcards',    desc:'Active recall',            icon:Layers,         color:'#f59e0b', bg:'#fffbeb' },
    { title:'Briefing Doc',  desc:'Executive overview',       icon:FileText,       color:'#ef4444', bg:'#fff5f5' },
];

const SH: React.FC<{icon:React.ElementType;label:string;sub?:string}> = ({icon:Icon,label,sub}) => (
    <div className="flex items-center gap-2 sm:gap-3 mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{background:'#f1f5f9',border:'1px solid #e2e8f0'}}>
            <Icon className="w-3.5 h-3.5" style={{color:'#2196c4'}}/>
        </div>
        <div>
            <h2 className="nb-h2 text-sm sm:text-base">{label}</h2>
            {sub && <p className="nb-xs mt-0.5 hidden sm:block">{sub}</p>}
        </div>
    </div>
);

// ── SIMPLIFIED FLASHCARD VIEWER ─────────────────────────────────
const FlashcardViewer: React.FC<{cards:Flashcard[]}> = ({cards}) => {
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [done, setDone] = useState(false);
    const [seen, setSeen] = useState<Set<number>>(new Set());

    const total = cards.length;
    const current = cards[index];
    const progress = ((index) / total) * 100;

    const next = () => {
        setSeen(p => new Set([...p, index]));
        setRevealed(false);
        setTimeout(() => {
            if (index + 1 >= total) setDone(true);
            else setIndex(i => i + 1);
        }, 200);
    };

    const restart = () => { setIndex(0); setRevealed(false); setDone(false); setSeen(new Set()); };

    const prev = () => {
        if (index === 0) return;
        setRevealed(false);
        setTimeout(() => setIndex(i => i - 1), 150);
    };

    if (done) {
        return (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center min-h-[380px]">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                    style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                    <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold mb-1" style={{color:'#1e293b'}}>All done!</h2>
                <p className="text-sm mb-6" style={{color:'#64748b'}}>You've reviewed all {total} cards</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setDone(false); setIndex(total - 1); setRevealed(false); }}
                        className="rounded-xl px-5 py-4 text-sm" style={{borderColor:'#e2e8f0',color:'#475569'}}>
                        ← Go Back
                    </Button>
                    <Button onClick={restart} className="rounded-xl text-white px-8 py-4 shadow-md text-sm"
                        style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                        <RotateCcw className="w-4 h-4 mr-2"/> Study Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-5 sm:py-7 px-3 sm:px-5">
            {/* Progress */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold" style={{color:'#64748b'}}>
                    Card {index + 1} of {total}
                </span>
                <span className="nb-badge-progress">{Math.round(progress)}% done</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-5" style={{background:'#f1f5f9'}}>
                <motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${progress}%`}}
                    transition={{duration:0.4}} style={{background:'linear-gradient(90deg,#2196c4,#38b2d8)'}}/>
            </div>

            {/* Question */}
            <motion.div key={`q-${index}`} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.25}}>
                <div className="fc-question-card">
                    <span className="text-xs font-semibold mb-3 block" style={{color:'#2196c4', letterSpacing:'0.05em', textTransform:'uppercase'}}>
                        Question {index + 1}
                    </span>
                    <p className="text-base sm:text-lg font-medium break-words" style={{color:'#1e293b', lineHeight:'1.6'}}>
                        {current.question}
                    </p>
                </div>

                {/* Answer reveal */}
                {!revealed ? (
                    <button className="fc-reveal-btn" onClick={() => setRevealed(true)}>
                        <Eye className="w-4 h-4"/>
                        Tap to see answer
                    </button>
                ) : (
                    <motion.div
                        initial={{opacity:0, height:0}}
                        animate={{opacity:1, height:'auto'}}
                        transition={{duration:0.3, ease:'easeOut'}}
                    >
                        <div className="fc-answer-reveal">
                            <span className="text-xs font-semibold mb-2 block" style={{color:'#16a34a', letterSpacing:'0.05em', textTransform:'uppercase'}}>
                                Answer
                            </span>
                            <p className="text-sm sm:text-base break-words" style={{color:'#166534', lineHeight:'1.65'}}>
                                {current.answer}
                            </p>
                        </div>

                    </motion.div>
                )}

                {/* Prev / Next navigation */}
                <div className={'mt-4 grid gap-2 ' + (index > 0 ? 'grid-cols-2' : 'grid-cols-1')}>
                    {index > 0 && (
                        <Button variant="outline" onClick={prev}
                            className="rounded-xl py-4 text-sm font-semibold"
                            style={{borderColor:'#e2e8f0', color:'#475569'}}>
                            ← Previous
                        </Button>
                    )}
                    <Button onClick={next}
                        className="rounded-xl py-4 text-sm font-semibold text-white shadow-sm"
                        style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                        {index + 1 >= total ? 'Finish 🎉' : 'Next Card →'}
                    </Button>
                </div>
            </motion.div>

            {/* Navigation dots - clickable */}
            <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
                {cards.map((_, i) => (
                    <button key={i} onClick={() => { setRevealed(false); setIndex(i); }}
                        className="w-2 h-2 rounded-full transition-all focus:outline-none"
                        style={{background: i === index ? '#2196c4' : seen.has(i) ? '#86efac' : '#e2e8f0',
                            transform: i === index ? 'scale(1.4)' : 'scale(1)'}}/>
                ))}
            </div>
            <p className="text-center text-xs mt-2" style={{color:'#cbd5e1'}}>Tap any dot to jump to that card</p>
        </div>
    );
};

// ── CONCEPT MAP ──────────────────────────────────────────────────
const ConceptMapRenderer: React.FC<{nodes:ConceptNode[]}> = ({nodes}) => {
    const [expanded,setExpanded] = useState<Set<string>>(new Set(nodes.map(n=>n.id)));
    const toggle=(id:string)=>setExpanded(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
    const DS=[{bg:'#eff6ff',border:'#3b82f6',text:'#1e3a8a'},{bg:'#f5f3ff',border:'#8b5cf6',text:'#4c1d95'},{bg:'#ecfeff',border:'#06b6d4',text:'#164e63'},{bg:'#f8fafc',border:'#94a3b8',text:'#334155'}];
    const rNode=(node:ConceptNode,d=0):React.ReactNode=>{
        const open=expanded.has(node.id);const kids=!!(node.children?.length);const s=DS[Math.min(d,3)];
        return (
            <div key={node.id} className={d>0?'ml-4 sm:ml-6 mt-2':'mt-3'}>
                <div className="flex items-center gap-2">
                    {d>0&&<div className="w-4 h-px shrink-0" style={{background:s.border}}/>}
                    <button onClick={()=>kids&&toggle(node.id)} className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl border text-left ${kids?'cursor-pointer hover:opacity-80':'cursor-default'} transition-all`}
                        style={{background:s.bg,borderColor:s.border,color:s.text}}>
                        {kids&&<span className="text-xs opacity-60">{open?'▾':'▸'}</span>}
                        <span className="font-medium text-xs sm:text-sm break-words whitespace-normal">{node.label}</span>
                    </button>
                </div>
                {kids&&open&&(<div className="ml-4 sm:ml-6 mt-1 pl-2 border-l-2 border-dashed" style={{borderColor:s.border+'60'}}>{node.children!.map(c=>rNode(c,d+1))}</div>)}
            </div>
        );
    };
    return (
        <div className="py-4 px-2">
            <div className="flex gap-3 mb-4">
                <button onClick={()=>setExpanded(new Set(nodes.map(n=>n.id)))} className="nb-xs hover:underline" style={{color:'#2196c4'}}>Expand all</button>
                <span className="nb-xs opacity-30">|</span>
                <button onClick={()=>setExpanded(new Set())} className="nb-xs hover:underline text-slate-500">Collapse all</button>
            </div>
            {nodes.map(n=>rNode(n,0))}
        </div>
    );
};

// ── AUDIO PLAYER ─────────────────────────────────────────────────
const AudioPlayer: React.FC<{script:string}> = ({script}) => {
    const [isPlaying,setIsPlaying] = useState(false);
    const lines=script.split('\n').filter(l=>l.trim()).map(line=>{const m=line.match(/^\*\*(Host [AB]|Alex|Ben):\*\*\s*(.+)/)||line.match(/^(Alex|Ben):\s*(.+)/);if(m)return{host:m[1],text:m[2]};return{host:'',text:line.replace(/^\*\*|\*\*$/g,'')};}).filter(l=>l.text.length>10);
    const togglePlay=()=>{if(!isPlaying){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(script.replace(/\*\*/g,'').replace(/\n/g,' ').slice(0,1200));u.onend=()=>setIsPlaying(false);speechSynthesis.speak(u);setIsPlaying(true);}else{speechSynthesis.cancel();setIsPlaying(false);}};
    return (
        <div className="max-w-2xl mx-auto py-5 sm:py-7 px-3 sm:px-4">
            <div className="rounded-2xl p-4 sm:p-6 shadow-sm mb-6" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                <div className="flex items-center gap-3 mb-4 text-white">
                    <div className="p-2 rounded-xl" style={{background:'rgba(255,255,255,0.15)'}}><Waves className="w-4 h-4 sm:w-5 sm:h-5"/></div>
                    <div><p className="font-semibold text-sm sm:text-base">Audio Overview</p><p className="text-xs opacity-70">AI-generated podcast</p></div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xs opacity-60 text-white">Browser TTS · Preview</p>
                    <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg font-bold text-base" style={{color:'#1e4976'}}>{isPlaying?'⏸':'▶'}</button>
                </div>
            </div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{color:'#1e293b'}}><Mic className="w-4 h-4" style={{color:'#2196c4'}}/> Transcript</h3>
            <div className="space-y-2 sm:space-y-3">
                {lines.slice(0,30).map((line,i)=>{
                    const L=line.host==='Alex'||line.host==='Host A';
                    return (
                        <div key={i} className={`flex gap-2 sm:gap-3 ${L?'':'flex-row-reverse'}`}>
                            {line.host&&<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={L?{background:'#dbeafe',color:'#1e3a8a'}:{background:'#ede9fe',color:'#4c1d95'}}>{line.host[0]?.toUpperCase()}</div>}
                            <div className={`flex-1 rounded-xl px-3 py-2 max-w-[92%] sm:max-w-[80%] ${L?'bg-slate-100 dark:bg-slate-800':'bg-blue-50 dark:bg-blue-950/30'}`}>
                                {line.host&&<span className="block mb-0.5 text-xs font-semibold" style={{color:'#2196c4'}}>{line.host}</span>}
                                <p className="text-xs sm:text-sm break-words whitespace-normal">{line.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── CONTENT RENDERER ─────────────────────────────────────────────
const ContentRenderer: React.FC<{content:string;title:string;isEditMode:boolean;onContentChange:(v:string)=>void}> = ({content,title,isEditMode,onContentChange}) => {
    const hdr=(
        <div className="mb-6 pb-4 sm:pb-5 border-b border-slate-100">
            <h1 className="nb-h1" style={{color:'#1e293b'}}>{title}</h1>
            <p className="nb-small mt-2 text-xs sm:text-sm">AI-generated from your selected knowledge sources</p>
        </div>
    );
    if(isEditMode) return (
        <div className="p-4 sm:p-6 lg:p-10">{hdr}
            <Textarea className="w-full min-h-[400px] font-mono text-sm leading-relaxed bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 resize-y" value={content} onChange={e=>onContentChange(e.target.value)}/>
        </div>
    );
    return <div className="p-3 sm:p-5 lg:p-8 w-full min-w-0 overflow-hidden">{hdr}<div className="nb-prose max-w-none break-words" dangerouslySetInnerHTML={{__html: typeof content==="string" ? converter.makeHtml(content) : ""}}/></div>;
};

// ── PARSE HELPERS ─────────────────────────────────────────────────

/**
 * Clean AI-generated text to plain readable text.
 * Handles Front:/Back: format, citation noise, and all markdown.
 */
const cleanText = (s: string): string =>
    s
        .replace(/^\s*(Front|Back)\s*[:–\-]\s*/i, '')
        .replace(/\(Based on[^)]*\)/gi, '')
        .replace(/\(Source[^)]*\)/gi, '')
        .replace(/\(From[^)]*\)/gi, '')
        .replace(/\(Ref[^)]*\)/gi, '')
        .replace(/^(?:Q|Question|A|Answer)\s*\d*\s*[:–\-]\s*/i, '')
        .replace(/^\s*[-*_]{2,}\s*$/gm, '')
        .replace(/\*\*(.*?)\*\*/gs, '$1')
        .replace(/\*(.*?)\*/gs, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const isJunk = (s: string): boolean => {
    if (!s || s.length < 4) return true;
    if (/^\([^)]{3,}\)$/.test(s.trim())) return true;
    if (!/[a-zA-Z]/.test(s)) return true;
    return false;
};

const parseFlashcards = (text: string): Flashcard[] => {
    const cards: Flashcard[] = [];

    // Strategy 1: "Front: X\nBack: Y" blocks (most common AI format)
    const frontBackRe = /Front\s*[:–\-]\s*([\s\S]+?)Back\s*[:–\-]\s*([\s\S]+?)(?=\n\d+\.|\nFront\s*[:–\-]|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = frontBackRe.exec(text)) !== null) {
        const question = cleanText(m[1]);
        const answer   = cleanText(m[2]);
        if (!isJunk(question) && !isJunk(answer))
            cards.push({ question, answer });
    }
    if (cards.length > 0) return cards.slice(0, 30);

    // Strategy 2: "Q: … A: …" blocks
    const qaBlocks = text.split(/\n(?=(?:Q\d*|Question\s*\d*)\s*[:.:])/i);
    for (const b of qaBlocks) {
        const qm = b.match(/^(?:Q\d*|Question\s*\d*)\s*[:.]\s*([\s\S]+?)(?=\n(?:A\d*|Answer\s*\d*)\s*[:.:])/i);
        const am = b.match(/(?:A\d*|Answer\s*\d*)\s*[:.]\s*([\s\S]+?)(?:\n\n|$)/i);
        if (qm && am) {
            const question = cleanText(qm[1]);
            const answer   = cleanText(am[1]);
            if (!isJunk(question) && !isJunk(answer))
                cards.push({ question, answer });
        }
    }
    if (cards.length > 0) return cards.slice(0, 30);

    // Strategy 3: Alternating clean lines
    const lines = text
        .split('\n')
        .map(l => cleanText(l.replace(/^\d+[.\)]\s*/, '')))
        .filter(l => !isJunk(l) && !/^[-*_]{2,}$/.test(l));
    for (let i = 0; i + 1 < lines.length; i += 2)
        cards.push({ question: lines[i], answer: lines[i + 1] });

    return cards.slice(0, 30);
};
const parseConceptMap=(text:string):ConceptNode[]=>{
    const lines=text.split('\n').filter(l=>l.trim());const root:ConceptNode[]=[]; const stack:{node:ConceptNode;depth:number}[]=[];
    for(const line of lines){
        const s=line.replace(/^#+\s*/,'').replace(/^\*+\s*/,'').replace(/^-+\s*/,'').replace(/\*\*/g,'').trim();
        if(!s||s.length<3)continue;
        let d=0;if(/^#{3,}/.test(line))d=2;else if(/^#{2}/.test(line))d=1;else if(/^#/.test(line))d=0;else{const sp=line.match(/^(\s*)/)?.[1].length||0;d=Math.min(Math.floor(sp/2),3);}
        const node:ConceptNode={id:`${d}-${s.slice(0,20)}-${Math.random()}`,label:s,children:[]};
        if(d===0||stack.length===0){root.push(node);stack.length=0;stack.push({node,depth:d});}
        else{while(stack.length>0&&stack[stack.length-1].depth>=d)stack.pop();if(stack.length>0){stack[stack.length-1].node.children=stack[stack.length-1].node.children||[];stack[stack.length-1].node.children!.push(node);}else root.push(node);stack.push({node,depth:d});}
    }
    return root;
};

// ════════════════════════════════════════════════════════════════
const AINotebook: React.FC = () => {
    useBranding();
    const [sources,setSources] = useState<Source[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("nb_sources");
        if (saved) setSources(JSON.parse(saved));
    }, []);
    useEffect(() => {
        localStorage.setItem("nb_sources", JSON.stringify(sources));
    }, [sources]);

    const [isChatOpen,setIsChatOpen] = useState(false);
    const [isMobileSourcesOpen,setIsMobileSourcesOpen] = useState(false);
    const [chatMessages,setChatMessages] = useState<ChatMessage[]>([
        {role:'system',content:"✨ Hi! I'm your AI Assistant. I've analyzed your knowledge base and I'm ready to help you learn smarter. What would you like to explore today?"}
    ]);
    const [currentInput,setCurrentInput] = useState('');
    const [isGenerating,setIsGenerating] = useState(false);
    const [loadingAction,setLoadingAction] = useState<string|null>(null);
    const [generatedContent,setGeneratedContent] = useState<Record<string,string>>({});
    const [activeNoteKey,setActiveNoteKey] = useState<string|null>(null);
    const [activeTab,setActiveTab] = useState('guide');
    const [isEditMode,setIsEditMode] = useState(false);
    const [isLoadingSources,setIsLoadingSources] = useState(false);
    const [selectedSourceCount,setSelectedSourceCount] = useState(0);
    const [isSaving,setIsSaving] = useState(false);
    const [saveToast,setSaveToast] = useState('');
    const [notebookId,setNotebookId] = useState<string|null>(null);
    const [isLoadingNotes,setIsLoadingNotes] = useState(true);

    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(min-width:769px) and (max-width:1024px)');
    const isSmallDesktop = useMediaQuery('(min-width:1025px) and (max-width:1440px)');
    const isDesktop = useMediaQuery('(min-width:1441px)');

    useEffect(() => {
        if (!isGenerating) return;
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages, isGenerating]);

    useEffect(()=>{setSelectedSourceCount(sources.filter(s=>s.selected).length);},[sources]);
    useEffect(()=>{setIsMobileSourcesOpen(false);},[activeTab]);

    useEffect(()=>{
        const check=async()=>{
            const uType=sessionStorage.getItem('type'); const uRole=sessionStorage.getItem('role');
            try{
                const res=await axios.get(`${serverURL}/api/settings`);
                if(res.data?.notebookEnabled){
                    const s=res.data.notebookEnabled; let ok=false;
                    if(uRole==='org_admin')ok=s.org_admin;else if(uRole==='student')ok=s.student;else ok=s[uType||'']||false;
                    if(!ok){if(!['monthly','yearly','forever'].includes(uType||'')){navigate('/dashboard/pricing');return;}navigate('/dashboard');}
                }
            }catch(e){console.error(e);}
        };
        check();
    },[navigate]);

    useEffect(()=>{
        const load = async () => {
            setIsLoadingNotes(true);
            try {
                let userId = localStorage.getItem("nbUserId");
                if (!userId) { userId = Date.now().toString(); localStorage.setItem("nbUserId", userId); }
                const res = await axios.get(`${serverURL}/api/notebook/load`, { params: { userId } });
                if (res.data.success) {
                    const notebooks = res.data.notebooks || [];
                    if (notebooks.length > 0) {
                        const first = notebooks[0];
                        setNotebookId(first._id);
                        setGeneratedContent(first.generatedContent || {});
                        setSources(first.sources || []);
                        setChatMessages(first.chatHistory?.length ? first.chatHistory : [{role:"system",content:"✨ Hi! I'm your AI Assistant 🚀"}]);
                        const keys = Object.keys(first.generatedContent || {});
                        if (keys.length > 0) setActiveNoteKey(keys[0]);
                    }
                }
            } catch(e) { console.log('No saved notebook'); }
            finally { setIsLoadingNotes(false); }
        };
        load();
    },[]);

    useEffect(()=>{
        if(Object.keys(generatedContent).length===0)return;
        if(saveTimer.current)clearTimeout(saveTimer.current);
        saveTimer.current=setTimeout(()=>saveNotes(false),3000);
        return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};
    },[generatedContent]);

    const saveNotes = async (manual = false) => {
        if (Object.keys(generatedContent).length === 0) return;
        setIsSaving(true);
        try {
            let userId = localStorage.getItem("nbUserId");
            if (!userId) { userId = Date.now().toString(); localStorage.setItem("nbUserId", userId); }
            const res = await axios.post(`${serverURL}/api/notebook/save`, { userId, notebookId, generatedContent, sources, chatHistory: chatMessages });
            console.log('--- AI TOKEN USAGE (Notebook Save) ---');
            console.table(res.data.usage);
            if (res.data.success) {
                if (res.data.notebookId) setNotebookId(res.data.notebookId);
                if (manual) { setSaveToast('✓ Notes saved!'); setTimeout(()=>setSaveToast(''),2500); }
            }
        } catch(e) {
            console.error("Save error:", e);
            if (manual) { setSaveToast('⚠ Save failed'); setTimeout(()=>setSaveToast(''),2500); }
        } finally { setIsSaving(false); }
    };

    const handleFileUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if(!file)return;
        setGeneratedContent({});
        setChatMessages([{role:"system",content:"✨ New notebook started. Upload and generate fresh content 🚀"}]);
        setNotebookId(null);
        setSources([]);
        setIsLoadingSources(true);
        const fd=new FormData();
        fd.append('file',file);
        try{
            const res=await axios.post(`${serverURL}/api/notebook/upload-source`,fd,{headers:{'Content-Type':'multipart/form-data'}});
            console.log('--- AI TOKEN USAGE (Notebook Upload Source) ---');
            console.table(res.data.usage);
            if(res.data.success) setSources([{...res.data.source,selected:true}]);
        }catch(e){ console.error(e); }
        finally{ setIsLoadingSources(false); }
        if(fileInputRef.current)fileInputRef.current.value='';
    };

const toggleSrc = (id: string) =>
  setSources(prev =>
    prev.map(s => {
      if (s.id !== id) return s;

      const isNowSelected = !s.selected;

      return {
        ...s,
        selected: isNowSelected,
        ...(isNowSelected
          ? {} // keep data when selecting
          : {
              title: "",
              words: 0,
              // add any other fields you want to reset
            }),
      };
    })
  );
    const sendChat=async()=>{
        if(!currentInput.trim())return;
        if(sources.filter(s=>s.selected).length===0){
            setChatMessages(prev=>[...prev,{role:'system',content:'⚠️ Please select at least one source first.'}]);
            return;
        }
        const uMsg:ChatMessage={role:'user',content:currentInput};
        const msgs=[...chatMessages,uMsg];
        setChatMessages(msgs);setCurrentInput('');setIsGenerating(true);
        const ctx=sources.filter(s=>s.selected).map(s=>s.content).join('\n\n');
        try{
            const res=await axios.post(`${serverURL}/api/notebook/chat`,{messages:msgs.slice(1).map(m=>({role:m.role,content:m.content})),context:ctx});
            console.log('--- AI TOKEN USAGE (Notebook Chat) ---');
            console.table(res.data.usage);
            if(res.data.success)setChatMessages(p=>[...p,{role:'system',content:res.data.generatedText}]);
        }catch(err:any){
            setChatMessages(p=>[...p,{role:'system',content:err?.response?.data?.message||'Error. Try again.'}]);
        }
        finally{ setIsGenerating(false); }
    };

    const genAction=async(action:string)=>{
        if(sources.filter(s=>s.selected).length===0){setChatMessages(p=>[...p,{role:'system',content:'⚠️ Select at least one source first.'}]);setIsChatOpen(true);return;}
        setActiveTab('notes');setActiveNoteKey(action);
        if(generatedContent[action])return;
        setIsGenerating(true);setLoadingAction(action);
        const ctx=sources.filter(s=>s.selected).map(s=>s.content).join('\n\n');
        try{
            const res=await axios.post(`${serverURL}/api/notebook/generate-action`,{action,context:ctx});
            console.log('--- AI TOKEN USAGE (Notebook Action) ---');
            console.table(res.data.usage);
            if(res.data.success){setGeneratedContent(p=>({...p,[action]:res.data.generatedText}));setIsEditMode(false);}
        }catch(e){console.error(e);}
        finally{setIsGenerating(false);setLoadingAction(null);}
    };

    const srcIcon=(type:string)=>{
        if(type==='pdf')return<FileType className="w-3.5 h-3.5 text-rose-500"/>;
        if(type==='url')return<Globe className="w-3.5 h-3.5 text-sky-500"/>;
        return<FileText className="w-3.5 h-3.5 text-slate-400"/>;
    };

    // ── SOURCES PANEL ─────────────────────────────────────────────
  const SourcesPanel = () => (
    <Card className="h-full border shadow-lg rounded-2xl overflow-hidden flex flex-col bg-white w-full" style={{ borderColor: '#e2e8f0', minWidth: 0 }}>
        <CardHeader className="px-4 py-4 border-b shrink-0" style={{ borderColor: '#f1f5f9', background: '#fafbfc' }}>
            <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                        <Database className="w-4 h-4" style={{ color: '#2196c4' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>Knowledge Base</h2>
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{selectedSourceCount} selected · {sources.length} total</p>
                    </div>
                </div>
                {!isDesktop && (
                    <button onClick={() => setIsMobileSourcesOpen(false)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 ml-2">
                        <X className="w-4 h-4" style={{ color: '#64748b' }} />
                    </button>
                )}
            </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col min-w-0 overflow-hidden">
            <div className="p-3 shrink-0">
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.txt,.md" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isLoadingSources}
                    className="w-full rounded-xl py-4 text-white text-sm font-semibold shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#1e4976,#2196c4)' }}>
                    {isLoadingSources ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Upload Document
                </Button>
            </div>

            <ScrollArea className="flex-1 w-full min-w-0">
                <div className="px-3 pb-3 space-y-2">
                    {sources.length === 0 ? (
                        <div className="py-10 text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                                <Cloud className="w-7 h-7" style={{ color: '#94a3b8' }} />
                            </div>
                            <p className="font-semibold text-sm mb-1" style={{ color: '#475569' }}>No sources yet</p>
                        </div>
                    ) : (
                        sources.map((src, i) => (
                            <motion.div
                                key={src.id}
                                onClick={() => toggleSrc(src.id)}
                                className="relative p-3 rounded-xl cursor-pointer transition-all border overflow-hidden"
                                style={{
                                    background: src.selected ? "#eff6ff" : "#fafbfc",
                                    borderColor: src.selected ? "#bfdbfe" : "#f1f5f9",
                                    width: '100%' // Force full width
                                }}
                            >
                                {/* THE FIX: Use grid or flex with width-0 to break the text-expansion */}
                                <div className="flex items-center gap-2 w-full" style={{ width: '100%', minWidth: 0 }}>
                                    
                                    {/* 1. Checkbox - Fixed width */}
                                    <div className="shrink-0">
                                        {src.selected ? (
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#2196c4]">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                        )}
                                    </div>

                                    {/* 2. Text Wrapper - This MUST have min-width: 0 to allow truncation */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 w-full">
                                            <div className="shrink-0">{srcIcon(src.type)}</div>
                                            <p className="text-xs font-semibold text-slate-800 break-words whitespace-normal">
                                              {src.title}
                                            </p>
                                        </div>
                                        <p className="text-[10px] mt-0.5 text-slate-500 truncate">
                                            {src.words.toLocaleString()} words · {src.type.toUpperCase()}
                                        </p>
                                    </div>

                                    {/* 3. Delete Button - Fixed width */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSources((p) => p.filter((s) => s.id !== src.id));
                                        }}
                                        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
);
    // ── CHAT PANEL ─────────────────────────────────────────────────
    const ChatPanel=()=>(
        <Card className="h-full border shadow-lg rounded-2xl overflow-hidden flex flex-col bg-white" style={{borderColor:'#e2e8f0'}}>
            <CardHeader className="px-4 py-3 border-b shrink-0" style={{borderColor:'#f1f5f9', background:'#fafbfc'}}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#f1f5f9',border:'1px solid #e2e8f0'}}>
                            <Bot className="w-4 h-4" style={{color:'#2196c4'}}/>
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm" style={{color:'#1e293b'}}>AI Assistant</h2>
                            <p className="text-xs" style={{color:'#64748b'}}>Powered by your sources</p>
                        </div>
                    </div>
                    {!isDesktop && (
                        <button onClick={()=>setIsChatOpen(false)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 touch-manipulation">
                            <X className="w-4 h-4" style={{color:'#64748b'}}/>
                        </button>
                    )}
                </div>
            </CardHeader>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4" style={{WebkitOverflowScrolling:'touch'}}>
                <div className="space-y-3">
                    {chatMessages.map((msg,i)=>(
                        <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                            <div className={`max-w-[95%] sm:max-w-[85%] rounded-2xl px-3 py-2.5 ${msg.role==='user'?'rounded-br-md text-white':'bg-slate-50 border border-slate-100 rounded-bl-md'}`}
                                style={msg.role==='user'?{background:'linear-gradient(135deg,#1e4976,#2196c4)'}:{}}>
                                {msg.role==='system'
                                    ?<div className="nb-body prose prose-sm max-w-none text-xs sm:text-sm break-words overflow-hidden" dangerouslySetInnerHTML={{__html:converter.makeHtml(msg.content)}}/>
                                    :<p className="text-xs sm:text-sm text-white">{msg.content}</p>}
                            </div>
                        </motion.div>
                    ))}
                    {isGenerating&&(
                        <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-slate-50 border border-slate-100 flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{color:'#2196c4'}}/>
                                <span className="text-xs" style={{color:'#64748b'}}>Thinking…</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {chatMessages.length<=2&&(
                <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                    {SUGGESTED_QUESTIONS.slice(0,2).map(q=>(
                        <button key={q} onClick={()=>setCurrentInput(q)}
                            className="px-2.5 py-1.5 rounded-full text-xs border transition-all hover:opacity-80 touch-manipulation"
                            style={{background:'#f0f9ff',borderColor:'#bfdbfe',color:'#1e4976'}}>
                            {q}
                        </button>
                    ))}
                </div>
            )}

            <CardFooter className="p-3 border-t nb-chat-footer shrink-0" style={{borderColor:'#f1f5f9'}}>
                <div className="w-full">
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={currentInput}
                            onChange={(e)=>setCurrentInput(e.target.value)}
                            onKeyDown={(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}}
                            placeholder="Type your question…"
                            className="nb-chat-textarea flex-1"
                            rows={1}
                        />
                        <Button onClick={sendChat} disabled={!currentInput.trim()||isGenerating}
                            className="shrink-0 w-11 h-11 rounded-xl text-white p-0 shadow-sm touch-manipulation"
                            style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                            {isGenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
                        </Button>
                    </div>
                    <p className="text-xs mt-1 text-center" style={{color:'#94a3b8'}}>Shift+Enter for new line</p>
                </div>
            </CardFooter>
        </Card>
    );

    const getChatPanelClass = () => {
        if (isMobile)        return 'fixed inset-0 z-50 p-2';
        if (isTablet)        return 'fixed inset-y-0 right-0 w-[340px] z-40 p-3';
        if (isSmallDesktop)  return 'fixed inset-y-0 right-0 w-[380px] z-40 p-3';
        return 'w-[400px] shrink-0';
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html:DESIGN_SYSTEM}}/>

            <AnimatePresence>
                {saveToast&&(
                    <motion.div className="nb-save-toast" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>
                        <CheckCheck className="w-3.5 h-3.5"/> {saveToast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* White background — no blue gradient */}
            <div className="min-h-screen">
                {/* Added mt-2 top margin so the notebook doesn't touch the profile header above */}
                <div className="relative flex flex-col lg:flex-row min-h-screen w-full gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 mt-2 container pt-0 lg:pt-[65px] mx-auto">

                  {/* Desktop Sidebar - Always visible on large desktop (1441px+) */}
{isDesktop && (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        // ADD THESE THREE CLASSES BELOW:
        className="w-80 xl:w-96 shrink-0 min-w-0 overflow-hidden" 
    >
        <SourcesPanel />
    </motion.div>
)}

                    {/* Tablet / small-desktop slide-in overlay */}
                    {(isSmallDesktop||isTablet) && (
                        <AnimatePresence>
                            {isMobileSourcesOpen && (
                                <>
                                    <motion.div
                                        initial={{opacity:0,x:-300}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-300}}
                                        transition={{duration:0.3}}
                                        className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl p-3">
                                        <SourcesPanel/>
                                    </motion.div>
                                    <div className="fixed inset-0 bg-black/30 z-40" onClick={()=>setIsMobileSourcesOpen(false)}/>
                                </>
                            )}
                        </AnimatePresence>
                    )}

                    {/* Mobile bottom sheet */}
                    {isMobile && (
                        <Sheet open={isMobileSourcesOpen} onOpenChange={setIsMobileSourcesOpen}>
                            <SheetContent side="left" className="w-[85vw] max-w-[300px] p-0 bg-transparent border-0">
                                <div className="h-full p-2"><SourcesPanel/></div>
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* ── MAIN CONTENT ─────────────────────────────────────── */}
                    <motion.div
                        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}}
                        className="flex-1 min-w-0"
                        style={{display:(isMobile&&isChatOpen)?'none':'flex',flexDirection:'column'}}
                    >
                        <Card className="flex-1 border shadow-md rounded-2xl overflow-hidden flex flex-col bg-white" style={{borderColor:'#e2e8f0'}}>

                            {/* ── HEADER — white with subtle border ────────── */}
                            <CardHeader className="px-3 sm:px-5 py-3 border-b shrink-0"
                                style={{background:'#ffffff', borderColor:'#f1f5f9'}}>
                                <div className="flex items-center justify-between gap-2 min-w-0">

                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="p-1.5 sm:p-2 rounded-xl shrink-0" style={{background:'#f1f5f9',border:'1px solid #e2e8f0'}}>
                                            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" style={{color:'#2196c4'}}/>
                                        </div>
                                        <div className="min-w-0">
                                            <h1 className="font-bold text-sm sm:text-base leading-tight truncate" style={{color:'#1e293b'}}>Neural Notebook</h1>
                                            <p className="text-xs hidden sm:block truncate" style={{color:'#64748b'}}>
                                                {selectedSourceCount} source{selectedSourceCount!==1?'s':''} · {isLoadingNotes?'Loading…':Object.keys(generatedContent).length+' notes saved'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {Object.keys(generatedContent).length>0 && (
                                            <button onClick={()=>saveNotes(true)} disabled={isSaving}
                                                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-slate-100 touch-manipulation"
                                                style={{background:'#f8fafc',color:'#475569',border:'1px solid #e2e8f0'}}>
                                                {isSaving?<Loader2 className="w-3 h-3 animate-spin"/>:<Save className="w-3 h-3"/>}
                                                <span className="hidden sm:inline ml-0.5">{isSaving?'Saving…':'Save'}</span>
                                            </button>
                                        )}
                                        {!isDesktop && (
                                            <button onClick={()=>setIsMobileSourcesOpen(true)}
                                                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-slate-100 touch-manipulation"
                                                style={{background:'#f8fafc',color:'#475569',border:'1px solid #e2e8f0'}}>
                                                <Database className="w-3 h-3"/>
                                                <span className="ml-0.5">{selectedSourceCount}</span>
                                            </button>
                                        )}
                                        <button onClick={()=>setIsChatOpen(!isChatOpen)}
                                            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-medium touch-manipulation ${isChatOpen?'nb-chat-active':'nb-chat-inactive'}`}>
                                            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                                            <span className="hidden sm:inline">{isChatOpen?'Hide Chat':'Chat'}</span>
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* ── TABS ─────────────────────────────────────── */}
                            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
                               <div className="px-2 sm:px-5 pt-2 border-b shrink-0 overflow-x-auto" style={{borderColor:'#f1f5f9'}}>
                                     <TabsList className="flex w-max min-w-full sm:min-w-0 overflow-x-auto no-scrollbar p-1 rounded-xl gap-1" style={{background:'#f1f5f9'}}>
                                            <TabsTrigger value="guide"
                                                 className="flex-shrink-0 whitespace-nowrap rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm:py-2 text-xs sm:text-sm data-[state=active]:font-semibold transition-all touch-manipulation data-[state=active]:text-slate-800">
                                                <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5"/>
                                                <span className="hidden sm:inline">Learning Studio</span>
                                                <span className="sm:hidden">Studio</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="notes"
                                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:font-semibold transition-all touch-manipulation data-[state=active]:text-slate-800">
                                                <NotebookPen className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5"/>
                                                My Notes
                                                {Object.keys(generatedContent).length>0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-white text-xs font-bold" style={{background:'#2196c4'}}>
                                                        {Object.keys(generatedContent).length}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>

                                        {/* ── LEARNING STUDIO ───────────────────── */}
                                        <TabsContent value="guide" className="p-3 sm:p-5 m-0">
                                            {isLoadingNotes && (
                                                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl text-xs" style={{background:'#f0f9ff',color:'#1e4976',border:'1px solid #bfdbfe'}}>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin"/> Loading your saved notes…
                                                </div>
                                            )}

                                            {/* Audio Hero — clean white card */}
                                            <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-2xl"
                                                style={{background:'#ffffff',border:'1px solid #e2e8f0',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
                                                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                                                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0" style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                                                        <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
                                                    </div>
                                                    <div className="flex-1 text-center sm:text-left">
                                                        <h2 className="nb-h2 mb-0.5 text-sm sm:text-base" style={{color:'#1e293b'}}>Generate Audio Overview</h2>
                                                        <p className="nb-body text-xs sm:text-sm">Transform sources into an engaging podcast-style discussion.</p>
                                                    </div>
                                                    <Button onClick={()=>genAction("Audio Overview")} disabled={isGenerating||selectedSourceCount===0}
                                                        className="rounded-xl text-white text-xs sm:text-sm px-4 py-3 sm:py-4 w-full sm:w-auto shadow-sm touch-manipulation"
                                                        style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                                                        {isGenerating?<Loader2 className="w-3.5 h-3.5 mr-2 animate-spin"/>:<Headphones className="w-3.5 h-3.5 mr-2"/>} Generate
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="mb-5 sm:mb-6">
                                                <SH icon={Zap} label="AI-Powered Actions" sub="Click any action to generate content in My Notes"/>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                                    {QUICK_ACTIONS.map((action,i)=>{
                                                        const loading=loadingAction===action.title;
                                                        const done=!!generatedContent[action.title];
                                                        return (
                                                            <motion.div key={action.title} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                                                                onClick={()=>!isGenerating&&selectedSourceCount>0&&genAction(action.title)}
                                                                className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group touch-manipulation ${(isGenerating&&!loading)||selectedSourceCount===0?'opacity-50 pointer-events-none':''}`}
                                                                style={{background:action.bg, border: done?`1.5px solid ${action.color}40`:'1px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div className="p-2 rounded-xl shadow-sm" style={{background:action.color+'18'}}>
                                                                        {loading?<Loader2 className="w-3.5 h-3.5 animate-spin" style={{color:action.color}}/>:<action.icon className="w-3.5 h-3.5" style={{color:action.color}}/>}
                                                                    </div>
                                                                    {done?<CheckCheck className="w-3.5 h-3.5" style={{color:action.color}}/>
                                                                        :loading?<span className="text-xs animate-pulse" style={{color:action.color}}>…</span>
                                                                        :<ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100"/>}
                                                                </div>
                                                                <h3 className="font-semibold text-xs sm:text-sm mb-0.5" style={{color:'#1e293b'}}>{action.title}</h3>
                                                                <p className="text-xs hidden sm:block" style={{color:'#94a3b8'}}>{action.desc}</p>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Suggested Questions */}
                                            <div>
                                                <SH icon={Lightbulb} label="Suggested Questions" sub="Click to send to AI chat"/>
                                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                    {SUGGESTED_QUESTIONS.map((q,i)=>(
                                                        <motion.button key={q} initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}}
                                                            onClick={()=>{setCurrentInput(q);if(!isChatOpen)setIsChatOpen(true);}}
                                                            className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all hover:shadow-sm touch-manipulation"
                                                            style={{background:'white',border:'1px solid #e2e8f0',color:'#475569'}}>
                                                            {q}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="h-20 sm:h-4"/>
                                        </TabsContent>

                                        {/* ── MY NOTES ────────────────────────────── */}
                                        <TabsContent value="notes" className="p-0 m-0 flex flex-col h-full">
                                            {/* Notes toolbar */}
                                            <div className="sticky top-0 z-20 px-3 sm:px-5 py-2.5 border-b bg-white flex items-center justify-between gap-2 shrink-0" style={{borderColor:'#f1f5f9'}}>
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{background:'#f1f5f9',border:'1px solid #e2e8f0'}}>
                                                        <NotebookPen className="w-3 h-3" style={{color:'#2196c4'}}/>
                                                    </div>
                                                    <span className="font-semibold text-xs sm:text-sm" style={{color:'#1e293b'}}>My Notes</span>
                                                    {loadingAction && <span className="hidden sm:flex items-center gap-1 text-xs animate-pulse" style={{color:'#2196c4'}}><Loader2 className="w-3 h-3 animate-spin"/> Generating {loadingAction}…</span>}
                                                    {isSaving && <span className="flex items-center gap-1 text-xs" style={{color:'#2196c4'}}><Loader2 className="w-3 h-3 animate-spin"/> Saving…</span>}
                                                </div>
                                                {activeNoteKey && generatedContent[activeNoteKey] && (
                                                    <div className="flex p-0.5 rounded-xl gap-0.5 shrink-0" style={{background:'#f1f5f9'}}>
                                                        {[{label:'Preview',icon:BookOpen,val:false},{label:'Edit',icon:FileType,val:true}].map(btn=>(
                                                            <button key={btn.label} onClick={()=>setIsEditMode(btn.val)}
                                                                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation"
                                                                style={isEditMode===btn.val?{background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.08)',color:'#1e293b'}:{color:'#64748b'}}>
                                                                <btn.icon className="w-3 h-3"/>
                                                                <span className="hidden sm:inline ml-1">{btn.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Note tab bar */}
                                            {Object.keys(generatedContent).length > 0 && (
                                                <div className="nb-tab-bar shrink-0" style={{borderBottom:'1px solid #f1f5f9'}}>
                                                    {[{title:'Audio Overview',icon:Waves},...QUICK_ACTIONS]
                                                        .filter(a=>generatedContent[a.title]||loadingAction===a.title)
                                                        .map(action=>{
                                                            const active=activeNoteKey===action.title;
                                                            const loading=loadingAction===action.title;
                                                            return (
                                                                <button key={action.title} onClick={()=>setActiveNoteKey(action.title)}
                                                                    className="flex items-center gap-1 px-2 sm:px-3 py-2 border-b-2 text-xs font-medium whitespace-nowrap transition-all shrink-0 touch-manipulation"
                                                                    style={active?{borderColor:'#2196c4',color:'#1e4976'}:{borderColor:'transparent',color:'#64748b'}}>
                                                                    {loading?<Loader2 className="w-3 h-3 animate-spin"/>:<action.icon className="w-3 h-3"/>}
                                                                    <span className="ml-1">{action.title}</span>
                                                                    {generatedContent[action.title] && <span className="w-1.5 h-1.5 rounded-full ml-1" style={{background:'#2196c4'}}/>}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            )}

                                            <div className="flex-1 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>
                                                {Object.keys(generatedContent).length===0 && !loadingAction && (
                                                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
                                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4" style={{background:'#f1f5f9'}}>
                                                            <NotebookPen className="w-8 h-8 sm:w-10 sm:h-10" style={{color:'#94a3b8'}}/>
                                                        </div>
                                                        <h2 className="nb-h2 mb-2 text-sm sm:text-base" style={{color:'#1e293b'}}>Your notebook is empty</h2>
                                                        <p className="nb-body text-xs sm:text-sm max-w-[260px]">
                                                            Go to <span className="font-semibold" style={{color:'#2196c4'}}>Learning Studio</span> and click any action.
                                                        </p>
                                                        <Button size="sm" variant="outline" onClick={()=>setActiveTab('guide')}
                                                            className="mt-4 rounded-xl text-xs sm:text-sm touch-manipulation" style={{borderColor:'#e2e8f0',color:'#475569'}}>
                                                            <Compass className="w-3 h-3 mr-1.5"/> Go to Learning Studio
                                                        </Button>
                                                    </div>
                                                )}
                                                {activeNoteKey && (
                                                    <>
                                                        {loadingAction===activeNoteKey && !generatedContent[activeNoteKey] ? (
                                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                                <Loader2 className="w-8 h-8 animate-spin mb-4" style={{color:'#2196c4'}}/>
                                                                <p className="nb-body text-xs sm:text-sm">Generating {activeNoteKey}…</p>
                                                            </div>
                                                        ) : generatedContent[activeNoteKey] ? (()=>{
                                                            const c=generatedContent[activeNoteKey];
                                                            if(activeNoteKey==='Flashcards'){const cards=parseFlashcards(c);return cards.length>0?<div className="px-3 sm:px-5 lg:px-8 py-4 sm:py-6 overflow-hidden"><FlashcardViewer cards={cards}/></div>:<div className="p-8 text-center nb-body text-xs">Could not parse flashcards. Switch to Edit mode.</div>;}
                                                            if(activeNoteKey==='Concept Map'){const nodes=parseConceptMap(c);return(<div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto min-w-0"><div className="mb-6 pb-4 border-b" style={{borderColor:'#f1f5f9'}}><h1 className="nb-h1" style={{color:'#1e293b'}}>Concept Map</h1><p className="nb-small mt-2 text-xs sm:text-sm">Visual connections between key ideas</p></div>{nodes.length>0?<ConceptMapRenderer nodes={nodes}/>:<p className="nb-body text-xs">Could not parse.</p>}</div>);}
                                                            if(activeNoteKey==='Audio Overview')return<AudioPlayer script={c}/>;
                                                            return<ContentRenderer content={c} title={activeNoteKey} isEditMode={isEditMode} onContentChange={v=>setGeneratedContent(p=>({...p,[activeNoteKey]:v}))}/>;
                                                        })() : null}
                                                    </>
                                                )}
                                                <div className="h-20 sm:h-4"/>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* ── CHAT PANEL ───────────────────────────────────── */}
                    <AnimatePresence>
                        {isChatOpen && (
                            <motion.div
                                initial={{opacity:0, x: isMobile ? 300 : 80, scale: isMobile ? 1 : 0.97}}
                                animate={{opacity:1, x:0, scale:1}}
                                exit={{opacity:0, x: isMobile ? 300 : 80, scale: isMobile ? 1 : 0.97}}
                                transition={{duration:0.3, type:'spring', stiffness:300, damping:28}}
                                className={getChatPanelClass()}
                            >
                                <ChatPanel/>
                                {!isDesktop && (
                                    <div className="fixed inset-0 bg-black/30 -z-10" onClick={()=>setIsChatOpen(false)}/>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── MOBILE FABs ───────────────────────────────────── */}
                    {!isDesktop && !isChatOpen && (
                        <button
                            onClick={()=>setIsChatOpen(true)}
                            className="nb-fab-right w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white touch-manipulation"
                            style={{background:'linear-gradient(135deg,#1e4976,#2196c4)'}}>
                            <MessageSquare className="w-5 h-5"/>
                        </button>
                    )}
                    {isMobile && !isMobileSourcesOpen && (
                        <button
                            onClick={()=>setIsMobileSourcesOpen(true)}
                            className="nb-fab-left w-12 h-12 rounded-full shadow-lg flex items-center justify-center touch-manipulation"
                            style={{background:'#ffffff',border:'1.5px solid #e2e8f0'}}>
                            <Database className="w-5 h-5" style={{color:'#2196c4'}}/>
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default AINotebook;
