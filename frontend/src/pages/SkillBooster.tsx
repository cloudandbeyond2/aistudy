import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { serverURL } from '@/constants';
import axios from 'axios';
import { Sparkles, Target, Zap, Rocket, CheckCircle2, ChevronRight, BookOpen, Flame, History } from 'lucide-react';
// @ts-ignore
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const TOPICS = [
  { id: 'Career Building', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
  { id: 'Health & Wellness', icon: Target, color: 'from-green-500 to-emerald-500' },
  { id: 'Work Tasks & Productivity', icon: Zap, color: 'from-amber-500 to-orange-500' },
  { id: 'Leadership & Management', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { id: 'Communication Skills', icon: BookOpen, color: 'from-indigo-500 to-blue-500' },
  { id: 'Technical Skills', icon: Target, color: 'from-rose-500 to-red-500' },
  { id: 'Personal Finance', icon: Zap, color: 'from-emerald-500 to-teal-500' },
  { id: 'Custom', icon: Sparkles, color: 'from-slate-500 to-gray-500' },
];

export default function SkillBooster() {
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [dailyTip, setDailyTip] = useState<any>(null);
  
  const [selectedTopic, setSelectedTopic] = useState('Career Building');
  const [customTopic, setCustomTopic] = useState('');
  
  const [practiceTask, setPracticeTask] = useState('');
  const [practiceLog, setPracticeLog] = useState<any[]>([]);

  const userId = sessionStorage.getItem('uid');
  const plan = sessionStorage.getItem('type') || 'free';
  const role = sessionStorage.getItem('role') || 'user';
const isYearly = ['yearly', 'forever'].includes(plan);
  const isOrg = !!sessionStorage.getItem('orgId') || sessionStorage.getItem('isOrganization') === 'true';

  useEffect(() => {
    if (!userId) return;
if (!isYearly && !isOrg && role !== 'org_admin') {
      setIsLoading(false);
      return; 
    }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${serverURL}/api/skill-booster/profile?userId=${userId}`);
      if (res.data.success) {
        setProfile(res.data.data);
        setSelectedTopic(res.data.data.topic);
        if (res.data.data.customTopic) setCustomTopic(res.data.data.customTopic);
        
        // Fetch daily tip
        if (res.data.data.topic) {
          fetchDailyTip();
        }
        // Fetch log
        fetchPracticeLog();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyTip = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/skill-booster/daily-tip?userId=${userId}`);
      if (res.data.success) {
        setDailyTip(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPracticeLog = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/skill-booster/practice-log?userId=${userId}&limit=7`);
      if (res.data.success) {
        setPracticeLog(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTopic = async () => {
    try {
      setIsLoading(true);
      const res = await axios.put(`${serverURL}/api/skill-booster/topic`, {
        userId,
        topic: selectedTopic,
        customTopic: selectedTopic === 'Custom' ? customTopic : ''
      });
      if (res.data.success) {
        setProfile(res.data.data);
        toast({ title: 'Topic Updated', description: 'Your focus area has been updated.' });
        fetchDailyTip(); // generate new tip for new topic if needed
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Update Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoadmap = async () => {
    try {
      setIsGenerating(true);
      const res = await axios.post(`${serverURL}/api/skill-booster/generate-roadmap`, { userId });
      if (res.data.success) {
        setProfile(res.data.data);
        toast({ title: 'Roadmap Generated', description: 'Your AI learning path is ready!' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Generation Failed', description: 'Could not generate roadmap', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogPractice = async () => {
    if (!practiceTask.trim()) return;
    try {
      const res = await axios.post(`${serverURL}/api/skill-booster/practice`, {
        userId,
        task: practiceTask
      });
      if (res.data.success) {
        setPracticeTask('');
        setProfile(prev => ({ 
          ...prev, 
          level: res.data.data.level, 
          xp: res.data.data.xp,
          streak: res.data.data.streak
        }));
        fetchPracticeLog();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast({ title: 'XP Earned!', description: `+${res.data.data.xpAwarded} XP added to your profile.` });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const completeMilestone = async (index: number) => {
    try {
      const res = await axios.post(`${serverURL}/api/skill-booster/milestone-complete`, {
        userId,
        milestoneIndex: index
      });
      if (res.data.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast({ title: 'Milestone Reached!', description: '+50 XP awarded!' });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };


  // If user doesn't have access
 if (!isYearly && !isOrg && role !== 'org_admin') {
   return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4 py-8">
    
    {/* ICON */}
    <div className="bg-primary/10 p-6 rounded-full mb-6">
      <Zap className="h-16 w-16 text-primary" />
    </div>

    {/* TITLE */}
    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent mb-4">
      Unlock Skill Booster
    </h1>

    {/* DESCRIPTION */}
    <p className="text-base md:text-lg text-muted-foreground mb-8">
      Boost your growth with AI-powered roadmaps, daily insights, and smart practice tracking. 
      Upgrade to the Yearly plan to unlock your full potential.
    </p>

    {/* BUTTON */}
    <Button
      size="lg"
      onClick={() => window.location.href = '/dashboard/pricing'}
      className="px-8 shadow-lg"
    >
      <Zap className="h-4 w-4 mr-2" />
      Upgrade Now
    </Button>

  </div>
);
}
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg text-primary"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading your booster profile...</p>
        </div>
      </div>
    );
  }


  const xpForNextLevel = profile?.level ? profile.level * profile.level * 25 : 50; 
  const xpProgress = ((profile?.xp || 0) / xpForNextLevel) * 100;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600 flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary fill-primary/20" />
            Skill Booster
          </h1>
          <p className="text-muted-foreground mt-1">Your AI-powered personal growth engine.</p>
        </div>
        
        {/* Streak & Level Dashboard (Mobile friendly) */}
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-2 border border-orange-500/20 rounded-2xl shadow-sm">
             <Flame className="h-5 w-5 text-orange-500" />
             <div>
               <p className="text-[10px] uppercase font-bold text-orange-600/80 tracking-wider">Streak</p>
               <p className="font-bold text-orange-600 leading-none">{profile?.streak || 0} Days</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 border border-primary/20 rounded-2xl shadow-sm flex-1 md:flex-none">
             <Target className="h-5 w-5 text-primary" />
             <div>
               <p className="text-[10px] uppercase font-bold text-primary/80 tracking-wider">Level {profile?.level || 1}</p>
               <p className="font-bold text-primary leading-none">{profile?.xp || 0} XP</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Topic Selector */}
          <Card className="border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Current Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary shadow-sm"
              >
                {TOPICS.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
              </select>

              {selectedTopic === 'Custom' && (
                <input
                  type="text"
                  placeholder="E.g. Public Speaking, React.js"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                />
              )}

              <Button 
                onClick={handleUpdateTopic} 
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 shadow-md"
              >
                Set Focus
              </Button>
            </CardContent>
          </Card>

          {/* Daily Tip */}
          <Card className="border-border/50 shadow-md overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 transition-opacity group-hover:opacity-100 opacity-50" />
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Daily Insight
                </CardTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Today</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {dailyTip ? (
                <>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concept tip</p>
                    <p className="text-sm font-medium">{dailyTip.tip}</p>
                  </div>
                  <div className="space-y-1 bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Pro Trick
                    </p>
                    <p className="text-sm text-foreground/90">{dailyTip.trick}</p>
                  </div>
                  <div className="pt-2 border-t border-border/50 mt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Practice Idea</p>
                    <p className="text-sm text-muted-foreground italic">"{dailyTip.practiceIdea}"</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a focus area to get your first daily insight.</p>
              )}
            </CardContent>
          </Card>

          {/* Career Quick Tips (Conditional) */}
          {(profile?.topic === 'Career Building' || profile?.topic === 'Work Tasks & Productivity') && (
            <Card className="border-border/50 shadow-md">
               <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold text-sm">Career Hub Shortcuts</span>
                  </div>
                  <Button variant="outline" size="sm" className="justify-between" onClick={() => window.location.href='/dashboard/resume-builder'}>
                    Resume Builder <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-between" onClick={() => window.location.href='/dashboard/interview-prep'}>
                    Aptitude Tests <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                  </Button>
               </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Practice Logger */}
          <Card className="border-border/50 shadow-md">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                    Practice Logger
                  </CardTitle>
                  <CardDescription>Log activities related to your focus to earn XP.</CardDescription>
                </div>
                <div className="text-right">
                   <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Progress to Level {profile?.level ? profile.level + 1 : 2}</p>
                   <Progress value={Math.min(100, Math.max(0, xpProgress))} className="h-2 w-32 bg-secondary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="What did you practice today?"
                  value={practiceTask}
                  onChange={(e) => setPracticeTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogPractice()}
                  className="flex-1 h-12 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary shadow-inner"
                />
                <Button 
                  onClick={handleLogPractice}
                  className="h-12 px-6 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  Log It
                </Button>
              </div>

              {practiceLog.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                    <History className="h-4 w-4" /> Recent Logs
                  </div>
                  {practiceLog.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.task}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(log.completedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">+{log.xpAwarded} XP</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Roadmap */}
          <Card className="border-border/50 shadow-md">
            <CardHeader className="pb-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-purple-500" />
                    AI Road-map
                  </CardTitle>
                  <CardDescription>Your generated 10-step path to mastery.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateRoadmap}
                  disabled={isGenerating}
                  className="gap-2 rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/5"
                >
                  {isGenerating ? <Zap className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
                  {profile?.roadmap?.length > 0 ? 'Regenerate' : 'Generate Roadmap'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {profile?.roadmap && profile.roadmap.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {profile.roadmap.map((milestone: any, index: number) => {
                    const isCompleted = milestone.completed;
                    const isCurrent = index === profile.currentMilestoneIndex;
                    
                    return (
                      <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Dot */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isCompleted ? 'bg-emerald-500 border-emerald-100' : isCurrent ? 'bg-primary border-primary/20 animate-pulse' : 'bg-background border-border shadow-none'}`}>
                          {isCompleted ? <CheckCircle2 className="h-4 w-4 text-white" /> : <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-muted-foreground'}`}>{index+1}</span>}
                        </div>
                        
                        {/* Content */}
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border ${isCurrent ? 'border-primary shadow-lg shadow-primary/5 bg-gradient-to-b from-background to-primary/5' : 'border-border/50 bg-background/50'} transition-all`}>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-bold text-sm ${isCurrent ? 'text-primary' : ''}`}>{milestone.title}</h3>
                            <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">{milestone.estimatedDays} Days</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{milestone.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {milestone.skillTags?.map((tag:string, i:number) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{tag}</span>
                            ))}
                          </div>
                          
                          {!isCompleted && isCurrent && (
                            <Button 
                              size="sm" 
                              className="w-full h-8 text-xs rounded-lg shadow-sm"
                              onClick={() => completeMilestone(index)}
                            >
                              Complete Step
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="bg-primary/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Rocket className="h-8 w-8 text-primary opacity-50" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-1">No roadmap generated yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Click generate to map out your skill mastery path.</p>
                  <Button onClick={generateRoadmap} disabled={isGenerating} size="sm" className="rounded-xl shadow-md">
                    Generate My Roadmap
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Simple icon for briefcase as it might not be in the direct imports
function Briefcase(props:any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  )
}
