import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Bot,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  WandSparkles,
  ShieldCheck
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: number;
  role: ChatRole;
  content: string;
};

const welcomeMessage =
  "Hi! I'm your AI assistant. Ask me anything about the platform, your work, studies, or general guidance, and I'll help as clearly as I can.";

const suggestedPrompts = [
  'How do I update my profile?',
  'Explain the assignments section.',
  'How can I contact support?',
  'Give me study tips for interviews.'
];

const stripHtml = (html: string) => {
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent?.trim() || '';
};

const AIChatBot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextIdRef = useRef(2);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', content: welcomeMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buildPrompt = (question: string) => {
    const recentHistory = messages.slice(-8).map((message) => {
      const speaker = message.role === 'user' ? 'User' : 'Assistant';
      return `${speaker}: ${message.content}`;
    });

    return [
      'You are the Colossus IQ AI assistant.',
      'Help the user with platform questions, academic guidance, general productivity, and clear step-by-step answers.',
      'Keep responses friendly, concise, and practical.',
      'If the user asks something unrelated to the platform, answer helpfully anyway.',
      '',
      'Conversation:',
      ...recentHistory,
      `User: ${question}`,
      'Assistant:'
    ].join('\n');
  };

  const sendMessage = async (messageOverride?: string) => {
    const rawMessage = (messageOverride ?? inputValue).trim();
    if (!rawMessage || isThinking) return;

    const userMessage: ChatMessage = {
      id: nextIdRef.current++,
      role: 'user',
      content: rawMessage
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      const res = await axios.post(`${serverURL}/api/chat`, {
        prompt: buildPrompt(rawMessage)
      });

      const aiText = stripHtml(String(res.data?.text || res.data?.message || ''));

      setMessages((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          role: 'assistant',
          content: aiText || 'I could not generate a response just now. Please try again.'
        }
      ]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: 'AI chat unavailable',
        description: 'Please try again in a moment.',
        variant: 'destructive'
      });
    } finally {
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ id: 1, role: 'assistant', content: welcomeMessage }]);
    setInputValue('');
    nextIdRef.current = 2;
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,_#030712_0%,_#0f172a_50%,_#020617_100%)] text-white">
      <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight sm:text-2xl">Chat Bot AI</h1>
                <Badge className="border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
                  Online
                </Badge>
              </div>
              <p className="text-sm text-slate-300">
                Ask questions, get instant answers, and keep the conversation going.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={clearChat}
              className="rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear chat
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <CardHeader className="space-y-4 border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 ring-1 ring-cyan-300/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200/80">Assistant Guide</p>
                  <h2 className="text-xl font-semibold">What you can ask</h2>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                Use this page for platform questions, course help, student guidance, or general productivity advice.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <div className="space-y-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void sendMessage(prompt)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Private by default
                </div>
                <p className="text-sm leading-6 text-emerald-50/80">
                  Your conversation stays inside the dashboard experience, so you can ask freely and keep going from any page.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex min-h-[70vh] flex-col overflow-hidden border-white/10 bg-white/5 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <CardHeader className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200/80">Conversation</p>
                  <h2 className="text-xl font-semibold">Ask anything</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <WandSparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Powered by AI
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-18rem)]">
                <div ref={scrollRef} className="space-y-4 p-5">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-lg sm:max-w-[80%]',
                            message.role === 'user'
                              ? 'rounded-br-md border border-cyan-400/30 bg-cyan-500 text-white'
                              : 'rounded-bl-md border border-white/10 bg-slate-950/50 text-slate-100'
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                            {message.role === 'user' ? (
                              <>
                                <MessageSquare className="h-3.5 w-3.5" />
                                You
                              </>
                            ) : (
                              <>
                                <Bot className="h-3.5 w-3.5" />
                                AI Assistant
                              </>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-3xl rounded-bl-md border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 shadow-lg">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                          <Bot className="h-3.5 w-3.5" />
                          Thinking
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <div className="border-t border-white/10 p-4 sm:p-5">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-3 shadow-inner shadow-black/20">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="min-h-[120px] resize-none border-0 bg-transparent text-base text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isThinking}
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
                      Ask anything
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <MessageSquare className="h-3.5 w-3.5 text-cyan-300" />
                      Multi-turn chat
                    </span>
                  </div>

                  <Button
                    onClick={() => void sendMessage()}
                    disabled={isThinking || !inputValue.trim()}
                    className="h-12 rounded-2xl bg-cyan-500 px-5 text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;
