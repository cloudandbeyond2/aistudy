import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Briefcase, Award, Github, Linkedin, Globe, FileText,
    Plus, Trash2, ExternalLink, CheckCircle, Star,
    TrendingUp, RefreshCw, Share2, FolderOpen, ArrowUpRight,
    ChevronRight, Shield
} from 'lucide-react';
import SEO from '@/components/SEO';

interface ScoreGaugeProps { score: number }

const ScoreGauge = ({ score }: ScoreGaugeProps) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Placement Ready!' : score >= 60 ? 'Near Ready' : score >= 40 ? 'In Progress' : 'Just Starting';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/30" />
                    <circle
                        cx="60" cy="60" r="54"
                        stroke={color} strokeWidth="10" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
            </div>
            <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        </div>
    );
};

const StudentCareer = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const studentId = sessionStorage.getItem('uid');
    const orgId = sessionStorage.getItem('orgId');

    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [hasResume, setHasResume] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addProjectOpen, setAddProjectOpen] = useState(false);

    const [profileForm, setProfileForm] = useState({
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        jobPreferences: '',
        skills: '',
        isAvailableForPlacement: false
    });

    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        githubUrl: '',
        liveUrl: '',
        techStack: '',
        image: ''
    });

    useEffect(() => {
        if (studentId && orgId) fetchCareerData();
        else if (studentId) fetchCareerData();
    }, [studentId, orgId]);

    const fetchCareerData = async () => {
        setLoading(true);
        try {
            const params = orgId ? `?organizationId=${orgId}` : '';
            const [profileRes, projectsRes] = await Promise.all([
                axios.get(`${serverURL}/api/career/profile/${studentId}${params}`).catch(() => null),
                axios.get(`${serverURL}/api/career/projects?studentId=${studentId}${orgId ? `&organizationId=${orgId}` : ''}`).catch(() => null),
            ]);

            if (profileRes?.data?.success) {
                const p = profileRes.data.profile;
                setProfile(p);
                setCertifications(profileRes.data.certifications || []);
                setHasResume(profileRes.data.hasResume || false);
                setProfileForm({
                    githubUrl: p?.githubUrl || '',
                    linkedinUrl: p?.linkedinUrl || '',
                    portfolioUrl: p?.portfolioUrl || '',
                    jobPreferences: p?.jobPreferences || '',
                    skills: (p?.skills || []).join(', '),
                    isAvailableForPlacement: p?.isAvailableForPlacement || false
                });
            }
            if (projectsRes?.data?.success) {
                setProjects(projectsRes.data.projects || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!studentId) return;
        setSaving(true);
        try {
            const res = await axios.post(`${serverURL}/api/career/profile`, {
                studentId,
                organizationId: orgId,
                ...profileForm,
                skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean)
            });
            if (res.data.success) {
                toast({ title: 'Profile Saved', description: 'Your career profile has been updated.' });
                fetchCareerData();
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e?.response?.data?.message || 'Failed to save profile', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddProject = async () => {
        if (!newProject.title || !newProject.description) {
            toast({ title: 'Required', description: 'Title and description are required', variant: 'destructive' });
            return;
        }
        try {
            const res = await axios.post(`${serverURL}/api/career/project`, {
                studentId,
                organizationId: orgId,
                ...newProject,
                techStack: newProject.techStack.split(',').map(t => t.trim()).filter(Boolean)
            });
            if (res.data.success) {
                toast({ title: 'Project Added!', description: 'Your project has been added to your showcase.' });
                setNewProject({ title: '', description: '', githubUrl: '', liveUrl: '', techStack: '', image: '' });
                setAddProjectOpen(false);
                fetchCareerData();
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e?.response?.data?.message || 'Failed to add project', variant: 'destructive' });
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Remove this project?')) return;
        try {
            await axios.delete(`${serverURL}/api/career/project/${id}`);
            toast({ title: 'Removed', description: 'Project removed from showcase' });
            fetchCareerData();
        } catch {
            toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading career profile...</p>
                </div>
            </div>
        );
    }

    const score = profile?.placementScore || 0;
    const scoreItems = [
        { label: 'Resume Built', done: hasResume, pts: 30 },
        { label: 'Projects Added', done: (profile?.projectsCount || 0) >= 1, pts: 30, note: `${profile?.projectsCount || 0}/3 projects` },
        { label: 'Certificates Earned', done: (profile?.certificatesCount || 0) >= 1, pts: 20, note: `${profile?.certificatesCount || 0}/2 certs` },
        { label: 'GitHub Linked', done: !!profileForm.githubUrl, pts: 10 },
        { label: 'LinkedIn Linked', done: !!profileForm.linkedinUrl, pts: 10 }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <SEO title="Career Hub | Student Portal" />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-primary" /> Career Hub
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Build your career profile, showcase projects, and track your placement readiness.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Gauge */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Placement Readiness
                            </h3>
                            <div className="flex justify-center mb-4">
                                <ScoreGauge score={score} />
                            </div>
                            <div className="space-y-2 mt-4">
                                {scoreItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500' : 'bg-muted border'}`}>
                                                {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                                            {item.note && <span className="text-muted-foreground">({item.note})</span>}
                                        </div>
                                        <span className={`font-semibold ${item.done ? 'text-emerald-600' : 'text-muted-foreground'}`}>+{item.pts}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <CardContent className="pt-3 pb-4">
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={fetchCareerData}>
                                    <RefreshCw className="w-3 h-3 mr-1.5" /> Refresh Score
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => window.open(`/portfolio/${studentId}`, '_blank')}>
                                    <Share2 className="w-3 h-3 mr-1.5" /> My Portfolio
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Resume Builder */}
                    <Card className="bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border-violet-200 dark:border-violet-800 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate('/dashboard/resume-builder')}>
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">AI Resume Builder</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {hasResume ? 'Update your resume (+30 pts)' : 'Create your resume to earn 30 pts'}
                                    </p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Availability toggle */}
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Available for Placement</p>
                                    <p className="text-xs text-muted-foreground">Signal to employers you're open</p>
                                </div>
                                <button
                                    onClick={() => setProfileForm(f => ({ ...f, isAvailableForPlacement: !f.isAvailableForPlacement }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${profileForm.isAvailableForPlacement ? 'bg-emerald-500' : 'bg-muted'}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${profileForm.isAvailableForPlacement ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Profile Links & Preferences */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Career Profile</CardTitle>
                            <CardDescription>Add your professional links and job preferences to increase your placement score.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub URL (+10 pts)</Label>
                                    <Input
                                        placeholder="https://github.com/username"
                                        value={profileForm.githubUrl}
                                        onChange={e => setProfileForm(f => ({ ...f, githubUrl: e.target.value }))}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn URL (+10 pts)</Label>
                                    <Input
                                        placeholder="https://linkedin.com/in/username"
                                        value={profileForm.linkedinUrl}
                                        onChange={e => setProfileForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Portfolio Website</Label>
                                    <Input
                                        placeholder="https://yourportfolio.com"
                                        value={profileForm.portfolioUrl}
                                        onChange={e => setProfileForm(f => ({ ...f, portfolioUrl: e.target.value }))}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Job Preferences</Label>
                                    <Input
                                        placeholder="e.g. Full Stack Developer, Remote"
                                        value={profileForm.jobPreferences}
                                        onChange={e => setProfileForm(f => ({ ...f, jobPreferences: e.target.value }))}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Skills (comma-separated)</Label>
                                <Input
                                    placeholder="React, Node.js, Python, Machine Learning..."
                                    value={profileForm.skills}
                                    onChange={e => setProfileForm(f => ({ ...f, skills: e.target.value }))}
                                    className="h-9"
                                />
                            </div>
                            {profileForm.skills && (
                                <div className="flex flex-wrap gap-1.5">
                                    {profileForm.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{skill}</span>
                                    ))}
                                </div>
                            )}
                            <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                                {saving ? 'Saving...' : 'Save Career Profile'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Projects Showcase */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Project Showcase</CardTitle>
                                    <CardDescription>Each project earns 10 pts (up to 30 pts max).</CardDescription>
                                </div>
                                <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-1.5" /> Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Add Showcase Project</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-2">
                                            <div className="space-y-1.5">
                                                <Label>Project Title *</Label>
                                                <Input
                                                    placeholder="e.g. AI-Powered Chat App"
                                                    value={newProject.title}
                                                    onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Description *</Label>
                                                <Textarea
                                                    placeholder="What does this project do? What problem does it solve?"
                                                    value={newProject.description}
                                                    onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label>GitHub URL</Label>
                                                    <Input
                                                        placeholder="https://github.com/..."
                                                        value={newProject.githubUrl}
                                                        onChange={e => setNewProject(p => ({ ...p, githubUrl: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Live URL</Label>
                                                    <Input
                                                        placeholder="https://..."
                                                        value={newProject.liveUrl}
                                                        onChange={e => setNewProject(p => ({ ...p, liveUrl: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Tech Stack (comma-separated)</Label>
                                                <Input
                                                    placeholder="React, Node.js, MongoDB"
                                                    value={newProject.techStack}
                                                    onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Image URL (optional)</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={newProject.image}
                                                    onChange={e => setNewProject(p => ({ ...p, image: e.target.value }))}
                                                />
                                            </div>
                                            <Button className="w-full" onClick={handleAddProject}>Add to Showcase</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {projects.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">No projects yet. Add your first project to earn points.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {projects.map((p: any) => (
                                        <div key={p._id} className="border rounded-xl overflow-hidden hover:shadow-sm transition-shadow bg-card">
                                            {p.image ? (
                                                <img src={p.image} alt={p.title} className="w-full h-28 object-cover" />
                                            ) : (
                                                <div className="w-full h-28 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                                    <FolderOpen className="w-8 h-8 text-primary/30" />
                                                </div>
                                            )}
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-semibold text-sm leading-tight">{p.title}</h4>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteProject(p._id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{p.description}</p>
                                                {p.techStack?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {p.techStack.slice(0, 3).map((t: string) => (
                                                            <span key={t} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-3">
                                                    {p.githubUrl && (
                                                        <a href={p.githubUrl} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                                            <Github className="w-3 h-3" /> Code
                                                        </a>
                                                    )}
                                                    {p.liveUrl && (
                                                        <a href={p.liveUrl} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                            <ExternalLink className="w-3 h-3" /> Live
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Verified Certificates */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" /> Verified Certificates
                            </CardTitle>
                            <CardDescription>Each certificate earns 10 pts (up to 20 pts max).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {certifications.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                                    <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">Complete courses to earn verified certificates.</p>
                                    <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/dashboard')}>
                                        Browse Courses
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {certifications.map((c: any) => (
                                        <div key={c._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{c.courseName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ID: <code className="bg-muted px-1 rounded">{c.certificateId}</code>
                                                    {c.date && ` · ${new Date(c.date).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="shrink-0 h-8"
                                                onClick={() => window.open(`/verify-certificate?id=${c.certificateId}`, '_blank')}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentCareer;
