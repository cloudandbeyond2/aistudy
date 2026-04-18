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
      console.log('--- AI TOKEN USAGE (General AI Chat) ---');
      console.table(res.data.usage);

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
    <div className="min-h-[100dvh] bg-gradient-to-br via-white to-gray-50 pt-0 md:pt-0 lg:pt-[60px]">
      <div className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 shadow-lg shadow-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">Chat Bot AI</h1>
                <Badge className="border border-green-200 bg-green-50 text-green-700">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Online
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Ask questions, get instant answers, and keep the conversation going.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={clearChat}
              className="rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear chat
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="border border-gray-200 bg-white shadow-lg">
            <CardHeader className="space-y-4 border-b border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Assistant Guide</p>
                  <h2 className="text-lg font-bold text-gray-800">What you can ask</h2>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-600">
                Use this page for platform questions, course help, student guidance, or general productivity advice.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <div className="space-y-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void sendMessage(prompt)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
                  <ShieldCheck className="h-4 w-4" />
                  Private by default
                </div>
                <p className="text-sm leading-relaxed text-blue-700">
                  Your conversation stays inside the dashboard experience, so you can ask freely and keep going from any page.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex min-h-[70vh] flex-col overflow-hidden border border-gray-200 bg-white shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Conversation</p>
                  <h2 className="text-lg font-bold text-gray-800">Ask anything</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                  <WandSparkles className="h-3.5 w-3.5 text-blue-500" />
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
                            'max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[80%]',
                            message.role === 'user'
                              ? 'rounded-br-md bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                              : 'rounded-bl-md border border-gray-200 bg-gray-50 text-gray-800'
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                            {message.role === 'user' ? (
                              <>
                                <MessageSquare className="h-3 w-3" />
                                You
                              </>
                            ) : (
                              <>
                                <Bot className="h-3 w-3" />
                                AI Assistant
                              </>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
                      <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                          <Bot className="h-3 w-3" />
                          Thinking
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.2s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.1s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
              <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="min-h-[100px] resize-none border-0 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isThinking}
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      Ask anything
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                      Multi-turn chat
                    </span>
                  </div>

                  <Button
                    onClick={() => void sendMessage()}
                    disabled={isThinking || !inputValue.trim()}
                    className="h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 text-white shadow-md transition-all hover:shadow-lg"
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