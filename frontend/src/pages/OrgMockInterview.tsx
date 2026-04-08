import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { 
    Brain, Target, Users, CheckCircle, Plus, 
    Settings, Search, ArrowLeft, MoreVertical, 
    UserCheck, BookOpen, Star, MessageSquare,
    Zap, Sparkles, LayoutDashboard, ExternalLink,
    FileText, Award
} from 'lucide-react';

import SEO from '@/components/SEO';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const OrgMockInterview = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');
    const role = sessionStorage.getItem('role') || '';
    const deptId = sessionStorage.getItem('deptId') || '';
    const deptName = sessionStorage.getItem('deptName') || '';

    const [students, setStudents] = useState<any[]>([]);
    const [drives, setDrives] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, readyCount: 0, completedMocks: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // TMR Modal States
    const [isTmrOpen, setIsTmrOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [tmrFeedback, setTmrFeedback] = useState({ communication: 5, technical: 5, notes: '' });

    // Create Mode States

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newDrive, setNewDrive] = useState({
        title: '',
        targetRole: '',
        skills: '',
        difficulty: 'Medium',
        personaMood: 'Professional',
        experienceLevel: 'Entry'
    });
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isCompactScreen = isMobile || isTablet;

    const getDepartmentValue = (value: any) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.name || '';
        return '';
    };

    const matchesCurrentDepartment = (student: any) => {
        if (role !== 'dept_admin') return true;

        const studentDept = getDepartmentValue(
            student?.department?._id ||
            student?.department?.name ||
            student?.department ||
            student?.studentDetails?.departmentId ||
            student?.studentDetails?.department
        );

        return Boolean(
            (deptId && studentDept === deptId) ||
            (deptName && studentDept === deptName)
        );
    };

    useEffect(() => {
        fetchAll();
    }, [orgId]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchStudents(),
                fetchDrives(),
                fetchApplications()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/mock-interview/org-applications`, {
                headers: { 'user-id': orgId }
            });
            if (res.data.success) {
                const nextApplications = Array.isArray(res.data.data)
                    ? res.data.data.filter((app: any) => matchesCurrentDepartment(app.userId || app.user || app.student))
                    : [];
                setApplications(nextApplications);
                const completed = nextApplications.filter((a: any) => a.status === 'Finalized').length;
                setStats(prev => ({ ...prev, completedMocks: completed }));
            }
        } catch (e) { console.error(e); }
    };


    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/placement-stats?organizationId=${orgId}`);
            if (res.data.success) {
                const nextStudents = Array.isArray(res.data.students)
                    ? res.data.students.filter(matchesCurrentDepartment)
                    : [];
                setStudents(nextStudents);
                const ready = nextStudents.filter((s: any) => s.studentDetails?.isPlacementReady).length;
                setStats(prev => ({ ...prev, totalStudents: nextStudents.length, readyCount: ready }));
            }
        } catch (e) { console.error(e); }
    };

    const fetchDrives = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/mock-interview/drives`, {
                headers: { 'user-id': orgId }
            });
            if (res.data.success) {
                setDrives(res.data.data);
            }
        } catch (e) { console.error(e); }
    };

    const handleToggleReadiness = async (studentId: string, currentStatus: boolean) => {
        try {
            // Need a backend endpoint for this - will implement in user.controller later if missing
            // Mock Interview Helper endpoint
            const res = await axios.put(`${serverURL}/api/mock-interview/placement-ready`, {
                userId: studentId,
                isReady: !currentStatus
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Student readiness status updated." });
                fetchStudents();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const handleCreateDrive = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/mock-interview/drive`, {
                ...newDrive,
                skills: newDrive.skills.split(',').map(s => s.trim())
            }, {
                headers: { 'user-id': orgId }
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Mock Drive created successfully." });
                setIsCreateOpen(false);
                fetchDrives();
            }
        } catch (e: any) {
            const msg = e.response?.data?.message || "Failed to create drive";
            toast({ title: "Error", description: msg, variant: "destructive" });
        }
    };

    const handleSubmitTmr = async () => {
        if (!selectedApp?._id) return toast({ title: "Error", description: "No application selected", variant: 'destructive' });
        try {
            const evaluatorId = sessionStorage.getItem('uid') || orgId;
            const res = await axios.post(`${serverURL}/api/mock-interview/tmr-feedback`, {
                applicationId: selectedApp._id,
                ...tmrFeedback
            }, {
                headers: { 'user-id': evaluatorId }
            });
            if (res.data.success) {
                toast({ title: "Success", description: "TMR feedback submitted." });
                setIsTmrOpen(false);
                setTmrFeedback({ communication: 5, technical: 5, notes: '' });
                setSelectedApp(null);
                fetchApplications();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to submit feedback", variant: 'destructive' });
            }
        } catch (e: any) {
            const msg = e.response?.data?.message || 'Failed to submit feedback';
            toast({ title: "Error", description: msg, variant: "destructive" });
        }
    };


    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading Training Modules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10 pt-0 md:pt-0 lg:pt-[60px]">
            <SEO title="Mock Interview Management | Admin" description="Manage student readiness and AI mock interview assignments." />

            {/* Premium Header */}
            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600/10 via-purple-500/5 to-transparent border border-white/10 shadow-sm overflow-hidden mb-8 p-5 sm:p-6 lg:p-8">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between relative z-10">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                            <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">Mock Interview Training Hub</h1>
                            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
                                Prepare your students for the real world. Manage AI screening modules and track mock readiness.
                            </p>
                        </div>
                    </div>
                    
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                                <Plus className="w-5 h-5 mr-2" /> Create Training Drive
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-[425px] sm:w-full">
                            <DialogHeader>
                                <DialogTitle>New Training Drive</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Drive Title</Label>
                                    <Input placeholder="e.g. Java Placement Mock" 
                                           value={newDrive.title}
                                           onChange={e => setNewDrive({...newDrive, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Role</Label>
                                    <Input placeholder="e.g. Frontend Developer" 
                                           value={newDrive.targetRole}
                                           onChange={e => setNewDrive({...newDrive, targetRole: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Skills (Comma separated)</Label>
                                    <Input placeholder="React, Node.js, SQL" 
                                           value={newDrive.skills}
                                           onChange={e => setNewDrive({...newDrive, skills: e.target.value})} />
                                </div>
                                    <div className="space-y-2">
                                        <Label>Experience Level</Label>
                                        <select className="w-full h-10 px-3 rounded-md border" 
                                                value={newDrive.experienceLevel}
                                                onChange={e => setNewDrive({...newDrive, experienceLevel: e.target.value})}>
                                            <option>Entry</option>
                                            <option>Mid</option>
                                            <option>Senior</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Difficulty</Label>
                                        <select className="w-full h-10 px-3 rounded-md border" 
                                                value={newDrive.difficulty}
                                                onChange={e => setNewDrive({...newDrive, difficulty: e.target.value})}>
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>AI Persona</Label>
                                        <select className="w-full h-10 px-3 rounded-md border" 
                                                value={newDrive.personaMood}
                                                onChange={e => setNewDrive({...newDrive, personaMood: e.target.value})}>
                                            <option>Friendly</option>
                                            <option>Professional</option>
                                            <option>Strict</option>
                                        </select>
                                    </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateDrive} className="w-full">Create Module</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {[
                    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Placement Ready', value: stats.readyCount, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Active Modules', value: drives.length, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' }
                ].map((stat, idx) => (
                    <Card key={idx} className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                                </div>
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Tabs System */}
            <Tabs defaultValue="readiness" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6 rounded-2xl w-full h-auto flex overflow-x-auto overflow-y-hidden gap-1">
                    <TabsTrigger value="readiness" className="rounded-xl px-4 sm:px-6 py-3 min-w-[150px] sm:min-w-0 sm:flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="w-4 h-4 mr-2" /> Student Readiness
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="rounded-xl px-4 sm:px-6 py-3 min-w-[150px] sm:min-w-0 sm:flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Zap className="w-4 h-4 mr-2" /> Training Modules
                    </TabsTrigger>
                    <TabsTrigger value="pipeline" className="rounded-xl px-4 sm:px-6 py-3 min-w-[150px] sm:min-w-0 sm:flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Star className="w-4 h-4 mr-2" /> Mock Pipeline
                    </TabsTrigger>
                </TabsList>

                {/* 1. Readiness Toggle Tab */}
                <TabsContent value="readiness">
                    <Card className="border-border/40 shadow-xl shadow-black/5">
                        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                                <CardTitle className="text-xl font-bold">Placement Readiness List</CardTitle>
                                <CardDescription>Toggle students who are ready to begin their Mock Interview training rounds.</CardDescription>
                            </div>
                            <div className="relative w-full md:w-72 h-10">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input className="pl-9 h-10 bg-muted/20" placeholder="Filter by student name..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="hidden md:block overflow-x-auto rounded-xl border border-border/40">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/30 text-left border-b border-border/40">
                                            <th className="px-6 py-4 font-semibold">Student Name</th>
                                            <th className="px-6 py-4 font-semibold">Department</th>
                                            <th className="px-6 py-4 font-semibold">Mock Status</th>
                                            <th className="px-6 py-4 font-semibold text-center">Placement Ready</th>
                                            <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredStudents.map((student) => {
                                            const isReady = student.studentDetails?.isPlacementReady;
                                            return (
                                                <tr key={student.studentId} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary">
                                                                {student.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{student.name}</p>
                                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">{student.department || "No Dept"}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={isReady ? "default" : "secondary"} className="rounded-lg">
                                                            {isReady ? "Eager to Practice" : "Not Started"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <div 
                                                                onClick={() => handleToggleReadiness(student.studentId, isReady)}
                                                                className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${isReady ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                            >
                                                                <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${isReady ? 'translate-x-7 shadow-md' : 'translate-x-0'}`} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid gap-3 md:hidden">
                                {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                                    const isReady = student.studentDetails?.isPlacementReady;
                                    return (
                                        <Card key={student.studentId} className="border-border/40 shadow-sm">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary shrink-0">
                                                            {student.name?.[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold truncate">{student.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={isReady ? "default" : "secondary"} className="rounded-lg shrink-0">
                                                        {isReady ? "Ready" : "Not Started"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Department</span>
                                                    <span className="font-medium text-right truncate max-w-[60%]">{student.department || "No Dept"}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm text-muted-foreground">Placement Ready</span>
                                                    <div 
                                                        onClick={() => handleToggleReadiness(student.studentId, isReady)}
                                                        className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${isReady ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                    >
                                                        <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${isReady ? 'translate-x-7 shadow-md' : 'translate-x-0'}`} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                }) : (
                                    <div className="py-10 text-center text-muted-foreground">
                                        No students match your search.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. Training Modules (Drives) */}
                <TabsContent value="modules">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                        {drives.length === 0 ? (
                            <div className="col-span-full py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center">
                                <Sparkles className="w-12 h-12 text-primary/30 mb-4" />
                                <h3 className="text-lg font-bold">No Training Drives Created Yet</h3>
                                <p className="text-muted-foreground max-w-xs mt-1">Create your first interview drive to start assigning students for AI-powered practice.</p>
                                <Button className="mt-6 rounded-xl" onClick={() => setIsCreateOpen(true)}>Create First Drive</Button>
                            </div>
                        ) : (
                            drives.map((drive) => (
                                <Card key={drive._id} className="group overflow-hidden border-border/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                    <div className={`h-2 w-full bg-gradient-to-r ${drive.settings.difficulty === 'Hard' ? 'from-red-500' : drive.settings.difficulty === 'Medium' ? 'from-amber-500' : 'from-emerald-500'} to-transparent`} />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg group-hover:text-primary transition-colors">{drive.title}</CardTitle>
                                            <Badge className="rounded-lg">{drive.settings.difficulty}</Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2">{drive.description || "Custom training module for " + drive.targetRole}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {drive.skills?.map((s: string) => (
                                                <span key={s} className="text-[10px] px-2 py-0.5 bg-muted/40 rounded-full font-semibold uppercase">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/40 pt-4">
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <MessageSquare className="w-3 h-3 mr-1" /> {drive.personaMood} Persona
                                            </div>
                                            <Button variant="link" size="sm" className="h-auto p-0 font-bold">Customize</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* 3. Pipeline Simulation (Status Tracker) */}
                <TabsContent value="pipeline">
                    <Card className="border-border/40 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/40 py-5 sm:py-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-primary" /> Active Mock Pipeline
                            </CardTitle>
                            <CardDescription>Track students through AI Screening and TMR Mock rounds.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/10 text-left border-b border-border/40">
                                            <th className="px-6 py-4 font-semibold">Candidate</th>
                                            <th className="px-6 py-4 font-semibold">Module</th>
                                            <th className="px-6 py-4 font-semibold">AI Score</th>
                                            <th className="px-6 py-4 font-semibold">Stage</th>
                                            <th className="px-6 py-4 font-semibold text-center">TMR Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {applications.map((app) => (
                                            <tr key={app._id} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                            {app.userId?.mName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{app.userId?.mName || "User"}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{app.userId?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{app.driveId?.title || "General Practice"}</td>
                                                <td className="px-6 py-4">
                                                    {app.genAiFeedback?.score ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center text-[10px] font-black">
                                                                {app.genAiFeedback.score}
                                                            </div>
                                                            {app.genAiFeedback.score >= 70 && <Badge className="bg-emerald-500/10 text-emerald-600 border-0 h-5">Shortlisted</Badge>}
                                                        </div>
                                                    ) : <span className="text-muted-foreground">Pending</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={`rounded-lg ${app.currentRound === 'Completed' ? 'border-emerald-500 text-emerald-600' : 'border-primary text-primary'}`}>
                                                        {app.currentRound === 'TMR_Mock' ? 'TMR Round Waiting' : app.currentRound}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {app.currentRound === 'TMR_Mock' ? (
                                                        <Button 
                                                            size="sm" 
                                                            className="rounded-xl bg-slate-900 border-0 text-white font-bold h-9 px-4"
                                                            onClick={() => { setSelectedApp(app); setIsTmrOpen(true); }}
                                                        >
                                                            Take TMR Mock
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={() => window.open(`/dashboard/mock-report/${app._id}`, '_blank')}>
                                                            <FileText className="w-4 h-4 mr-2" /> View Report
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid gap-3 p-4 md:hidden">
                                {applications.length > 0 ? applications.map((app) => (
                                    <Card key={app._id} className="border-border/40 shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {app.userId?.mName?.[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold truncate">{app.userId?.mName || "User"}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{app.userId?.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`rounded-lg shrink-0 ${app.currentRound === 'Completed' ? 'border-emerald-500 text-emerald-600' : 'border-primary text-primary'}`}>
                                                    {app.currentRound === 'TMR_Mock' ? 'TMR Waiting' : app.currentRound}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm gap-3">
                                                <span className="text-muted-foreground">Module</span>
                                                <span className="font-medium text-right truncate max-w-[60%]">{app.driveId?.title || "General Practice"}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm gap-3">
                                                <span className="text-muted-foreground">AI Score</span>
                                                <span className="font-medium">
                                                    {app.genAiFeedback?.score ? `${app.genAiFeedback.score}` : 'Pending'}
                                                </span>
                                            </div>
                                            <div className="pt-1">
                                                {app.currentRound === 'TMR_Mock' ? (
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full rounded-xl bg-slate-900 border-0 text-white font-bold h-10 px-4"
                                                        onClick={() => { setSelectedApp(app); setIsTmrOpen(true); }}
                                                    >
                                                        Take TMR Mock
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="w-full" onClick={() => window.open(`/dashboard/mock-report/${app._id}`, '_blank')}>
                                                        <FileText className="w-4 h-4 mr-2" /> View Report
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No applications yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* TMR Feedback Modal */}
                    <Dialog open={isTmrOpen} onOpenChange={setIsTmrOpen}>
                        <DialogContent className="w-[95vw] max-w-[500px] p-0 overflow-hidden rounded-[2rem] border-0 shadow-2xl">
                            <div className="bg-slate-900 px-5 sm:px-8 py-8 sm:py-10 text-white relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2" />
                                <Badge className="bg-white/10 text-white border-white/20 mb-3 px-3 py-1 rounded-full uppercase tracking-tighter text-[10px] font-black">
                                    Technical Interviewer Panel
                                </Badge>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">TMR Performance Review</DialogTitle>
                                    <p className="text-slate-400 text-sm mt-1">Reviewing candidate: <span className="text-white font-bold">{selectedApp?.userId?.mName}</span></p>
                                </DialogHeader>
                            </div>
                            
                            <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Communication (1-10)</Label>
                                        <Input type="number" min="1" max="10" value={tmrFeedback.communication} onChange={e => setTmrFeedback({...tmrFeedback, communication: parseInt(e.target.value)})} className="h-12 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Technical Depth (1-10)</Label>
                                        <Input type="number" min="1" max="10" value={tmrFeedback.technical} onChange={e => setTmrFeedback({...tmrFeedback, technical: parseInt(e.target.value)})} className="h-12 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Final Interviewer Notes</Label>
                                    <textarea 
                                        className="w-full min-h-[120px] p-4 rounded-2xl border border-border/40 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm leading-relaxed"
                                        placeholder="Add constructive feedback for the candidate's development..."
                                        value={tmrFeedback.notes}
                                        onChange={e => setTmrFeedback({...tmrFeedback, notes: e.target.value})}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsTmrOpen(false)}>Discard</Button>
                                    <Button className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest" onClick={handleSubmitTmr}>Finalize Review</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default OrgMockInterview;
