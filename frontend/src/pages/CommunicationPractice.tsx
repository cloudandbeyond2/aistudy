import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen, PenTool, CheckCircle, Flame, Target, Sparkles, Loader2, Award, Zap, History, Lightbulb, UserPlus, Info, TrendingUp, ChevronLeft, ChevronRight, RotateCcw, Trash2, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import SEO from '@/components/SEO';

const DAILY_TIPS = [
  { title: "Active Listening", content: "Repeat what you heard back to the speaker to ensure you understood correctly. This builds trust.", icon: MessageSquare },
  { title: "Conciseness", content: "In professional emails, put the most important information in the first two sentences.", icon: Zap },
  { title: "Body Language", content: "Non-verbal cues account for over 50% of communication. Maintain open posture.", icon: UserPlus },
  { title: " Tone Awareness", content: "Matching the other person's energy level can help build rapport quickly.", icon: Sparkles }
];

const XP_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2500];

const STYLES = `
  .perspective-1000 { perspective: 1000px; }
  .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;

const CommunicationPractice = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [tone, setTone] = useState('Professional');

  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [grammarTest, setGrammarTest] = useState<any[]>([]);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testResult, setTestResult] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Vocabulary Hub / Flashcards
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [vocabFilter, setVocabFilter] = useState('all'); // all, to-study, mastered

  const userId = sessionStorage.getItem('uid');
  const { toast } = useToast();

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = STYLES;
    document.head.appendChild(styleTag);
    return () => { document.head.removeChild(styleTag); };
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/communication-practice/profile?userId=${userId}`);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getNextLevelXP = (xp: number) => {
    const next = XP_THRESHOLDS.find(t => t > xp);
    return next || xp; // Max level reached
  };

  const currentXP = profile?.xp || 0;
  const nextXP = getNextLevelXP(currentXP);
  const progressPercent = Math.min((currentXP / nextXP) * 100, 100);

  // Scenario
  const fetchScenario = async () => {
    setGenerating(true);
    setEvaluation(null);
    setUserResponse('');
    try {
      const res = await axios.get(`${serverURL}/api/communication-practice/scenario?userId=${userId}&tone=${tone}`);
      console.log('--- AI TOKEN USAGE (Comm Practice Scenario) ---');
      console.table(res.data.usage);
      if (res.data.success) {
        setScenarioData(res.data.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate scenario', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const submitScenario = async () => {
    if (!userResponse.trim()) {
      toast({ title: 'Input required', description: 'Please type your response.', variant: 'destructive' });
      return;
    }
    setEvaluating(true);
    try {
      const res = await axios.post(`${serverURL}/api/communication-practice/scenario`, {
        userId,
        scenario: scenarioData.scenario,
        userResponse
      });
      console.log('--- AI TOKEN USAGE (Comm Practice Evaluation) ---');
      console.table(res.data.usage);
      if (res.data.success) {
        setEvaluation(res.data.data.evaluation);
        setProfile(prev => ({ ...prev, xp: prev.xp + res.data.data.xpAwarded, level: res.data.data.newLevel, streak: res.data.data.streak }));
        toast({ title: `+${res.data.data.xpAwarded} XP`, description: 'Scenario evaluated!' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to evaluate response', variant: 'destructive' });
    } finally {
      setEvaluating(false);
    }
  };

  // Vocabulary
  const fetchVocabulary = async () => {
    setGenerating(true);
    try {
      const res = await axios.get(`${serverURL}/api/communication-practice/vocabulary?userId=${userId}`);
      console.log('--- AI TOKEN USAGE (Comm Practice Vocab) ---');
      console.table(res.data.usage);
      if (res.data.success) {
        setVocabulary(res.data.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate vocabulary', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const saveWord = async (wordData: any) => {
    try {
      const res = await axios.post(`${serverURL}/api/communication-practice/vocabulary`, {
        userId,
        ...wordData
      });
      if (res.data.success) {
        toast({ title: 'Saved', description: `${wordData.word} added to your bank. +2 XP` });
        setVocabulary(prev => prev.filter(v => v.word !== wordData.word));
        fetchProfile(); // refresh bank
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save word', variant: 'destructive' });
    }
  };

  const toggleMastery = async (wordId: string, currentStatus: boolean) => {
    try {
      const res = await axios.patch(`${serverURL}/api/communication-practice/vocabulary/mastery`, {
        userId,
        wordId,
        mastered: !currentStatus
      });
      if (res.data.success) {
        toast({ 
          title: !currentStatus ? 'Word Mastered! +10 XP' : 'Moved to study list', 
          description: `Status updated for ${res.data.data.word}` 
        });
        fetchProfile();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const deleteWord = async (wordId: string) => {
    try {
      const res = await axios.delete(`${serverURL}/api/communication-practice/vocabulary`, {
        data: { userId, wordId }
      });
      if (res.data.success) {
        toast({ title: 'Removed', description: 'Word removed from your bank' });
        fetchProfile();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove word', variant: 'destructive' });
    }
  };

  // Grammar Test
  const generateTest = async () => {
    setGenerating(true);
    setTestResult(null);
    setTestAnswers([]);
    try {
      const res = await axios.get(`${serverURL}/api/communication-practice/grammar-test?userId=${userId}`);
      console.log('--- AI TOKEN USAGE (Comm Practice Grammar Test) ---');
      console.table(res.data.usage);
      if (res.data.success) {
        setGrammarTest(res.data.data);
        setTestAnswers(new Array(res.data.data.length).fill(-1));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate test', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const submitTest = async () => {
    if (testAnswers.includes(-1)) {
      toast({ title: 'Incomplete', description: 'Please answer all questions', variant: 'destructive' });
      return;
    }
    
    setEvaluating(true);
    let score = 0;
    testAnswers.forEach((ans, idx) => {
      if (ans === grammarTest[idx].correctAnswerIndex) score++;
    });

    try {
      const res = await axios.post(`${serverURL}/api/communication-practice/grammar-test`, {
        userId,
        score,
        totalQuestions: grammarTest.length
      });
      if (res.data.success) {
        setTestResult({ score, total: grammarTest.length, awarded: res.data.data.xpAwarded });
        setProfile(prev => ({ ...prev, xp: prev.xp + res.data.data.xpAwarded, level: res.data.data.newLevel, streak: res.data.data.streak }));
        toast({ title: 'Test Completed', description: `You scored ${score}/${grammarTest.length} (+${res.data.data.xpAwarded} XP)` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit test', variant: 'destructive' });
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pt-20">
      <SEO title="Communication Practice" description="AI Language and Communication Coach" />
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              Communication Practice
            </h1>
            <p className="text-slate-500 mt-1">Master professional language and communication with AI-driven exercises.</p>
          </div>
          
          <div className="flex gap-4">
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg min-w-[200px]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Level {profile?.level || 1} Communicator</p>
                  <p className="text-2xl font-bold font-mono">{currentXP} <span className="text-sm font-normal">XP</span></p>
                </div>
                <Award className="h-10 w-10 text-white/20" />
              </CardContent>
              <div className="h-1.5 w-full bg-black/20">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </Card>
            
            <Card className="bg-white border-slate-200 shadow-sm flex items-center justify-center px-6 min-w-[120px]">
              <div className="text-center">
                <div className="flex flex-col items-center">
                  <Flame className={`h-8 w-8 ${profile?.streak > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
                  <span className="font-bold text-lg">{profile?.streak || 0}</span>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Day Streak</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Interface Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl bg-white border border-slate-200 p-1 rounded-xl h-auto shadow-sm">
            <TabsTrigger value="dashboard" className="py-3 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 rounded-lg">
              <History className="h-4 w-4 mr-2" /> Hub
            </TabsTrigger>
            <TabsTrigger value="scenario" className="py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg">
              <PenTool className="h-4 w-4 mr-2" /> Scenario
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="py-3 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg">
              <BookOpen className="h-4 w-4 mr-2" /> Vocabulary
            </TabsTrigger>
            <TabsTrigger value="grammar" className="py-3 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 rounded-lg">
              <Target className="h-4 w-4 mr-2" /> Tests
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-2 border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                       <span className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-indigo-500" /> Recent Activity</span>
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vocab Mastered</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Progress value={((profile?.vocabularyBank?.filter((v: any) => v.mastered).length || 0) / (profile?.vocabularyBank?.length || 1)) * 100} className="w-24 h-1.5" />
                                <span className="text-xs font-bold text-slate-700">{profile?.vocabularyBank?.filter((v: any) => v.mastered).length || 0}/{profile?.vocabularyBank?.length || 0}</span>
                             </div>
                          </div>
                       </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile?.practiceLogs?.length > 0 ? (
                      <div className="space-y-4">
                        {profile.practiceLogs.slice(0, 5).map((log: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                             <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${log.score > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                   <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-800 line-clamp-1">{log.scenario}</p>
                                   <p className="text-[10px] text-slate-500 uppercase font-semibold">{log.date}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-indigo-600">+{log.xpAwarded} XP</p>
                                <p className="text-[10px] text-slate-400">{log.score}/100</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                         <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                         <p>No practice logs found. Start your first scenario!</p>
                      </div>
                    )}
                  </CardContent>
               </Card>

               <div className="space-y-6">
                  {/* Tip Card */}
                  <Card className="border-0 shadow-md bg-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Lightbulb className="h-20 w-20" />
                    </div>
                    <CardHeader>
                       <CardTitle className="text-indigo-100 text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4" /> Tip of the Day
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <p className="text-lg font-bold leading-tight">
                          {DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length].content}
                       </p>
                       <div className="text-[10px] font-bold uppercase tracking-wider border border-white/20 px-2 py-0.5 rounded-full bg-white/10">
                          {DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length].title}
                       </div>
                    </CardContent>
                  </Card>

                  {/* Quick Start */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                       <CardTitle className="text-sm font-semibold text-slate-500 uppercase">Quick Start</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1">
                       <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors" onClick={() => setActiveTab('scenario')}>
                          <PenTool className="h-4 w-4 mr-2" /> Start Scenario
                       </Button>
                       <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors" onClick={() => setActiveTab('vocabulary')}>
                          <BookOpen className="h-4 w-4 mr-2" /> Expand Vocab
                       </Button>
                       <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" onClick={() => setActiveTab('grammar')}>
                          <Target className="h-4 w-4 mr-2" /> Take Test
                       </Button>
                    </CardContent>
                  </Card>
               </div>
            </div>
          </TabsContent>

          {/* Scenario Tab */}
          <TabsContent value="scenario" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /> Scenario Generator</span>
                    <div className="flex items-center gap-3">
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="w-[140px] h-9 bg-white">
                          <SelectValue placeholder="Tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Informal">Informal</SelectItem>
                          <SelectItem value="Academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={fetchScenario} disabled={generating} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Generate New'}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {scenarioData ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-slate-800 font-medium leading-relaxed">{scenarioData.scenario}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tips to consider</p>
                        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                          {scenarioData.tips?.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                        </ul>
                      </div>
                      <Textarea 
                        placeholder="Draft your response here..." 
                        className="min-h-[200px] resize-none"
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                      />
                      <Button onClick={submitScenario} disabled={evaluating || !userResponse.trim()} className="w-full">
                        {evaluating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Submit for Evaluation'}
                      </Button>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400 flex-col">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                      <p>Click generate to begin your daily practice.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {evaluation && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-900 to-slate-900 text-white h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                      <Zap className="h-32 w-32" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-indigo-200">AI Evaluation Focus</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                      <div className="flex items-end gap-3 border-b border-white/10 pb-4">
                        <span className="text-5xl font-bold">{evaluation.score}</span>
                        <span className="text-indigo-300 pb-1 font-medium">/ 100 Score</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2">Feedback</h4>
                        <p className="text-slate-200 leading-relaxed text-sm bg-white/5 p-4 rounded-lg">{evaluation.feedback}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">Improved Version</h4>
                        <p className="text-emerald-50 leading-relaxed text-sm bg-emerald-900/40 p-4 rounded-lg border border-emerald-500/30">
                          {evaluation.improvedVersion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">Communication Vocabulary</h3>
                  <p className="text-sm text-slate-500">Collect words and master them through flashcards.</p>
                </div>
                <div className="flex items-center gap-2">
                   <Button 
                    variant={isStudyMode ? "default" : "outline"} 
                    onClick={() => { setIsStudyMode(!isStudyMode); setIsFlipped(false); setFlashcardIndex(0); }}
                    className={isStudyMode ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 text-purple-700"}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> {isStudyMode ? "Exit Study Mode" : "Start Flashcards"}
                  </Button>
                  <Button onClick={fetchVocabulary} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />} Get New Words
                  </Button>
                </div>
              </div>

              {!isStudyMode ? (
                <div className="space-y-6">
                  {vocabulary.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {vocabulary.map((v, i) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                          <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xl capitalize text-purple-900">{v.word}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-700 mb-4 h-16">{v.meaning}</p>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 h-20 overflow-y-auto">
                                <p className="text-sm text-slate-600 italic">"{v.example}"</p>
                              </div>
                              <Button 
                                variant="outline" 
                                className="w-full mt-4 border-purple-200 text-purple-700 hover:bg-purple-50"
                                onClick={() => saveWord(v)}
                              >
                                Save to Bank
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {profile?.vocabularyBank?.length > 0 && (
                    <div className="pt-8">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-slate-800">Your Vocabulary Bank ({profile.vocabularyBank.length})</h3>
                          <div className="flex bg-slate-100 p-1 rounded-lg">
                             {['all', 'to-study', 'mastered'].map((f) => (
                                <button
                                   key={f}
                                   className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${vocabFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                   onClick={() => setVocabFilter(f)}
                                >
                                   {f === 'all' ? 'All' : f === 'to-study' ? 'To Study' : 'Mastered'}
                                </button>
                             ))}
                          </div>
                       </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {profile.vocabularyBank
                          .filter((v: any) => {
                             if (vocabFilter === 'to-study') return !v.mastered;
                             if (vocabFilter === 'mastered') return v.mastered;
                             return true;
                          })
                          .map((v: any, i: number) => (
                          <div key={v._id || i} className={`p-4 rounded-xl border transition-all ${v.mastered ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                               <p className={`font-bold capitalize ${v.mastered ? 'text-emerald-900' : 'text-slate-800'}`}>{v.word}</p>
                               <div className="flex gap-1">
                                  <button onClick={() => toggleMastery(v._id, v.mastered)} className={`p-1 rounded-md ${v.mastered ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}>
                                     <Check className="h-3 w-3" />
                                  </button>
                                  <button onClick={() => deleteWord(v._id)} className="p-1 rounded-md bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600">
                                     <Trash2 className="h-3 w-3" />
                                  </button>
                               </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2" title={v.meaning}>{v.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                   {profile?.vocabularyBank?.filter((v: any) => !v.mastered).length > 0 ? (
                      <div className="w-full max-w-md space-y-8">
                         <div className="text-center">
                            <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-1">Flashcard {flashcardIndex + 1} of {profile.vocabularyBank.filter((v: any) => !v.mastered).length}</p>
                            <p className="text-xs text-slate-400">Click card to flip</p>
                         </div>

                         <div className="perspective-1000 h-80 relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                            <motion.div 
                               className="w-full h-full relative"
                               initial={false}
                               animate={{ rotateY: isFlipped ? 180 : 0 }}
                               transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                               style={{ transformStyle: "preserve-3d" }}
                            >
                               {/* Front */}
                               <div className="absolute w-full h-full bg-white rounded-3xl border-2 border-purple-100 shadow-xl flex flex-col items-center justify-center p-8 backface-hidden">
                                  <h4 className="text-4xl font-black text-slate-900 capitalize text-center">{profile.vocabularyBank.filter((v: any) => !v.mastered)[flashcardIndex]?.word}</h4>
                                  <div className="mt-8 flex items-center text-purple-400 gap-2">
                                     <RotateCcw className="h-4 w-4" />
                                     <span className="text-xs font-bold uppercase">Click to view meaning</span>
                                  </div>
                               </div>

                               {/* Back */}
                               <div className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white flex flex-col items-center justify-center p-8 backface-hidden" style={{ transform: "rotateY(180deg)" }}>
                                  <div className="text-center space-y-4">
                                     <div>
                                        <p className="text-[10px] uppercase font-black text-indigo-200 tracking-tighter mb-1">Meaning</p>
                                        <p className="text-lg font-medium leading-tight">{profile.vocabularyBank.filter((v: any) => !v.mastered)[flashcardIndex]?.meaning}</p>
                                     </div>
                                     <div className="pt-4 border-t border-white/10">
                                        <p className="text-[10px] uppercase font-black text-indigo-200 tracking-tighter mb-1">Example</p>
                                        <p className="text-sm italic opacity-90">"{profile.vocabularyBank.filter((v: any) => !v.mastered)[flashcardIndex]?.example}"</p>
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                         </div>

                         <div className="flex items-center justify-between gap-4">
                            <Button 
                               variant="outline" 
                               disabled={flashcardIndex === 0} 
                               onClick={() => { setFlashcardIndex(prev => prev - 1); setIsFlipped(false); }}
                               className="flex-1"
                            >
                               <ChevronLeft className="h-4 w-4 mr-2" /> Prev
                            </Button>
                            <Button 
                               className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                               onClick={() => {
                                  toggleMastery(profile.vocabularyBank.filter((v: any) => !v.mastered)[flashcardIndex]?._id, false);
                                  if (flashcardIndex === profile.vocabularyBank.filter((v: any) => !v.mastered).length - 1 && flashcardIndex > 0) {
                                     setFlashcardIndex(prev => prev - 1);
                                  }
                                  setIsFlipped(false);
                               }}
                            >
                               <Check className="h-4 w-4 mr-2" /> Mastered
                            </Button>
                            <Button 
                               variant="outline" 
                               disabled={flashcardIndex === profile.vocabularyBank.filter((v: any) => !v.mastered).length - 1} 
                               onClick={() => { setFlashcardIndex(prev => prev + 1); setIsFlipped(false); }}
                               className="flex-1"
                            >
                               Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm w-full max-w-md">
                         <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8" />
                         </div>
                         <h4 className="text-xl font-bold text-slate-900">All caught up!</h4>
                         <p className="text-slate-500 mt-2">You've mastered all the words in your bank. <br />Add new words to continue practicing.</p>
                         <Button variant="link" className="mt-4 text-purple-600" onClick={() => setIsStudyMode(false)}>Back to Bank</Button>
                      </div>
                   )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Grammar Test Tab */}
          <TabsContent value="grammar" className="mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-emerald-900">Grammar & Syntax Assessment</CardTitle>
                  <CardDescription>Test your mechanics with AI-generated questions.</CardDescription>
                </div>
                {!grammarTest.length && (
                  <Button onClick={generateTest} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Start Assessment'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {grammarTest.length > 0 ? (
                  <div className="space-y-8">
                    {grammarTest.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="font-medium text-slate-800 mb-4"><span className="text-emerald-600 font-bold mr-2">{qIndex + 1}.</span>{q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt: string, oIndex: number) => {
                            const isSelected = testAnswers[qIndex] === oIndex;
                            const isCorrect = testResult && q.correctAnswerIndex === oIndex;
                            const isWrong = testResult && isSelected && !isCorrect;
                            
                            let btnClass = "w-full justify-start font-normal text-left h-auto py-3 px-4 border-slate-200 text-slate-700 hover:bg-slate-50";
                            if (testResult) {
                              if (isCorrect) btnClass = "w-full justify-start font-medium text-left h-auto py-3 px-4 bg-emerald-50 border-emerald-500 text-emerald-800";
                              else if (isWrong) btnClass = "w-full justify-start font-medium text-left h-auto py-3 px-4 bg-red-50 border-red-500 text-red-800";
                              else btnClass = "w-full justify-start font-normal text-left h-auto py-3 px-4 border-slate-200 opacity-50";
                            } else if (isSelected) {
                              btnClass = "w-full justify-start font-medium text-left h-auto py-3 px-4 bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm";
                            }

                            return (
                              <Button
                                key={oIndex}
                                variant="outline"
                                className={btnClass}
                                onClick={() => {
                                  if (!testResult) {
                                    const newAns = [...testAnswers];
                                    newAns[qIndex] = oIndex;
                                    setTestAnswers(newAns);
                                  }
                                }}
                              >
                                {opt}
                                {testResult && isCorrect && <CheckCircle className="h-4 w-4 ml-auto text-emerald-600" />}
                              </Button>
                            );
                          })}
                        </div>
                        {testResult && (
                          <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 flex gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">Explanation:</p>
                              <p className="text-sm text-slate-600">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      {!testResult ? (
                        <Button size="lg" onClick={submitTest} disabled={evaluating} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
                          {evaluating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Submit Assessment'}
                        </Button>
                      ) : (
                        <Button size="lg" onClick={generateTest} disabled={generating} className="w-full md:w-auto">
                          Take Another Test
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 flex-col">
                    <Target className="h-8 w-8 mb-2 opacity-20" />
                    <p>{generating ? 'Generating assessment...' : 'Click start to test your grammar skills.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunicationPractice;
