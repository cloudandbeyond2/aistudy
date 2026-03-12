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
import { Progress } from '@/components/ui/progress';
import {
    Briefcase, Award, Search, Github, Linkedin, Globe,
    TrendingUp, Users, CheckCircle, BarChart2, ExternalLink,
    FileText, Star, ArrowLeft, Trash2, Eye, FolderOpen
} from 'lucide-react';
import SEO from '@/components/SEO';

const ScoreBadge = ({ score }: { score: number }) => {
    let color = 'bg-red-100 text-red-700 border-red-200';
    let label = 'Not Ready';
    if (score >= 80) { color = 'bg-emerald-100 text-emerald-700 border-emerald-200'; label = 'Placement Ready'; }
    else if (score >= 60) { color = 'bg-blue-100 text-blue-700 border-blue-200'; label = 'Near Ready'; }
    else if (score >= 40) { color = 'bg-amber-100 text-amber-700 border-amber-200'; label = 'In Progress'; }
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${color}`}>
            <Star className="w-3 h-3" /> {score}% · {label}
        </span>
    );
};

const OrgCareerPlacement = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    const [students, setStudents] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, readyCount: 0, avgScore: 0, placedCount: 0 });
    const [projects, setProjects] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [certSearch, setCertSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');

    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const [userDeptName, setUserDeptName] = useState('');

    useEffect(() => {
        checkAccess();
        const init = async () => {
            if (role === 'dept_admin' && !userDeptName) {
                await fetchUserDept();
            }
            fetchAll();
        };
        init();
    }, [orgId, userDeptName]);

    const checkAccess = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/admin/settings`);
            if (res.data && res.data.careerEnabled) {
                if (!res.data.careerEnabled.org_admin) {
                    toast({
                        title: "Access Restricted",
                        description: "Career & Placement feature is currently disabled by the administrator.",
                        variant: "destructive",
                    });
                    navigate('/dashboard/org');
                }
            }
        } catch (error) {
            console.error('Error checking access:', error);
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPlacementStats(),
                fetchProjects(),
                fetchCertificates()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlacementStats = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/placement-stats?organizationId=${orgId}`);
            if (res.data.success) {
                let studentsData = res.data.students;
                let statsData = res.data.stats;

                if (role === 'dept_admin') {
                    studentsData = studentsData.filter((s: any) =>
                        (userDeptName && s.department === userDeptName) ||
                        (deptId && (s.departmentId === deptId || s.department === deptId))
                    );
                    // Recalculate stats for department
                    const readyCount = studentsData.filter((s: any) => s.placementScore >= 60).length;
                    const placedCount = studentsData.filter((s: any) => s.isPlacementClosed).length;
                    const avgScore = studentsData.length > 0
                        ? Math.round(studentsData.reduce((acc: number, s: any) => acc + (s.placementScore || 0), 0) / studentsData.length)
                        : 0;
                    statsData = {
                        totalStudents: studentsData.length,
                        readyCount: readyCount,
                        avgScore: avgScore,
                        placedCount: placedCount
                    };
                }

                setStudents(studentsData);
                setStats(statsData);
            }
        } catch (e) { console.error(e); }
    };

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/career/projects?organizationId=${orgId}`);
            if (res.data.success) {
                let projectsData = res.data.projects;
                if (role === 'dept_admin') {
                    projectsData = projectsData.filter((p: any) =>
                        (userDeptName && p.department === userDeptName) ||
                        (deptId && (p.departmentId === deptId || p.department === deptId))
                    );
                }
                setProjects(projectsData);
            }
        } catch (e) { console.error(e); }
    };

    const fetchCertificates = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/certificates?organizationId=${orgId}`);
            if (res.data.success) {
                let certsData = res.data.certificates;
                if (role === 'dept_admin') {
                    certsData = certsData.filter((c: any) =>
                        (userDeptName && c.department === userDeptName) ||
                        (deptId && (c.departmentId === deptId || c.department === deptId))
                    );
                }
                setCertificates(certsData);
            }
        } catch (e) { console.error(e); }
    };

    const fetchUserDept = async () => {
        if (role !== 'dept_admin' || !deptId) return;
        try {
            const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
            if (res.data.success) {
                const dept = res.data.departments.find((d: any) => d._id === deptId);
                if (dept) setUserDeptName(dept.name);
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/career/project/${id}`);
            if (res.data.success) {
                toast({ title: 'Deleted', description: 'Project removed' });
                fetchProjects();
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
        }
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (p.studentId?.mName || '').toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredCerts = certificates.filter(c =>
        c.studentName?.toLowerCase().includes(certSearch.toLowerCase()) ||
        c.courseName?.toLowerCase().includes(certSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading Career & Placement data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <SEO title="Career & Placement | Organization Dashboard" />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/org')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-primary" /> Career & Placement
                    </h1>
                    <p className="text-muted-foreground text-sm">Track student placement readiness, projects, and certificates.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                            </div>
                            <Users className="w-8 h-8 text-primary opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Placement Ready</p>
                                <p className="text-3xl font-bold text-emerald-600">{stats.readyCount}</p>
                                <p className="text-xs text-muted-foreground">Score ≥ 60%</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-violet-500">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Students Placed</p>
                                <p className="text-3xl font-bold text-violet-600">{stats.placedCount || 0}</p>
                            </div>
                            <Briefcase className="w-8 h-8 text-violet-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg. Readiness</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.avgScore}%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="readiness">
                <TabsList className="mb-4">
                    <TabsTrigger value="readiness"><BarChart2 className="w-4 h-4 mr-1.5" />Placement Readiness</TabsTrigger>
                    <TabsTrigger value="projects"><FolderOpen className="w-4 h-4 mr-1.5" />Project Showcase</TabsTrigger>
                    <TabsTrigger value="certificates"><Award className="w-4 h-4 mr-1.5" />Verified Certificates</TabsTrigger>
                </TabsList>

                {/* --- READINESS TAB --- */}
                <TabsContent value="readiness">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Student Placement Readiness</CardTitle>
                            <CardDescription>Sorted by placement score. Score is auto-calculated from resume, projects, certs, and profile links.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 h-9"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No students found. Students need to set up their career profiles.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40">
                                                <th className="text-left px-4 py-3 font-semibold">Student</th>
                                                <th className="text-left px-4 py-3 font-semibold">Score</th>
                                                <th className="text-left px-4 py-3 font-semibold">Progress</th>
                                                <th className="text-center px-4 py-3 font-semibold">Resume</th>
                                                <th className="text-center px-4 py-3 font-semibold">Projects</th>
                                                <th className="text-center px-4 py-3 font-semibold">Certs</th>
                                                <th className="text-left px-4 py-3 font-semibold">Links</th>
                                                <th className="text-center px-4 py-3 font-semibold">Portfolio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...filteredStudents].sort((a, b) => b.placementScore - a.placementScore).map((s, i) => {
                                                // Support boolean/string payloads coming from older records.
                                                const isAvailable = s.isAvailableForPlacement === true || s.isAvailableForPlacement === 'true';
                                                return (
                                                <tr key={s.studentId || i} className="border-b hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">{s.name}</p>
                                                        <p className="text-xs text-muted-foreground">{s.email}</p>
                                                        {s.rollNo && <p className="text-xs text-muted-foreground">Roll: {s.rollNo}</p>}
                                                        {(s.isPlacementClosed || s.placementCompany) && (
                                                            <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                                                                {s.isPlacementClosed ? 'Placed' : 'Placement Info'}: {s.placementPosition ? s.placementPosition + ' @' : ''} {s.placementCompany}
                                                            </p>
                                                        )}
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs mt-0.5 ${isAvailable ? 'border-emerald-400 text-emerald-600' : 'border-slate-300 text-slate-500'}`}
                                                        >
                                                            {isAvailable ? 'Available' : 'Not Available'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <ScoreBadge score={s.placementScore} />
                                                    </td>
                                                    <td className="px-4 py-3 min-w-[120px]">
                                                        <Progress value={s.placementScore} className="h-2" />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {s.resumeComplete ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1"
                                                                onClick={() => window.open(`/resume/${s.studentId}`, '_blank')}
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span className="text-xs font-medium">View</span>
                                                            </Button>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-semibold">{s.projectsCount}</td>
                                                    <td className="px-4 py-3 text-center font-semibold">{s.certificatesCount}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            {s.githubUrl && (
                                                                <a href={s.githubUrl} target="_blank" rel="noreferrer">
                                                                    <Github className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                                                                </a>
                                                            )}
                                                            {s.linkedinUrl && (
                                                                <a href={s.linkedinUrl} target="_blank" rel="noreferrer">
                                                                    <Linkedin className="w-4 h-4 text-blue-600 hover:text-blue-700 transition-colors" />
                                                                </a>
                                                            )}
                                                            {s.portfolioUrl && (
                                                                <a href={s.portfolioUrl} target="_blank" rel="noreferrer">
                                                                    <Globe className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2"
                                                            onClick={() => window.open(`/portfolio/${s.studentId}`, '_blank')}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PROJECTS TAB --- */}
                <TabsContent value="projects">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Student Project Showcase</CardTitle>
                            <CardDescription>Projects submitted by students for career showcase.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 h-9"
                                    placeholder="Search by project name or student..."
                                    value={projectSearch}
                                    onChange={e => setProjectSearch(e.target.value)}
                                />
                            </div>
                            {filteredProjects.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No projects submitted yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredProjects.map((p: any) => (
                                        <div key={p._id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-card">
                                            {p.image ? (
                                                <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />
                                            ) : (
                                                <div className="w-full h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                                    <FolderOpen className="w-10 h-10 text-primary/30" />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-semibold text-sm leading-snug">{p.title}</h4>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteProject(p._id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    by <span className="font-medium text-foreground">{p.studentId?.mName || 'Student'}</span>
                                                </p>
                                                {p.techStack?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {p.techStack.slice(0, 4).map((t: string) => (
                                                            <span key={t} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    {p.githubUrl && (
                                                        <a href={p.githubUrl} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                            <Github className="w-3.5 h-3.5" /> Code
                                                        </a>
                                                    )}
                                                    {p.liveUrl && (
                                                        <a href={p.liveUrl} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                            <ExternalLink className="w-3.5 h-3.5" /> Live
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
                </TabsContent>

                {/* --- CERTIFICATES TAB --- */}
                <TabsContent value="certificates">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Verified Certificates</CardTitle>
                            <CardDescription>All platform-issued verified certificates for students in this organization.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 h-9"
                                    placeholder="Search by student or course..."
                                    value={certSearch}
                                    onChange={e => setCertSearch(e.target.value)}
                                />
                            </div>
                            {filteredCerts.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No verified certificates yet. Students earn certificates by completing courses.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40">
                                                <th className="text-left px-4 py-3 font-semibold">Student</th>
                                                <th className="text-left px-4 py-3 font-semibold">Course</th>
                                                <th className="text-left px-4 py-3 font-semibold">Certificate ID</th>
                                                <th className="text-left px-4 py-3 font-semibold">Issued Date</th>
                                                <th className="text-center px-4 py-3 font-semibold">Verify</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCerts.map((c: any) => (
                                                <tr key={c._id} className="border-b hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3 font-medium">{c.studentName}</td>
                                                    <td className="px-4 py-3">{c.courseName}</td>
                                                    <td className="px-4 py-3">
                                                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.certificateId}</code>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                                        {c.date ? new Date(c.date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2"
                                                            onClick={() => window.open(`/verify-certificate?id=${c.certificateId}`, '_blank')}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OrgCareerPlacement;
