import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    FileText, Upload, Link as LinkIcon, MessageSquare, BookOpen, BrainCircuit, Sparkles, Send, Plus,
    Trash2, FileType, CheckCircle2, ChevronRight, RefreshCw, Lightbulb, Type, Video, Headphones, Target, Layers, Loader2
} from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { serverURL } from '@/constants';
import showdown from 'showdown';
import { useNavigate } from 'react-router-dom';

const converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    strikethrough: true,
    ghCodeBlocks: true,
    simplifiedAutoLink: true
});

// Initial data
const INITIAL_SOURCES: any[] = [];

const SUGGESTED_QUESTIONS = [
    "What is the main topic of these documents?",
    "Summarize the Introduction to ML.",
    "Identify key terms and definitions.",
    "Create a 5-question quiz from these notes."
];

const AINotebook = () => {
    useBranding(); // Just to ensure context is present if needed, though we don't use the values yet
    const [sources, setSources] = useState(INITIAL_SOURCES);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'system', content: 'Hi! Im your AI Study Assistant. I have reviewed your selected sources and am ready to answer any questions or help you summarize the materials.' }
    ]);
    const [currentInput, setCurrentInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [notes, setNotes] = useState('');
    const [activeTab, setActiveTab] = useState('guide');
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const userType = sessionStorage.getItem('type');
        if (!['monthly', 'yearly', 'forever'].includes(userType)) {
            navigate('/dashboard/pricing');
        }
    }, [navigate]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${serverURL}/api/notebook/upload-source`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSources([...sources, res.data.source]);
            }
        } catch (error) {
            console.error('Upload failed', error);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const toggleSourceSelection = (id: string) => {
        setSources(sources.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    const handleSendMessage = async () => {
        if (!currentInput.trim()) return;

        // Add User message
        const newMessages = [...chatMessages, { role: 'user', content: currentInput }];
        setChatMessages(newMessages);
        setCurrentInput('');
        setIsGenerating(true);

        const selectedContext = sources
            .filter(s => s.selected)
            .map(s => s.content)
            .join('\n\n');

        try {
            const res = await axios.post(`${serverURL}/api/notebook/chat`, {
                messages: newMessages.filter(m => m.role !== 'system' || newMessages.indexOf(m) > 0), // Filter out first system greeting if needed, or better, let controller handle it
                context: selectedContext
            });

            if (res.data.success) {
                setChatMessages([...newMessages, { role: 'system', content: res.data.generatedText }]);
            }
        } catch (error: any) {
            console.error('Chat error', error);
            const errMsg = error?.response?.data?.message || 'An error occurred while generating the response.';
            setChatMessages([...newMessages, { role: 'system', content: errMsg }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAction = async (actionDesc: string) => {
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
                const newNoteContent = `\n\n### ${actionDesc}\n\n${res.data.generatedText}`;
                setNotes(prev => prev + newNoteContent);
                setIsEditMode(false); // Switch to preview to show the result
            }
        } catch (error) {
            console.error('Action error', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileType className="w-5 h-5 text-red-500" />;
            case 'url': return <LinkIcon className="w-5 h-5 text-blue-500" />;
            default: return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] w-full gap-4 bg-background">

            {/* LEFT SIDEBAR: SOURCES */}
            <Card className="w-full md:w-80 border-border/40 shadow-sm flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="px-5 py-5 border-b border-border/40 flex flex-row items-center justify-between space-y-0 bg-muted/5">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2.5">
                            <BookOpen className="w-5 h-5 text-primary" /> Sources
                        </CardTitle>
                        <CardDescription className="text-xs">Ground your AI with custom data</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono bg-background shadow-sm border-primary/20 text-primary px-2">{sources.length}</Badge>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                    <div className="p-4 flex gap-2 border-b border-border/40">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            accept=".pdf,.txt"
                        />
                        <Button variant="outline" size="sm" className="flex-1 border-dashed" onClick={() => fileInputRef.current?.click()}>
                            <Plus className="w-4 h-4 mr-2" /> Add Source
                        </Button>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-3">
                            {sources.length === 0 ? (
                                <div className="py-10 px-4 text-center space-y-3 flex flex-col items-center justify-center opacity-60">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-1">
                                        <Plus className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium">Add your first source</p>
                                    <p className="text-xs text-muted-foreground max-w-[180px]">Upload PDFs or paste text to build your knowledge base.</p>
                                </div>
                            ) : (
                                sources.map((source) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={source.id}
                                        onClick={() => toggleSourceSelection(source.id)}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-4 group relative overflow-hidden ${source.selected
                                            ? 'border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                            : 'border-border/40 hover:border-primary/30 hover:bg-muted/30 shadow-[0_2px_4px_rgba(0,0,0,0.02)]'
                                            }`}
                                    >
                                        <div className="mt-0.5 relative z-10">
                                            {source.selected ? (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary/40 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className={`p-1.5 rounded-lg ${source.type === 'pdf' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                                                    {getSourceIcon(source.type)}
                                                </div>
                                                <p className="font-bold text-sm truncate">{source.title}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                                                    <Type className="w-3 h-3" /> {source.words.toLocaleString()} words
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0 -mr-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSources(sources.filter(s => s.id !== source.id));
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* MAIN CONTENT AREA: NOTEBOOK STUDIO */}
            <Card className="flex-1 border-border/40 shadow-md flex flex-col overflow-hidden relative overflow-y-auto">
                <CardHeader className="px-6 py-5 border-b border-border/40 bg-card z-10 sticky top-0 backdrop-blur-md bg-opacity-80">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 text-gradient flex items-center gap-2">
                                <BrainCircuit className="w-6 h-6 text-primary" /> Notebook Studio
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                                Your AI-powered workspace for deep learning.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setIsChatOpen(!isChatOpen)} variant={isChatOpen ? "secondary" : "outline"} className="hidden md:flex shadow-sm transition-all hover:scale-105 active:scale-95">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {isChatOpen ? 'Close Chat' : 'Open Chat'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                        <div className="px-6 border-b border-border/40 pt-4 bg-muted/10">
                            <TabsList className="bg-transparent space-x-2">
                                <TabsTrigger value="guide" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg border-b-0 pb-3">Notebook Guide</TabsTrigger>
                                <TabsTrigger value="notes" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg border-b-0 pb-3">My Notes</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="guide" className="p-6 m-0 h-full">

                                {/* Audio Overview Section (Like NotebookLM) */}
                                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-indigo-500/5 to-purple-500/5 border border-primary/10 shadow-inner relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700"></div>

                                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center shadow-lg relative shrink-0">
                                            <Headphones className="w-7 h-7 text-primary" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-lg font-bold mb-1 font-display">Audio Overview</h3>
                                            <p className="text-sm text-muted-foreground">Generate an engaging "podcast-style" discussion synthesizing all your selected sources.</p>
                                        </div>
                                        <Button
                                            onClick={() => handleGenerateAction("Audio Overview")}
                                            disabled={isGenerating || sources.length === 0}
                                            className="rounded-full shadow-md bg-gradient-to-r from-primary to-indigo-500 hover:shadow-lg transition-transform hover:scale-105 active:scale-95 px-6">
                                            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                            {isGenerating ? "Generating..." : "Generate"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick Actions Grid */}
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Recommended Actions
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { title: 'Study Guide', desc: 'Comprehensive overview', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { title: 'FAQ', desc: 'Frequently asked questions', icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-500/10' },
                                            { title: 'Timeline', desc: 'Chronological event list', icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                            { title: 'Briefing Doc', desc: 'Executive summary', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                            { title: 'Flashcards', desc: 'For active recall', icon: Layers, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                                            { title: 'Quiz', desc: 'Test your knowledge', icon: CheckCircle2, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                                        ].map((item, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={item.title}
                                                onClick={() => handleGenerateAction(item.title)}
                                                className={`p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 hover:border-border cursor-pointer transition-all hover:shadow-sm group flex flex-col gap-3 ${(isGenerating || sources.length === 0) ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className={`p-2 rounded-lg ${item.bg}`}>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{item.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Suggested Questions */}
                                <div className="mt-8 pt-6 border-t border-border/40">
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" /> Ask your sources
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTED_QUESTIONS.map((q) => (
                                            <Badge
                                                key={q}
                                                variant="secondary"
                                                className="px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-normal rounded-full border shadow-sm"
                                                onClick={() => {
                                                    setCurrentInput(q);
                                                    if (!isChatOpen) setIsChatOpen(true);
                                                }}
                                            >
                                                {q}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="notes" className="p-0 m-0 h-full flex flex-col">
                                <div className="px-6 py-3 border-b border-border/40 bg-muted/5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Notebook Content</span>
                                    </div>
                                    <div className="flex bg-muted/50 p-1 rounded-lg border border-border/40">
                                        <Button
                                            variant={isEditMode ? "ghost" : "secondary"}
                                            size="sm"
                                            className="h-7 px-3 text-xs rounded-md"
                                            onClick={() => setIsEditMode(false)}
                                        >
                                            <BookOpen className="h-3 w-3 mr-1.5" /> Preview
                                        </Button>
                                        <Button
                                            variant={isEditMode ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-7 px-3 text-xs rounded-md"
                                            onClick={() => setIsEditMode(true)}
                                        >
                                            <FileType className="h-3 w-3 mr-1.5" /> Edit
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto bg-background/30">
                                    {isEditMode ? (
                                        <Textarea
                                            className="w-full h-full border-0 focus-visible:ring-0 rounded-none resize-none p-8 text-base bg-transparent min-h-[500px] font-mono leading-relaxed"
                                            placeholder="Start typing your notes here. You can ask AI to help you draft or summarize while you write..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    ) : (
                                        <div className="p-10 max-w-4xl mx-auto">
                                            {notes ? (
                                                <div
                                                    className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/40"
                                                    dangerouslySetInnerHTML={{ __html: converter.makeHtml(notes) }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                                        <FileText className="w-8 h-8 text-muted-foreground/50" />
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground font-medium">Your notebook is empty</p>
                                                        <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Start by asking a question or generating a study guide from the Guide tab.</p>
                                                    </div>
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

            {/* RIGHT SIDEBAR: CHAT (Expandable) */}
            <AnimatePresence>
                {(isChatOpen || !isChatOpen && window.innerWidth < 768) && ( // On mobile it might be better as modal, but let's keep it simple for now
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 380, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:relative fixed inset-y-0 right-0 z-50 md:z-0 flex shrink-0"
                    >
                        <Card className="w-full h-full border-border/40 shadow-xl md:shadow-sm flex flex-col overflow-hidden bg-card/90 backdrop-blur-xl">
                            <CardHeader className="py-4 border-b border-border/40 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-indigo-500" /> Chat
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="md:hidden">
                                        Close
                                    </Button>
                                </div>
                            </CardHeader>

                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                : 'bg-muted border rounded-tl-sm text-foreground'
                                                }`}>
                                                {msg.role === 'system' ? (
                                                    <div
                                                        className="text-sm leading-relaxed prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 mt-0.5"
                                                        dangerouslySetInnerHTML={{ __html: converter.makeHtml(msg.content) }}
                                                    />
                                                ) : (
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isGenerating && (
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted border rounded-tl-sm flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <CardFooter className="p-3 bg-muted/20 border-t border-border/40">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="w-full relative flex items-center"
                                >
                                    <Input
                                        value={currentInput}
                                        onChange={(e) => setCurrentInput(e.target.value)}
                                        placeholder="Ask about your sources..."
                                        className="pr-12 rounded-full border-border/50 bg-background shadow-sm focus-visible:ring-primary/50"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!currentInput.trim() || isGenerating}
                                        className="absolute right-1 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AINotebook;
