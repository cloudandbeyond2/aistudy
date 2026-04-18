import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Award, Brain, CheckCircle, AlertTriangle, 
    ArrowRight, Download, Share2, Target, 
    Zap, Sparkles, BookOpen, Quote,
    Building2, MessageSquare, AlertCircle, 
    TrendingUp, History, ChevronRight, UserCheck
} from 'lucide-react';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const MockReport = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [applicationId]);

    const fetchReport = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/mock-interview/application/${applicationId}`);
            if (res.data.success) {
                const app = res.data.data;
                const feedback = app?.genAiFeedback || {};
                const hasAnalytics =
                    Number(feedback?.score || 0) > 0 ||
                    !!feedback?.overallAnalysis ||
                    (Array.isArray(feedback?.strengths) && feedback.strengths.length > 0) ||
                    (Array.isArray(feedback?.weaknesses) && feedback.weaknesses.length > 0) ||
                    (Array.isArray(feedback?.technicalGaps) && feedback.technicalGaps.length > 0);

                const hasTranscript = Array.isArray(feedback?.transcript) && feedback.transcript.length > 0;

                // Auto-recover analytics if transcript exists but analysis wasn't generated/stored.
                if (!hasAnalytics && hasTranscript) {
                    try {
                        const res = await axios.post(`${serverURL}/api/mock-interview/finalize`, { applicationId });
                        console.log('--- AI TOKEN USAGE (Mock Report Finalization) ---');
                        console.table(res.data.usage);
                        const retry = await axios.get(`${serverURL}/api/mock-interview/application/${applicationId}`);
                        if (retry.data.success) {
                            setReport(retry.data.data);
                            return;
                        }
                    } catch (e) {
                        console.error('Auto-finalize failed:', e);
                    }
                }

                setReport(app);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm font-medium">Generating your Performance Blueprint...</p>
                </div>
            </div>
        );
    }

    if (!report) return <div className="text-center py-20">Report not found.</div>;

    const { genAiFeedback, driveId } = report;
    const score = genAiFeedback?.score || 0;

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-6xl mx-auto py-6">
            <SEO title="AI Performance Blueprint | Mock Interview" description="Detailed analysis of your AI mock interview performance." />

            {/* Header / Hero Section */}
            <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-40 h-40 flex-shrink-0">
                        <CircularProgressbar
                            value={score}
                            text={`${score}%`}
                            styles={buildStyles({
                                pathColor: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
                                textColor: '#fff',
                                trailColor: 'rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                            })}
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-black">
                            Official AI Analysis
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 uppercase">
                            Performance <span className="text-primary">Blueprint</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl">
                            {driveId?.title || "General Technical Practice"} session evaluation for <span className="text-white font-bold">{driveId?.targetRole || "Technical Candidate"}</span>.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-2xl h-12">
                            <Download className="w-4 h-4 mr-2" /> Download Certificate
                        </Button>
                        <Button className="rounded-2xl h-12 shadow-lg shadow-primary/20" onClick={() => navigate('/dashboard/interview-training')}>
                            <ArrowRight className="w-4 h-4 mr-2" /> Back to Training Hub
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score & Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2rem] border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Quote className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold">Overall AI Analysis</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 pb-10">
                            <p className="text-lg leading-relaxed text-slate-700 italic">
                                "{genAiFeedback?.overallAnalysis || "No analysis available for this session."}"
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="rounded-[2rem] h-full border-emerald-500/20 shadow-emerald-500/5 shadow-xl bg-emerald-50/10">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Key Strengths</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {genAiFeedback?.strengths?.map((s: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white border border-emerald-100 rounded-2xl">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2" />
                                            <span className="text-sm font-medium">{s}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="rounded-[2rem] h-full border-amber-500/20 shadow-amber-500/5 shadow-xl bg-amber-50/10">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <AlertTriangle className="w-5 h-5" />
                                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Areas of Improvement</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {genAiFeedback?.weaknesses?.map((s: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white border border-amber-100 rounded-2xl">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                                            <span className="text-sm font-medium">{s}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Technical Gaps */}
                    <Card className="rounded-[2rem] border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white pb-6">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-amber-400" />
                                <CardTitle className="text-xl font-bold">Technical Concept Gaps</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {genAiFeedback?.technicalGaps?.map((tag: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border border-border/40">
                                    <BookOpen className="w-5 h-5 text-primary opacity-50" />
                                    <span className="font-bold text-sm tracking-tight">{tag}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <Card className="rounded-[2rem] border-border/40 shadow-xl overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" /> Training Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                             <div className="relative p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-3xl">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Industry Ready</span>
                                    <span className="text-xs font-black text-primary">{score}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full" 
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase tracking-tight">
                                    Based on your responses for {driveId?.targetRole || "this role"}.
                                </p>
                             </div>

                             <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400 px-2">Next Milestone</h4>
                                <Button className="w-full h-14 rounded-2xl justify-between px-6 group-hover:shadow-primary/15 transition-all outline-none border-0 text-white font-bold bg-slate-900 hover:bg-slate-800">
                                    <span className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-amber-400" /> TMR Round Mock
                                    </span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                             </div>
                        </CardContent>
                    </Card>

                    {/* TMR Feedback Section */}
                    {report.tmrFeedback && (
                        <Card className="rounded-[2rem] border-primary/20 shadow-xl overflow-hidden bg-white">
                            <CardHeader className="bg-primary text-white pb-6">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="w-6 h-6 text-white" />
                                    <CardTitle className="text-xl font-bold uppercase tracking-tight">TMR Interviewer Feedback</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/40 rounded-2xl text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Communication</p>
                                        <p className="text-2xl font-black text-primary">{report.tmrFeedback.communication}/10</p>
                                    </div>
                                    <div className="p-4 bg-muted/40 rounded-2xl text-center">
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Technical</p>
                                        <p className="text-2xl font-black text-primary">{report.tmrFeedback.technical}/10</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Interviewer Notes</p>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm leading-relaxed text-slate-700 italic">
                                        "{report.tmrFeedback.notes || "No detailed notes provided."}"
                                    </div>
                                </div>
                                <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase font-medium tracking-widest">
                                                <span>Evaluated by</span>
                                                <span>
                                                    {report.tmrFeedback?.evaluatedBy ? (
                                                        report.tmrFeedback.evaluatedBy
                                                    ) : (
                                                        'Staff'
                                                    )}
                                                </span>
                                            </div>
                                            <div className="pt-1 text-[10px] text-muted-foreground">
                                                {report.tmrFeedback?.evaluatedAt && !Number.isNaN(new Date(report.tmrFeedback.evaluatedAt).getTime()) ? (
                                                    <span>{new Date(report.tmrFeedback.evaluatedAt).toLocaleDateString()}</span>
                                                ) : (
                                                    <span>Not evaluated</span>
                                                )}
                                            </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="p-8 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 border-dashed text-center">
                        <Target className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Improve Your Score</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                            Focus on the technical gaps identified above. Study these concepts and retake the mock session in 24 hours.
                        </p>
                        <Button variant="outline" className="rounded-xl border-amber-500/30 text-amber-700 hover:bg-amber-500/10" onClick={() => navigate('/dashboard/interview-training')}>
                            Return to Training
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockReport;
