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
    FileText, Star, ArrowLeft, Trash2, Eye, FolderOpen, BookOpen, ChevronRight
} from 'lucide-react';
import SEO from '@/components/SEO';
import Swal from "sweetalert2";

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
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This project will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const res = await axios.delete(`${serverURL}/api/career/project/${id}`);

        Swal.close();

        if (res.data.success) {
            Swal.fire("Deleted!", "Project removed successfully.", "success");
            fetchProjects();
        }
    } catch (e) {
        Swal.close();
        Swal.fire("Error", "Failed to delete project", "error");
    }
};

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    const positionBreakdown = React.useMemo(() => {
        const counts: { [key: string]: number } = {};
        students.forEach(s => {
            if (s.isPlacementClosed && s.placementPosition) {
                const pos = s.placementPosition.trim();
                counts[pos] = (counts[pos] || 0) + 1;
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [students]);

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
  <div className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]">
    <SEO title="Career & Placement | Organization Dashboard" description="Track student placement readiness, projects, and certificates." />

    {/* Header - Stacks on mobile */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="p-2 bg-primary/10 rounded-lg w-fit">
        <Briefcase className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Career & Placement</h1>
        <p className="text-muted-foreground text-sm">Track student placement readiness, projects, and certificates.</p>
      </div>
    </div>
    
    {/* Instruction Section */}
    <div className="mb-2">
      <details className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-teal-200 dark:border-teal-800 rounded-2xl shadow-md overflow-hidden">
        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none list-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-teal-700 dark:text-teal-300 text-sm">📋 How to Manage Career & Placements</p>
              <p className="text-xs text-muted-foreground">Click to read management instructions</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-teal-500 group-open:rotate-90 transition-transform" />
        </summary>
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {[
              { step: '1', icon: BarChart2, title: 'Monitor Readiness', desc: 'Track students reaching the 80%+ threshold. Scores are auto-calculated from profiles.' },
              { step: '2', icon: Eye, title: 'Review Portfolios', desc: 'Click "Portfolio" to see live projects, code quality, and LinkedIn profiles.' },
              { step: '3', icon: FolderOpen, title: 'Manage Projects', desc: 'Browse all student-submitted projects across departments and manage them.' },
              { step: '4', icon: CheckCircle, title: 'Verify Credentials', desc: 'Check issued certificates and verify authenticity using unique IDs.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3 p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900">
                <div className="w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</div>
                <div>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              '✅ Real-time data sync',
              '✅ Portfolio links open in new tabs',
              '✅ Department admins see filtered data',
              '✅ CSV exports available for reporting',
            ].map(tip => (
              <span key={tip} className="text-xs bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-3 py-1 rounded-full">{tip}</span>
            ))}
          </div>
        </div>
      </details>
    </div>


    {/* Summary Cards - 1 col (mobile), 2 cols (tablet), 4 cols (laptop) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Placement Ready</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.readyCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Score ≥ 60%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-violet-500 shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Students Placed</p>
              <p className="text-2xl sm:text-3xl font-bold text-violet-600">{stats.placedCount || 0}</p>
            </div>
            <Briefcase className="w-8 h-8 text-violet-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Readiness</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.avgScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Position Breakdown - Flexible wrapping */}
    {positionBreakdown.length > 0 && (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Placement Position Breakdown
          </CardTitle>
          <CardDescription>Numbers of students placed in different roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {positionBreakdown.map(([pos, count]) => (
              <div key={pos} className="flex items-center gap-2 bg-muted/40 border rounded-full px-3 py-1 sm:px-4 sm:py-1.5 hover:bg-muted/60 transition-colors">
                <span className="font-semibold text-xs sm:text-sm">{pos}</span>
                <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Tabs - Scrollable on mobile to prevent squishing */}
    <Tabs defaultValue="readiness" className="w-full">
      <div className="overflow-x-auto no-scrollbar pb-2">
        <TabsList className="inline-flex w-full sm:w-auto justify-start sm:justify-center">
          <TabsTrigger value="readiness" className="flex-1 sm:flex-none whitespace-nowrap"><BarChart2 className="w-4 h-4 mr-1.5" />Readiness</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 sm:flex-none whitespace-nowrap"><FolderOpen className="w-4 h-4 mr-1.5" />Projects</TabsTrigger>
          <TabsTrigger value="certificates" className="flex-1 sm:flex-none whitespace-nowrap"><Award className="w-4 h-4 mr-1.5" />Certificates</TabsTrigger>
        </TabsList>
      </div>

      {/* --- READINESS TAB --- */}
      <TabsContent value="readiness">
        <Card className="shadow-none border-0 sm:border sm:shadow-sm">
          <CardHeader className="px-0 sm:px-6">
            <CardTitle className="text-lg">Student Placement Readiness</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Score is auto-calculated from resume, projects, and profile links.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="relative mb-4 px-1 sm:px-0">
              <Search className="absolute left-4 sm:left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10 sm:pl-9 h-10 sm:h-9"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Table Container with Horizontal Scroll for Tablet/Mobile */}
            <div className="overflow-x-auto rounded-xl border bg-background">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-4 font-semibold">Student</th>
                    <th className="text-left px-4 py-4 font-semibold">Score</th>
                    <th className="text-left px-4 py-4 font-semibold">Progress</th>
                    <th className="text-center px-4 py-4 font-semibold">Resume</th>
                    <th className="text-center px-4 py-4 font-semibold">Activity</th>
                    <th className="text-left px-4 py-4 font-semibold">Socials</th>
                    <th className="text-center px-4 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...filteredStudents].sort((a, b) => b.placementScore - a.placementScore).map((s, i) => {
                    const isAvailable = s.isAvailableForPlacement === true || s.isAvailableForPlacement === 'true';
                    return (
                      <tr key={s.studentId || i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4">
                          <div className="min-w-[180px]">
                            <p className="font-bold text-sm">{s.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{s.email}</p>
                            {(s.isPlacementClosed || s.placementCompany) && (
                              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">
                                Placed @ {s.placementCompany}
                              </p>
                            )}
                          </div>
                        </td>
                        {/* <td className="px-4 py-4"><ScoreBadge score={s.placementScore} /></td> */}
                        <td className="px-4 py-4">
  <div className="min-w-[60px] whitespace-nowrap">
    <ScoreBadge score={s.placementScore} />
  </div>
</td>
                        <td className="px-4 py-4 min-w-[100px]"><Progress value={s.placementScore} className="h-1.5" /></td>
                        <td className="px-4 py-4 text-center">
                          {s.resumeComplete ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary" onClick={() => window.open(`/resume/${s.studentId}`, '_blank')}>
                              <FileText className="w-4 h-4" />
                            </Button>
                          ) : <span className="text-muted-foreground opacity-30">—</span>}
                        </td>
                        <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-3 text-xs font-medium">
                                <span title="Projects" className="flex items-center gap-1"><FolderOpen className="w-3 h-3"/> {s.projectsCount}</span>
                                <span title="Certificates" className="flex items-center gap-1"><Award className="w-3 h-3"/> {s.certificatesCount}</span>
                            </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2.5">
                            {s.githubUrl && <a href={s.githubUrl} target="_blank" rel="noreferrer"><Github className="w-4 h-4 text-muted-foreground hover:text-foreground" /></a>}
                            {s.linkedinUrl && <a href={s.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin className="w-4 h-4 text-blue-600 hover:text-blue-700" /></a>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => window.open(`/portfolio/${s.studentId}`, '_blank')}>
                            <Eye className="w-3.5 h-3.5" /> Portfolio
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* --- PROJECTS TAB --- */}
      <TabsContent value="projects">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-11"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={e => setProjectSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((p: any) => (
              <Card key={p._id} className="overflow-hidden group hover:border-primary/50 transition-all">
                <div className="relative h-40 w-full bg-muted">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FolderOpen className="w-10 h-10 opacity-20" /></div>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteProject(p._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-sm mb-1 truncate">{p.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-medium bg-muted px-2 py-1 rounded">by {p.studentId?.mName || 'Student'}</span>
                    <div className="flex gap-2">
                       {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Github className="w-4 h-4" /></a>}
                       {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-primary"><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* --- CERTIFICATES TAB --- */}
      <TabsContent value="certificates">
         <div className="overflow-x-auto rounded-xl border bg-background mt-4">
            <table className="w-full text-sm min-w-[700px]">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-4 font-semibold">Student</th>
                        <th className="text-left px-4 py-4 font-semibold">Course Name</th>
                        <th className="text-left px-4 py-4 font-semibold">Certificate ID</th>
                        <th className="text-center px-4 py-4 font-semibold">Verify</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {filteredCerts.map((c: any) => (
                        <tr key={c._id} className="hover:bg-muted/20">
                            <td className="px-4 py-4 font-medium">{c.studentName}</td>
                            <td className="px-4 py-4">{c.courseName}</td>
                            <td className="px-4 py-4"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.certificateId}</code></td>
                            <td className="px-4 py-4 text-center">
                                <Button variant="ghost" size="sm" onClick={() => window.open(`/verify-certificate?id=${c.certificateId}`, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </TabsContent>
    </Tabs>
  </div>
);
};

export default OrgCareerPlacement;
