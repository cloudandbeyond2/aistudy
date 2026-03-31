import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Brain, Target, Play, Clock, 
    CheckCircle, MessageSquare, 
    Lock, Sparkles, TrendingUp, AlertCircle,
    History, Award, ChevronRight, BarChart
} from 'lucide-react';
import { 
    Radar, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import SEO from '@/components/SEO';


const InterviewTrainingHub = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const userId = sessionStorage.getItem('uid');
    const role = sessionStorage.getItem('role');

    const [assignedDrives, setAssignedDrives] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({ attemptsUsed: 0, dailyLimit: 2, totalCompetency: 0 });
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [drivesRes, statsRes, historyRes] = await Promise.all([
                axios.get(`${serverURL}/api/mock-interview/assigned`, { headers: { 'user-id': userId } }),
                axios.get(`${serverURL}/api/mock-interview/stats`, { headers: { 'user-id': userId } }),
                axios.get(`${serverURL}/api/mock-interview/my-history`, { headers: { 'user-id': userId } })
            ]);

            if (drivesRes.data.success) setAssignedDrives(drivesRes.data.data);
            if (historyRes.data.success) setHistory(historyRes.data.data);
            if (statsRes.data.success) {

                setStats({
                    attemptsUsed: statsRes.data.attemptsToday,
                    dailyLimit: statsRes.data.limit,
                    totalCompetency: statsRes.data.avgCompetency || 0
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStartMock = (driveId?: string) => {
        if (stats.attemptsUsed >= stats.dailyLimit && role !== 'student') {
            toast({
                title: "Daily Limit Reached",
                description: "General users are limited to 2 practice sessions per day. Upgrade for unlimited access.",
                variant: "destructive"
            });
            return;
        }
        navigate(`/dashboard/ai-mock-room${driveId ? '?drive=' + driveId : ''}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <SEO title="AI Interview Training Hub" description="Practice your interview skills with our AI-powered mock interview system." />

            {/* Hero Section */}
            <div className="relative p-8 rounded-3xl bg-slate-900 text-white border border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4 border border-primary/20">
                            <Sparkles className="w-3 h-3" /> AI MOCK INTERVIEW
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                            Master Your Next Big <span className="text-primary italic">Interview</span>
                        </h1>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Practice with our specialized Gemini-powered interviewer. 
                            Get real-time feedback, behavioral analysis, and a technical competency blueprint.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button onClick={() => handleStartMock()} className="h-14 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <Play className="w-5 h-5 mr-3 fill-current" /> Start Practice Session
                            </Button>
                            <div className="flex flex-col justify-center">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Today's Usage</p>
                                <p className="text-xl font-black text-white">{stats.attemptsUsed} / {role === 'student' ? '∞' : stats.dailyLimit}</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-72 space-y-4">
                        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-primary/20 p-2.5 rounded-xl">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Avg. Competency</p>
                                    <p className="text-xl font-bold text-white">{stats.totalCompetency}%</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-emerald-500/20 p-2.5 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Sessions Hosted</p>
                                    <p className="text-xl font-bold text-white">24,502+</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Assigned Drives */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                             <Brain className="w-6 h-6 text-primary" /> Assigned Mock Drives
                        </h2>
                        <Badge variant="outline" className="bg-primary/5">{assignedDrives.length} Modules</Badge>
                    </div>

                    {assignedDrives.length === 0 ? (
                         <div className="bg-muted/30 border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
                            <Lock className="w-10 h-10 text-muted-foreground/30 mb-4" />
                            <h3 className="font-bold text-lg">No Drives Assigned</h3>
                            <p className="text-muted-foreground max-w-sm mt-1">
                                Your organization admin can assign specific mock interview modules based on your placement readiness.
                            </p>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignedDrives.map((drive) => (
                                <Card key={drive._id} className="group overflow-hidden border-border/40 hover:shadow-2xl transition-all duration-300 rounded-3xl bg-card hover:-translate-y-1">
                                    <div className="h-2 w-full bg-gradient-to-r from-primary to-indigo-500 opacity-50" />
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <Badge className="bg-primary/10 text-primary border-0 rounded-lg">{drive.targetRole}</Badge>
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors">{drive.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">{drive.description || "Official organization training module."}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                             {drive.skills?.slice(0,3).map((s: string) => (
                                                <span key={s} className="text-[10px] px-2 py-0.5 bg-muted rounded-full font-bold uppercase">{s}</span>
                                             ))}
                                        </div>
                                        <Button onClick={() => handleStartMock(drive._id)} className="w-full rounded-2xl h-12 font-bold group-hover:bg-primary transition-all">
                                            Continue Preparation
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* History Section */}
                    <div className="mt-12 space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                             <History className="w-6 h-6 text-primary" /> Session History
                        </h2>
                        {history.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground bg-muted/20 border-border/40 rounded-3xl">
                                Your past sessions will appear here after your first mock interview.
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {history.map((app) => (
                                    <div 
                                        key={app._id} 
                                        onClick={() => navigate(`/dashboard/mock-report/${app._id}`)}
                                        className="group p-5 bg-card border border-border/40 rounded-2xl flex items-center justify-between hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center font-black text-primary border border-primary/10">
                                                {app.genAiFeedback?.score || '0'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{app.driveId?.title || "Self Practice Session"}</h4>
                                                <p className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()} • {app.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={app.status === 'Finalized' ? 'bg-emerald-500/10 text-emerald-600 border-0' : ''}>
                                                {app.status === 'Finalized' ? 'TMR Completed' : app.status}
                                            </Badge>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Tips & Stats */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart className="w-6 h-6 text-primary" /> Analytics
                    </h2>
                    
                    <Card className="rounded-[2rem] border-border/40 overflow-hidden shadow-lg bg-slate-900 text-white p-6">
                         <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6">Competency Radar</h3>
                         <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                    { subject: 'Technical', A: 80, fullMark: 100 },
                                    { subject: 'Logic', A: 65, fullMark: 100 },
                                    { subject: 'Communication', A: 90, fullMark: 100 },
                                    { subject: 'Confidence', A: 70, fullMark: 100 },
                                    { subject: 'Behavioral', A: 85, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Competency"
                                        dataKey="A"
                                        stroke="#2563eb"
                                        fill="#2563eb"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                         </div>
                    </Card>

                    <Card className="rounded-3xl border-border/40 overflow-hidden shadow-lg">
                        <CardHeader className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                            <CardTitle className="text-lg">AI Performance Blueprint</CardTitle>
                            <CardDescription className="text-indigo-100">Our AI evaluates you on 5 core pillars</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { label: 'Technical Depth', color: 'bg-blue-500', val: 85 },
                                { label: 'Communication Clearity', color: 'bg-emerald-500', val: 70 },
                                { label: 'Problem Solving', color: 'bg-amber-500', val: 60 },
                                { label: 'Confidence Score', color: 'bg-rose-500', val: 90 },
                                { label: 'Behavioral Alignment', color: 'bg-indigo-500', val: 75 },
                            ].map((pillar) => (
                                <div key={pillar.label} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold uppercase">
                                        <span>{pillar.label}</span>
                                        <span>{pillar.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${pillar.color} rounded-full`} style={{ width: `${pillar.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <AlertCircle className="w-12 h-12 text-primary/10 absolute -z-10 blur-xl" />
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 border-dashed">
                        <h4 className="font-bold flex items-center gap-2 mb-2 text-primary">
                            <MessageSquare className="w-4 h-4" /> Ready for Voice?
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            For the most realistic experience, use a pair of headphones 
                            and enable your microphone. Our AI Interviewer responds in real-time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewTrainingHub;
