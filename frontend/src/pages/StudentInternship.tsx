import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Activity, 
    BookOpen, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    ExternalLink, 
    FileText, 
    MessageSquare, 
    Plus,
    LayoutDashboard,
    ChevronRight,
    Trophy,
    Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import SEO from '@/components/SEO';

const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const StudentInternship = () => {
    const [internship, setInternship] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dailyLog, setDailyLog] = useState('');
    const { toast } = useToast();
    const studentId = sessionStorage.getItem('uid');
    const orgId = sessionStorage.getItem('orgId');

    useEffect(() => {
        fetchInternship();
    }, []);

    const fetchInternship = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/internship/student/${studentId}?organizationId=${orgId}`);
            if (res.data.success && res.data.internship) {
                setInternship(res.data.internship);
            }
        } catch (e) {
            console.error("Failed to fetch internship", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTask = async (taskId: string, submissionUrl: string) => {
        try {
            const res = await axios.patch(`${serverURL}/api/internship/${internship._id}/task/${taskId}`, {
                submissionUrl,
                status: 'submitted'
            });
            if (res.data.success) {
                toast({ title: "Task Submitted", description: "Your supervisor will review it shortly." });
                fetchInternship();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
        }
    };

    const handleAddFollowup = async () => {
        if (!dailyLog.trim()) return;
        try {
            const res = await axios.post(`${serverURL}/api/internship/${internship._id}/followup`, {
                log: dailyLog
            });
            if (res.data.success) {
                toast({ title: "Log Saved", description: "Your daily progress has been recorded." });
                setDailyLog('');
                fetchInternship();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to save log", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!internship) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <div className="max-w-md mx-auto p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/20 shadow-xl">
                    <Activity className="w-16 h-16 mx-auto text-indigo-400 opacity-50 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Active Internship</h2>
                    <p className="text-muted-foreground mb-6">You haven't been assigned to any internship programs yet. Please contact your organization administrator.</p>
                    <Button onClick={() => window.location.href = '/dashboard/student'}>Back to Portal</Button>
                </div>
            </div>
        );
    }

    const completedTasks = internship.tasks?.filter((t: any) => t.status === 'completed').length || 0;
    const totalTasks = internship.tasks?.length || 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in pb-20">
            <SEO title={`${internship.title} | Internship`} description="Manage your internship tasks and track your progress." />

            {/* HEADER SECTION */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity size={180} />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm px-4 py-1">
                            {internship.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-500/30 text-white border-indigo-400 font-bold px-4 py-1 flex items-center gap-1">
                            <Target className="w-3 h-3" /> {internship.domain?.toUpperCase() || 'GENERAL'} TRACK
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-500/30 text-white border-emerald-400 font-bold px-4 py-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {internship.internshipType?.toUpperCase() || 'PRACTICAL'}
                        </Badge>
                        <span className="text-indigo-100 flex items-center gap-1 text-sm bg-black/10 px-3 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            Started: {new Date(internship.startDate).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-wide">{internship.title}</h1>
                    <p className="text-indigo-100 max-w-2xl text-lg leading-relaxed font-medium">
                        {internship.description || "Professional career-oriented training program focused on practical industry standards."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="tasks" className="w-full">
                        <TabsList className="bg-muted/50 p-1 rounded-2xl w-full grid grid-cols-3 mb-6">
                            <TabsTrigger value="tasks" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Target className="w-4 h-4 mr-2" /> Tasks
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileText className="w-4 h-4 mr-2" /> Daily Logs
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <BookOpen className="w-4 h-4 mr-2" /> Resources
                            </TabsTrigger>
                        </TabsList>

                        {/* TASKS CONTENT */}
                        <TabsContent value="tasks" className="space-y-8 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-100 before:hidden md:before:block">
                            {internship.tasks?.length > 0 ? internship.tasks.map((task: any, idx: number) => (
                                <div key={task._id} className="relative md:pl-16 group transition-all duration-300">
                                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white bg-indigo-500 shadow-md hidden md:block group-hover:scale-125 transition-transform z-10" />
                                    <Card className="hover:shadow-2xl transition-all duration-500 border-none bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden hover:-translate-y-1">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                        <CardContent className="p-8">
                                            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded tracking-widest">
                                                            Task 0{idx + 1}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">• {task.suggestedDuration || '1 Week'}</span>
                                                    </div>
                                                    <h3 className="font-black text-xl text-slate-800">{task.title}</h3>
                                                    <p className="font-medium text-slate-600 leading-relaxed text-sm md:text-base">
                                                        {task.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 mt-6 items-center pt-2">
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Deadline: {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                        <Badge className={`px-4 py-1.5 rounded-full font-bold text-[10px] tracking-wider shadow-sm border-0 ${
                                                            task.status === 'completed' ? 'bg-emerald-500 text-white' :
                                                            task.status === 'submitted' ? 'bg-amber-500 text-white' : 
                                                            'bg-indigo-500 text-white'
                                                        }`}>
                                                            {task.status.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                                                    {task.status === 'pending' && (
                                                        <Button className="rounded-xl px-8 h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 group/btn" onClick={async () => {
                                                            const { value: url } = await Swal.fire({
                                                                title: 'Submit Task Deliverable',
                                                                input: 'url',
                                                                inputLabel: 'Document/Github/Drive URL',
                                                                inputPlaceholder: 'https://...',
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Submit Final Version',
                                                                confirmButtonColor: '#4f46e5'
                                                            });
                                                            if (url) handleSubmitTask(task._id, url);
                                                        }}>
                                                            Submit Work <ChevronRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                        </Button>
                                                    )}
                                                    {task.submissionUrl && (
                                                        <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline px-4 py-2 bg-indigo-50 rounded-xl justify-center">
                                                            <ExternalLink className="w-3.5 h-3.5" /> View Submission
                                                        </a>
                                                    )}
                                                    {task.feedback && (
                                                        <Button variant="outline" size="sm" className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" onClick={() => {
                                                            Swal.fire({
                                                                title: 'Management Feedback',
                                                                text: task.feedback,
                                                                icon: 'info',
                                                                confirmButtonColor: '#f59e0b'
                                                            });
                                                        }}>
                                                            <MessageSquare className="w-4 h-4 mr-2" /> View Feedback
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )) : (
                                <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-muted">
                                    <Target className="w-20 h-20 mx-auto text-muted-foreground opacity-10 mb-4" />
                                    <h3 className="text-xl font-bold text-slate-400">Roadmap Pending</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">Your professional training roadmap is being curated by your mentor.</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* LOGS CONTENT */}
                        <TabsContent value="logs" className="space-y-6">
                            <Card className="border-none bg-white/60 backdrop-blur-md shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Daily Progress Log</CardTitle>
                                    <CardDescription>Share what you worked on today.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea 
                                        placeholder="Briefly describe your activities, challenges faced, and what you learned..."
                                        className="rounded-xl min-h-[120px] bg-white"
                                        value={dailyLog}
                                        onChange={(e) => setDailyLog(e.target.value)}
                                    />
                                    <Button className="w-full rounded-full bg-indigo-600 py-6" onClick={handleAddFollowup}>
                                        Save Daily Log
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Previous Logs</h3>
                                {internship.dailyFollowups?.length > 0 ? (
                                    [...internship.dailyFollowups].reverse().map((log: any) => (
                                        <Card key={log._id} className="border-none bg-white/40 backdrop-blur-sm">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(log.date).toLocaleDateString()}
                                                    </span>
                                                    {log.reviewedBy && (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-tighter text-[9px]">
                                                            Reviewed
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-700 italic border-l-2 border-indigo-200 pl-3 py-1">
                                                    {log.log}
                                                </p>
                                                {log.mentorNote && (
                                                    <div className="mt-3 bg-indigo-50/50 p-3 rounded-lg text-xs">
                                                        <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3" /> Mentor's Note:
                                                        </p>
                                                        <p className="text-slate-600">{log.mentorNote}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8 italic text-sm">No logs submitted yet.</p>
                                )}
                            </div>
                        </TabsContent>

                        {/* RESOURCES CONTENT */}
                        <TabsContent value="resources" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {internship.studyPlan?.resources?.length > 0 ? internship.studyPlan.resources.map((res: any, idx: number) => (
                                    <a 
                                        key={idx} 
                                        href={res.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-4 rounded-2xl bg-white/60 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100 flex items-center gap-4 group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-sm truncate">{res.title}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                Go to resource <ExternalLink className="h-3 w-3" />
                                            </p>
                                        </div>
                                    </a>
                                )) : (
                                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-3xl">
                                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                                        <p className="text-muted-foreground mt-2">No learning resources shared yet.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* RIGHT COLUMN: SIDEBAR STATS */}
                <div className="space-y-8">
                    {/* PROGRESS CARD */}
                    <Card className="rounded-[2rem] border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> 
                                Internship Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative pt-4">
                                <div className="flex justify-between text-sm mb-2 font-bold tracking-tight">
                                    <span>Milestones</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000" 
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-700">
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</p>
                                    <p className="text-2xl font-black">{completedTasks}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Tasks</p>
                                    <p className="text-2xl font-black">{totalTasks}</p>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight text-emerald-400">Next Milestone</p>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {internship.tasks?.find((t: any) => t.status === 'pending')?.title || 'All tasks completed! Review your logs with mentor.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* MENTOR CARD */}
                    <Card className="rounded-[2rem] border-none shadow-lg bg-indigo-50/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                Internship Scope
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3">
                                {internship.exerciseTopics?.length > 0 ? internship.exerciseTopics.map((topic: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                        <ChevronRight className="w-4 h-4 text-indigo-600" />
                                        {topic}
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic">General skill development focused internship.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentInternship;
