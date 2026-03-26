import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Award,
    CheckCircle,
    ChevronRight,
    ExternalLink,
    FileText,
    FolderOpen,
    Github,
    Globe,
    Layers3,
    Linkedin,
    Plus,
    RefreshCw,
    Rocket,
    Share2,
    Shield,
    Sparkles,
    Star,
    Target,
    Trash2,
    TrendingUp
} from 'lucide-react';
import SEO from '@/components/SEO';

interface ScoreGaugeProps {
    score: number;
}

const ScoreGauge = ({ score }: ScoreGaugeProps) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Placement Ready!' : score >= 60 ? 'Near Ready' : score >= 40 ? 'In Progress' : 'Just Starting';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted/30" />
                    <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke={color}
                        strokeWidth="10"
                        fill="none"
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

const CareerMetricCard = ({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'default'
}: {
    label: string;
    value: string;
    hint: string;
    icon: React.ElementType;
    tone?: 'default' | 'success' | 'primary' | 'warning';
}) => {
    const toneStyles = {
        default: 'border-border/60 bg-background',
        success: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20',
        primary: 'border-blue-200/80 bg-blue-50/95 dark:border-primary/20 dark:bg-primary/5',
        warning: 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20'
    };

    return (
        <div className={`rounded-2xl border p-4 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${toneStyles[tone]}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/90 shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
};

const heroPrimaryButtonClass = 'rounded-full border border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:shadow-slate-950/25 dark:hover:bg-slate-100';
const heroSecondaryButtonClass = 'rounded-full border border-slate-300 bg-white/92 text-slate-950 shadow-lg shadow-slate-300/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:shadow-slate-950/20 dark:hover:bg-white/16';
const interactivePanelClass = 'rounded-[28px] border border-slate-200/80 bg-white/82 p-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-white/10';
const sectionCardBaseClass = 'border-border/60 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm';

const CAREER_TRACKS = [
    {
        id: 'frontend',
        title: 'Frontend Builder',
        summary: 'For students targeting UI engineering, web apps, and product-facing delivery.',
        cue: 'Best for React, JavaScript, UI systems, and portfolio-heavy roles.',
        keywords: ['frontend', 'front end', 'react', 'ui', 'web'],
        suggestedSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Responsive Design']
    },
    {
        id: 'backend',
        title: 'Backend Engineer',
        summary: 'For students who want APIs, databases, authentication, and system logic roles.',
        cue: 'Best for Node.js, Java, Python, API, and database-focused career paths.',
        keywords: ['backend', 'back end', 'api', 'node', 'server', 'database'],
        suggestedSkills: ['Node.js', 'APIs', 'SQL', 'Database Design', 'Authentication', 'Git']
    },
    {
        id: 'data',
        title: 'Data Analyst',
        summary: 'For students targeting reporting, analytics, dashboards, and data decision support.',
        cue: 'Best for Excel, SQL, Python, BI, and insight-driven roles.',
        keywords: ['data', 'analyst', 'analytics', 'bi', 'sql', 'dashboard'],
        suggestedSkills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics', 'Power BI']
    },
    {
        id: 'qa',
        title: 'QA and Testing',
        summary: 'For students targeting software quality, test planning, and product reliability work.',
        cue: 'Best for manual testing, automation basics, and release validation roles.',
        keywords: ['qa', 'testing', 'tester', 'quality'],
        suggestedSkills: ['Manual Testing', 'Test Cases', 'Bug Reporting', 'API Testing', 'Automation Basics', 'SQL']
    }
] as const;

const CAREER_TRACK_THEMES = {
    frontend: {
        badgeClass: 'border-sky-300/80 bg-sky-100 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/15 dark:text-sky-100',
        shellClass: 'border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-background to-cyan-50/60 dark:border-sky-900/60 dark:from-sky-950/20 dark:via-background dark:to-cyan-950/10',
        activeTrackClass: 'border-sky-300/70 bg-sky-50/90 shadow-sm ring-1 ring-sky-200/80 dark:border-sky-900/60 dark:bg-sky-950/20 dark:ring-sky-900/50',
        iconClass: 'text-sky-600 dark:text-sky-300'
    },
    backend: {
        badgeClass: 'border-violet-300/80 bg-violet-100 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/15 dark:text-violet-100',
        shellClass: 'border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-background to-indigo-50/70 dark:border-violet-900/60 dark:from-violet-950/20 dark:via-background dark:to-indigo-950/10',
        activeTrackClass: 'border-violet-300/70 bg-violet-50/90 shadow-sm ring-1 ring-violet-200/80 dark:border-violet-900/60 dark:bg-violet-950/20 dark:ring-violet-900/50',
        iconClass: 'text-violet-600 dark:text-violet-300'
    },
    data: {
        badgeClass: 'border-emerald-300/80 bg-emerald-100 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-100',
        shellClass: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-background to-teal-50/70 dark:border-emerald-900/60 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10',
        activeTrackClass: 'border-emerald-300/70 bg-emerald-50/90 shadow-sm ring-1 ring-emerald-200/80 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:ring-emerald-900/50',
        iconClass: 'text-emerald-600 dark:text-emerald-300'
    },
    qa: {
        badgeClass: 'border-amber-300/80 bg-amber-100 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-100',
        shellClass: 'border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-background to-orange-50/70 dark:border-amber-900/60 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10',
        activeTrackClass: 'border-amber-300/70 bg-amber-50/90 shadow-sm ring-1 ring-amber-200/80 dark:border-amber-900/60 dark:bg-amber-950/20 dark:ring-amber-900/50',
        iconClass: 'text-amber-600 dark:text-amber-300'
    }
} as const;

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
    const [resumeEnabled, setResumeEnabled] = useState(false);
    const [careerStreak, setCareerStreak] = useState(1);
    const [visitCount, setVisitCount] = useState(1);

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
        if (studentId) {
            void fetchCareerData();
        }
    }, [studentId, orgId]);

    useEffect(() => {
        if (!studentId) return;

        const storageKey = `career_hub_streak_${studentId}`;
        const today = new Date().toISOString().slice(0, 10);

        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                const initial = { lastVisit: today, streak: 1, visits: 1 };
                localStorage.setItem(storageKey, JSON.stringify(initial));
                setCareerStreak(1);
                setVisitCount(1);
                return;
            }

            const parsed = JSON.parse(raw);
            const lastVisit = String(parsed?.lastVisit || '');
            const previous = lastVisit ? new Date(lastVisit) : null;
            const current = new Date(today);
            let nextStreak = Number(parsed?.streak || 1);
            let nextVisits = Number(parsed?.visits || 1);

            if (lastVisit !== today) {
                nextVisits += 1;
                if (previous) {
                    const diffDays = Math.round((current.getTime() - previous.getTime()) / 86400000);
                    nextStreak = diffDays === 1 ? nextStreak + 1 : 1;
                } else {
                    nextStreak = 1;
                }
            }

            localStorage.setItem(storageKey, JSON.stringify({
                lastVisit: today,
                streak: nextStreak,
                visits: nextVisits
            }));

            setCareerStreak(nextStreak);
            setVisitCount(nextVisits);
        } catch (error) {
            console.error('Failed to initialize career streak', error);
        }
    }, [studentId]);

    const toBoolean = (value: any) => value === true || value === 'true' || value === 1;

    const fetchCareerData = async () => {
        if (!studentId) return;

        setLoading(true);
        try {
            const params = orgId ? `?organizationId=${orgId}` : '';
            const [profileRes, projectsRes, settingsRes] = await Promise.all([
                axios.get(`${serverURL}/api/career/profile/${studentId}${params}`).catch(() => null),
                axios.get(`${serverURL}/api/career/projects?studentId=${studentId}${orgId ? `&organizationId=${orgId}` : ''}`).catch(() => null),
                axios.get(`${serverURL}/api/settings`).catch(() => null)
            ]);

            if (settingsRes?.data?.careerEnabled?.student === false) {
                toast({
                    title: 'Access Restricted',
                    description: 'Career Hub feature is currently disabled by the administrator.',
                    variant: 'destructive',
                });
                navigate('/dashboard/student');
                return;
            }

            if (settingsRes?.data?.resumeEnabled) {
                setResumeEnabled(Boolean(settingsRes.data.resumeEnabled.student));
            }

            if (profileRes?.data?.success) {
                const nextProfile = profileRes.data.profile;
                setProfile(nextProfile);
                setCertifications(profileRes.data.certifications || []);
                setHasResume(profileRes.data.hasResume || false);
                setProfileForm({
                    githubUrl: nextProfile?.githubUrl || '',
                    linkedinUrl: nextProfile?.linkedinUrl || '',
                    portfolioUrl: nextProfile?.portfolioUrl || '',
                    jobPreferences: nextProfile?.jobPreferences || '',
                    skills: (nextProfile?.skills || []).join(', '),
                    isAvailableForPlacement: toBoolean(nextProfile?.isAvailableForPlacement)
                });
            }

            if (projectsRes?.data?.success) {
                setProjects(projectsRes.data.projects || []);
            }
        } catch (error) {
            console.error(error);
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
                skills: profileForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
            });

            if (res.data.success) {
                toast({ title: 'Profile Saved', description: 'Your career profile has been updated.' });
                void fetchCareerData();
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to save profile',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddProject = async () => {
        if (!studentId) return;

        if (!newProject.title || !newProject.description) {
            toast({ title: 'Required', description: 'Title and description are required', variant: 'destructive' });
            return;
        }

        try {
            const res = await axios.post(`${serverURL}/api/career/project`, {
                studentId,
                organizationId: orgId,
                ...newProject,
                techStack: newProject.techStack.split(',').map((tech) => tech.trim()).filter(Boolean)
            });

            if (res.data.success) {
                toast({ title: 'Project Added', description: 'Your project has been added to your showcase.' });
                setNewProject({
                    title: '',
                    description: '',
                    githubUrl: '',
                    liveUrl: '',
                    techStack: '',
                    image: ''
                });
                setAddProjectOpen(false);
                void fetchCareerData();
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to add project',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Remove this project?')) return;

        try {
            await axios.delete(`${serverURL}/api/career/project/${id}`);
            toast({ title: 'Removed', description: 'Project removed from showcase.' });
            void fetchCareerData();
        } catch {
            toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
        }
    };

    const handleAvailabilityToggle = async () => {
        if (!studentId) return;

        const nextAvailability = !profileForm.isAvailableForPlacement;
        const updatedForm = { ...profileForm, isAvailableForPlacement: nextAvailability };

        setProfileForm(updatedForm);
        setProfile((prev: any) => prev ? { ...prev, isAvailableForPlacement: nextAvailability } : prev);

        try {
            await axios.post(`${serverURL}/api/career/profile`, {
                studentId,
                organizationId: orgId,
                ...updatedForm,
                skills: updatedForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
            });
        } catch (error: any) {
            setProfileForm(profileForm);
            setProfile((prev: any) => prev ? { ...prev, isAvailableForPlacement: profileForm.isAvailableForPlacement } : prev);
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to update availability',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading career profile...</p>
                </div>
            </div>
        );
    }

    const score = profile?.placementScore || 0;
    const studentName = sessionStorage.getItem('mName') || 'Student';
    const skillsList = profileForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
    const linkedSignals = [
        !!profileForm.githubUrl,
        !!profileForm.linkedinUrl,
        !!profileForm.portfolioUrl,
        !!profileForm.jobPreferences,
        skillsList.length > 0
    ].filter(Boolean).length;
    const profileStrength = Math.round((linkedSignals / 5) * 100);
    const scoreGap = Math.max(80 - score, 0);
    const spotlightProject = projects[0] || null;
    const projectsWithLiveLinks = projects.filter((project) => project.liveUrl).length;
    const normalizedPreferences = String(profileForm.jobPreferences || '').toLowerCase();
    const normalizedSkills = skillsList.map((skill) => skill.toLowerCase());
    const selectedCareerTrack = CAREER_TRACKS.find((track) =>
        track.keywords.some((keyword) => normalizedPreferences.includes(keyword)) ||
        track.suggestedSkills.some((skill) => normalizedSkills.includes(skill.toLowerCase()))
    ) || CAREER_TRACKS[0];
    const selectedCareerTheme = CAREER_TRACK_THEMES[selectedCareerTrack.id];
    const missingSuggestedSkills = selectedCareerTrack.suggestedSkills.filter(
        (skill) => !normalizedSkills.includes(skill.toLowerCase())
    );
    const strongSkills = skillsList.filter((skill) =>
        selectedCareerTrack.suggestedSkills.some((expected) => expected.toLowerCase() === skill.toLowerCase())
    );
    const weeklyMissions = [
        {
            id: 'resume',
            label: hasResume ? 'Resume added' : 'Create or refresh your resume',
            done: hasResume
        },
        {
            id: 'project',
            label: projects.length >= 1 ? 'Project proof added' : 'Add one showcase project',
            done: projects.length >= 1
        },
        {
            id: 'identity',
            label: profileForm.githubUrl && profileForm.linkedinUrl ? 'Professional links connected' : 'Connect GitHub and LinkedIn',
            done: !!profileForm.githubUrl && !!profileForm.linkedinUrl
        },
        {
            id: 'direction',
            label: profileForm.jobPreferences ? 'Target role defined' : 'Set your target role or job preference',
            done: !!profileForm.jobPreferences
        },
        {
            id: 'credential',
            label: certifications.length >= 1 ? 'Credential earned' : 'Earn one verified certificate',
            done: certifications.length >= 1
        }
    ];
    const completedMissionCount = weeklyMissions.filter((mission) => mission.done).length;

    const stageMeta =
        score >= 80
            ? {
                label: 'Placement Ready',
                subtitle: 'Your profile is in strong shape for internships and entry-level roles.',
                tone: 'text-emerald-600 dark:text-emerald-400'
            }
            : score >= 60
                ? {
                    label: 'Near Ready',
                    subtitle: 'You have a strong base. Tighten presentation and add one more standout proof point.',
                    tone: 'text-blue-600 dark:text-blue-400'
                }
                : score >= 40
                    ? {
                        label: 'Career Build Mode',
                        subtitle: 'Your direction is forming. Add stronger proof of work to move into placement-ready range.',
                        tone: 'text-amber-600 dark:text-amber-400'
                    }
                    : {
                        label: 'Foundation Stage',
                        subtitle: 'Set your career identity first, then build projects and credentials around it.',
                        tone: 'text-rose-600 dark:text-rose-400'
                    };

    const scoreItems = [
        { label: 'Resume Built', done: hasResume, pts: 30 },
        { label: 'Projects Added', done: projects.length >= 1, pts: 30, note: `${projects.length}/3 projects` },
        { label: 'Certificates Earned', done: certifications.length >= 1, pts: 20, note: `${certifications.length}/2 certificates` },
        { label: 'GitHub Linked', done: !!profileForm.githubUrl, pts: 10 },
        { label: 'LinkedIn Linked', done: !!profileForm.linkedinUrl, pts: 10 }
    ];

    const quickWins = [
        {
            label: 'Resume Signal',
            value: hasResume ? 'Complete' : 'Missing',
            hint: hasResume ? 'Resume proof is already present in your profile.' : 'Build this first for the biggest readiness gain.',
            icon: FileText,
            tone: (hasResume ? 'success' : 'warning') as const
        },
        {
            label: 'Project Depth',
            value: `${projects.length}/3`,
            hint: projects.length >= 2 ? 'You already have solid proof-of-work depth.' : 'Aim for at least 2 projects with strong explanations.',
            icon: FolderOpen,
            tone: (projects.length >= 2 ? 'success' : 'primary') as const
        },
        {
            label: 'Brand Presence',
            value: `${linkedSignals}/5`,
            hint: linkedSignals >= 4 ? 'Your external identity looks strong.' : 'Links, preferences, and skills still need work.',
            icon: Globe,
            tone: (linkedSignals >= 4 ? 'success' : 'default') as const
        }
    ];

    const actionQueue = [
        {
            title: hasResume ? 'Refresh your resume story' : 'Build your AI resume',
            description: hasResume
                ? 'Update achievements, projects, and role alignment to keep your resume current.'
                : 'Create a resume to unlock the highest-value readiness improvement on this page.',
            done: hasResume,
            cta: resumeEnabled ? 'Open Resume Builder' : 'Resume Builder Disabled',
            action: () => resumeEnabled && navigate('/dashboard/resume-builder')
        },
        {
            title: projects.length >= 2 ? 'Polish your showcase projects' : 'Add a proof-of-work project',
            description: projects.length >= 2
                ? 'Improve descriptions, live links, and visuals so reviewers understand your work quickly.'
                : 'One strong project immediately makes your student profile more credible.',
            done: projects.length >= 2,
            cta: 'Add Project',
            action: () => setAddProjectOpen(true)
        },
        {
            title: certifications.length > 0 ? 'Connect certificates to your career goal' : 'Earn a verified certificate',
            description: certifications.length > 0
                ? 'Use your certificates to support the role or domain you want next.'
                : 'Complete a course and add verified proof of learning.',
            done: certifications.length > 0,
            cta: 'Browse Courses',
            action: () => navigate('/dashboard')
        },
        {
            title: profileForm.linkedinUrl ? 'Sharpen your career direction' : 'Link your professional identity',
            description: profileForm.linkedinUrl
                ? 'Clarify target role, work style, and skill direction so your profile feels intentional.'
                : 'Add LinkedIn and GitHub so your profile looks more real and discoverable.',
            done: !!profileForm.linkedinUrl && !!profileForm.githubUrl && !!profileForm.jobPreferences,
            cta: 'Update Profile',
            action: () => window.scrollTo({ top: 760, behavior: 'smooth' })
        }
    ];

    const applyCareerTrack = (trackId: string) => {
        const track = CAREER_TRACKS.find((item) => item.id === trackId);
        if (!track) return;

        const mergedSkills = Array.from(new Set([
            ...skillsList,
            ...track.suggestedSkills
        ]));

        setProfileForm((prev) => ({
            ...prev,
            jobPreferences: track.title,
            skills: mergedSkills.join(', ')
        }));

        toast({
            title: 'Career Track Applied',
            description: `${track.title} guidance has been added to your profile draft. Save your profile to keep it.`
        });
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <SEO
                title="Career Hub | Student Portal"
                description="Manage your career profile, showcase projects, and track your placement readiness."
            />

            <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-white via-blue-50 to-indigo-100 text-slate-950 shadow-2xl dark:border-slate-800/30 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-900 dark:text-white">
                <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1.3fr_0.82fr] lg:px-7">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-slate-300/70 bg-white/90 text-slate-800 shadow-sm hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/10">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Student Career Hub
                            </Badge>
                            <Badge className={`shadow-sm ${selectedCareerTheme.badgeClass}`}>
                                <Layers3 className="mr-1.5 h-3.5 w-3.5" /> {selectedCareerTrack.title}
                            </Badge>
                            <Badge className="border-slate-300/70 bg-white/90 text-slate-800 shadow-sm hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/10">
                                <Target className="mr-1.5 h-3.5 w-3.5" /> {stageMeta.label}
                            </Badge>
                            {profileForm.isAvailableForPlacement && (
                                <Badge className="border-emerald-300/70 bg-emerald-100 text-emerald-700 shadow-sm hover:bg-emerald-100 dark:border-emerald-300/20 dark:bg-emerald-400/15 dark:text-emerald-100 dark:hover:bg-emerald-400/15">
                                    Open for opportunities
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h1 className="max-w-3xl text-[1.85rem] font-bold leading-tight tracking-tight md:text-[2.45rem]">
                                {studentName}, build career proof that moves you toward internships and placements.
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-700 dark:text-blue-100/85">
                                This workspace is your student-side growth board. Use it to strengthen your profile, show real work, improve visibility, and close the gap between learning and career outcomes.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <CareerMetricCard
                                label="Readiness Score"
                                value={`${score}/100`}
                                hint={scoreGap > 0 ? `${scoreGap} points away from placement-ready range` : 'You are already in the placement-ready zone'}
                                icon={TrendingUp}
                                tone="primary"
                            />
                            <CareerMetricCard
                                label="Profile Strength"
                                value={`${profileStrength}%`}
                                hint={`${linkedSignals} of 5 student profile signals completed`}
                                icon={Layers3}
                                tone={profileStrength >= 80 ? 'success' : 'default'}
                            />
                            <CareerMetricCard
                                label="Portfolio Assets"
                                value={`${projects.length + certifications.length}`}
                                hint={`${projects.length} projects and ${certifications.length} certificates available`}
                                icon={FolderOpen}
                                tone={projects.length + certifications.length >= 3 ? 'success' : 'warning'}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="ghost"
                                className={heroPrimaryButtonClass}
                                onClick={fetchCareerData}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Career Signals
                            </Button>
                            <Button
                                variant="ghost"
                                className={heroSecondaryButtonClass}
                                onClick={() => window.open(`/portfolio/${studentId}`, '_blank')}
                            >
                                <Share2 className="mr-2 h-4 w-4" /> Open My Portfolio
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className={interactivePanelClass}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-blue-100/70">
                                        Career Momentum
                                    </p>
                                    <p className={`mt-2 text-lg font-semibold ${stageMeta.tone}`}>{stageMeta.label}</p>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-blue-100/85">{stageMeta.subtitle}</p>
                                </div>
                                <Rocket className="h-5 w-5 text-slate-500 dark:text-blue-100/80" />
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-100/75">
                                    <span>Career momentum</span>
                                    <span>{score}%</span>
                                </div>
                                <Progress value={score} className="h-2 bg-slate-200 dark:bg-white/10" />
                            </div>
                        </div>

                        <div className={interactivePanelClass}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-blue-100/70">
                                        Placement Visibility
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                                        {profileForm.isAvailableForPlacement ? 'Visible for placement consideration' : 'Not yet marked open'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleAvailabilityToggle}
                                    className={`relative h-7 w-12 rounded-full border transition-colors ${profileForm.isAvailableForPlacement ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-slate-200 dark:border-white/15 dark:bg-white/15'}`}
                                >
                                    <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${profileForm.isAvailableForPlacement ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-blue-100/75">
                                Turn this on when your profile, resume, and projects are ready for review by your institution or placement team.
                            </p>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-blue-100/65">Track focus</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedCareerTrack.title}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-blue-100/65">Skill gaps</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{missingSuggestedSkills.length} skills to close</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`rounded-[28px] border p-4 md:p-5 ${selectedCareerTheme.shellClass}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Student Snapshot</p>
                        <h2 className="mt-1 text-lg font-semibold">Signals that shape your placement profile</h2>
                    </div>
                    <Badge className={selectedCareerTheme.badgeClass}>
                        {selectedCareerTrack.title} focus
                    </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {quickWins.map((item) => (
                        <CareerMetricCard
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            hint={item.hint}
                            icon={item.icon}
                            tone={item.tone}
                        />
                    ))}
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className={`${sectionCardBaseClass} ${selectedCareerTheme.shellClass}`}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className={`h-4 w-4 ${selectedCareerTheme.iconClass}`} /> Career Tracks
                        </CardTitle>
                        <CardDescription>
                            Choose the direction that best matches your target role. This helps the page suggest better next steps and skill focus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {CAREER_TRACKS.map((track) => {
                            const isActive = track.id === selectedCareerTrack.id;
                            return (
                                <div
                                    key={track.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => applyCareerTrack(track.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            applyCareerTrack(track.id);
                                        }
                                    }}
                                    className={`cursor-pointer rounded-3xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isActive ? selectedCareerTheme.activeTrackClass : 'border-border/60 bg-background hover:border-primary/20'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">{track.title}</p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{track.summary}</p>
                                        </div>
                                        {isActive && (
                                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">{track.cue}</p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {track.suggestedSkills.slice(0, 4).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="rounded-full px-2.5 py-0.5">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isActive ? 'outline' : 'default'}
                                        className="mt-4"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            applyCareerTrack(track.id);
                                        }}
                                    >
                                        {isActive ? 'Refresh Track Draft' : 'Use This Track'}
                                    </Button>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className={sectionCardBaseClass}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Rocket className="h-4 w-4 text-primary" /> Weekly Mission
                            </CardTitle>
                            <CardDescription>
                                Small wins compound. Complete these student-side actions to improve your career profile quality this week.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <CareerMetricCard
                                    label="Career Streak"
                                    value={`${careerStreak}d`}
                                    hint={`You have opened Career Hub across ${visitCount} tracked visits.`}
                                    icon={RefreshCw}
                                    tone={careerStreak >= 5 ? 'success' : 'primary'}
                                />
                                <CareerMetricCard
                                    label="Mission Progress"
                                    value={`${completedMissionCount}/${weeklyMissions.length}`}
                                    hint={completedMissionCount === weeklyMissions.length ? 'All weekly missions are complete.' : 'Finish more mission items to strengthen your profile.'}
                                    icon={CheckCircle}
                                    tone={completedMissionCount >= 3 ? 'success' : 'warning'}
                                />
                            </div>
                            <Progress value={(completedMissionCount / weeklyMissions.length) * 100} className="h-2" />
                            <div className="space-y-2">
                                {weeklyMissions.map((mission, index) => (
                                    <div key={mission.id} className="flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition-colors hover:bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${mission.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                                {index + 1}
                                            </div>
                                            <span className={mission.done ? 'text-foreground' : 'text-muted-foreground'}>
                                                {mission.label}
                                            </span>
                                        </div>
                                        {mission.done && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`${sectionCardBaseClass} ${selectedCareerTheme.shellClass}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Layers3 className={`h-4 w-4 ${selectedCareerTheme.iconClass}`} /> Skill Gap Navigator
                            </CardTitle>
                            <CardDescription>
                                Based on your current target path, these are the skills that still need stronger proof or attention.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={`rounded-2xl border p-4 ${selectedCareerTheme.shellClass}`}>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Current Track</p>
                                <p className="mt-2 text-lg font-semibold">{selectedCareerTrack.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{selectedCareerTrack.summary}</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border p-4">
                                    <p className="text-sm font-semibold">Strong Signals</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {strongSkills.length > 0 ? strongSkills.map((skill) => (
                                            <Badge key={skill} className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                                                {skill}
                                            </Badge>
                                        )) : (
                                            <span className="text-sm text-muted-foreground">No direct track-aligned skills captured yet.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-2xl border p-4">
                                    <p className="text-sm font-semibold">Suggested Next Skills</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {missingSuggestedSkills.length > 0 ? missingSuggestedSkills.slice(0, 6).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="rounded-full">
                                                {skill}
                                            </Badge>
                                        )) : (
                                            <span className="text-sm text-muted-foreground">You have already covered the main baseline skills for this track.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6">
                    <Card className={`overflow-hidden ${sectionCardBaseClass} border-primary/15`}>
                        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        Readiness Engine
                                    </p>
                                    <h2 className="mt-2 text-lg font-semibold">Placement Readiness</h2>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    Live scoring
                                </Badge>
                            </div>

                            <div className="mt-5 flex justify-center">
                                <ScoreGauge score={score} />
                            </div>

                            <div className="mt-5 space-y-2">
                                {scoreItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-5 w-5 items-center justify-center rounded-full ${item.done ? 'bg-emerald-500' : 'border bg-muted'}`}>
                                                {item.done && <CheckCircle className="h-3 w-3 text-white" />}
                                            </div>
                                            <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                                            {item.note && <span className="text-muted-foreground">{item.note}</span>}
                                        </div>
                                        <span className={`font-semibold ${item.done ? 'text-emerald-600' : 'text-muted-foreground'}`}>+{item.pts}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className={sectionCardBaseClass}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-4 w-4 text-primary" /> Career Action Queue
                            </CardTitle>
                            <CardDescription>
                                Focus on the next few actions that most improve your student profile quality.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {actionQueue.map((item, index) => (
                                <div key={item.title} className="rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${item.done ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                        {item.done && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                            {item.done ? 'Completed signal' : 'Recommended next move'}
                                        </div>
                                        <Button size="sm" variant={item.done ? 'outline' : 'default'} onClick={item.action}>
                                            {item.cta} <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {resumeEnabled && (
                        <Card
                            className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selectedCareerTheme.shellClass}`}
                            onClick={() => navigate('/dashboard/resume-builder')}
                        >
                            <CardContent className="flex items-center gap-4 pt-5 pb-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80">
                                    <FileText className={`h-6 w-6 ${selectedCareerTheme.iconClass}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">AI Resume Builder</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {hasResume ? 'Your resume exists. Tighten it for the role you want next.' : 'Create your resume to unlock a major readiness jump.'}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className={sectionCardBaseClass}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base">Career Profile Control</CardTitle>
                                    <CardDescription>
                                        Build a student profile that clearly communicates your skills, goals, and professional identity.
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    {skillsList.length} skills tagged
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-xs"><Github className="h-3.5 w-3.5" /> GitHub URL (+10 pts)</Label>
                                    <Input
                                        placeholder="https://github.com/username"
                                        value={profileForm.githubUrl}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-xs"><Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn URL (+10 pts)</Label>
                                    <Input
                                        placeholder="https://linkedin.com/in/username"
                                        value={profileForm.linkedinUrl}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" /> Portfolio Website</Label>
                                    <Input
                                        placeholder="https://yourportfolio.com"
                                        value={profileForm.portfolioUrl}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Target role / job preference</Label>
                                    <Input
                                        placeholder="e.g. Frontend Developer, Data Analyst, QA Engineer"
                                        value={profileForm.jobPreferences}
                                        onChange={(e) => setProfileForm((prev) => ({ ...prev, jobPreferences: e.target.value }))}
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Skills (comma-separated)</Label>
                                <Input
                                    placeholder="React, Node.js, Python, Communication, SQL..."
                                    value={profileForm.skills}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, skills: e.target.value }))}
                                    className="h-10"
                                />
                            </div>

                            {skillsList.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.map((skill, index) => (
                                        <Badge key={`${skill}-${index}`} variant="secondary" className="rounded-full px-3 py-1">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                                    Add technical and professional skills so your profile shows what you can actually deliver.
                                </div>
                            )}

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border bg-muted/30 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">Profile Strength</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Links, preferences, and skills improve discoverability.
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold">{profileStrength}%</span>
                                    </div>
                                    <Progress value={profileStrength} className="mt-3 h-2" />
                                </div>

                                <div className="rounded-2xl border bg-muted/30 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">Opportunity Visibility</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Use this when you are ready for internships or placements.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleAvailabilityToggle}
                                            className={`relative h-7 w-12 rounded-full transition-colors ${profileForm.isAvailableForPlacement ? 'bg-emerald-500' : 'bg-muted'}`}
                                        >
                                            <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${profileForm.isAvailableForPlacement ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                                {saving ? 'Saving...' : 'Save Career Profile'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className={sectionCardBaseClass}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FolderOpen className="h-4 w-4 text-primary" /> Project Showcase
                                    </CardTitle>
                                    <CardDescription>
                                        Build visible proof of your work. Each strong project pushes your student profile forward.
                                    </CardDescription>
                                </div>
                                <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="mr-1.5 h-4 w-4" /> Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Add Showcase Project</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-2 space-y-4">
                                            <div className="space-y-1.5">
                                                <Label>Project Title *</Label>
                                                <Input
                                                    placeholder="e.g. AI-Powered Chat App"
                                                    value={newProject.title}
                                                    onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Description *</Label>
                                                <Textarea
                                                    placeholder="What does this project do? What problem does it solve?"
                                                    value={newProject.description}
                                                    onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label>GitHub URL</Label>
                                                    <Input
                                                        placeholder="https://github.com/..."
                                                        value={newProject.githubUrl}
                                                        onChange={(e) => setNewProject((prev) => ({ ...prev, githubUrl: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Live URL</Label>
                                                    <Input
                                                        placeholder="https://..."
                                                        value={newProject.liveUrl}
                                                        onChange={(e) => setNewProject((prev) => ({ ...prev, liveUrl: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Tech Stack (comma-separated)</Label>
                                                <Input
                                                    placeholder="React, Node.js, MongoDB"
                                                    value={newProject.techStack}
                                                    onChange={(e) => setNewProject((prev) => ({ ...prev, techStack: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Image URL (optional)</Label>
                                                <Input
                                                    placeholder="https://..."
                                                    value={newProject.image}
                                                    onChange={(e) => setNewProject((prev) => ({ ...prev, image: e.target.value }))}
                                                />
                                            </div>
                                            <Button className="w-full" onClick={handleAddProject}>Add to Showcase</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <CareerMetricCard
                                    label="Showcase Count"
                                    value={`${projects.length}`}
                                    hint={`${Math.min(projects.length, 3)}/3 projects contributing to readiness score`}
                                    icon={FolderOpen}
                                    tone={projects.length >= 2 ? 'success' : 'default'}
                                />
                                <CareerMetricCard
                                    label="Top Proof"
                                    value={spotlightProject ? 'Available' : 'Missing'}
                                    hint={spotlightProject ? spotlightProject.title : 'Add one standout project first'}
                                    icon={Star}
                                    tone={spotlightProject ? 'primary' : 'warning'}
                                />
                                <CareerMetricCard
                                    label="Live Demos"
                                    value={`${projectsWithLiveLinks}`}
                                    hint="Projects with live links feel more credible to reviewers"
                                    icon={ExternalLink}
                                    tone="default"
                                />
                            </div>

                            {projects.length === 0 ? (
                                <div className="rounded-3xl border-2 border-dashed py-10 text-center">
                                    <FolderOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">
                                        No projects yet. Add your first project to turn learning into visible proof.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    {projects.map((project: any) => (
                                        <div key={project._id} className="overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                                            {project.image ? (
                                                <img src={project.image} alt={project.title} className="h-36 w-full object-cover" />
                                            ) : (
                                                <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
                                                    <FolderOpen className="h-10 w-10 text-primary/30" />
                                                </div>
                                            )}
                                            <div className="space-y-3 p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="text-sm font-semibold leading-tight">{project.title}</h4>
                                                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteProject(project._id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                {project.techStack?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {project.techStack.slice(0, 4).map((tech: string) => (
                                                            <Badge key={tech} variant="secondary" className="rounded-full px-2.5 py-0.5">
                                                                {tech}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-3 text-xs">
                                                    {project.githubUrl && (
                                                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                                                            <Github className="h-3 w-3" /> Code
                                                        </a>
                                                    )}
                                                    {project.liveUrl && (
                                                        <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                            <ExternalLink className="h-3 w-3" /> Live Demo
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

                    <Card className={sectionCardBaseClass}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Award className="h-4 w-4 text-amber-500" /> Verified Certificates
                            </CardTitle>
                            <CardDescription>
                                Verified credentials strengthen trust. Use them to support the role or career track you are aiming for.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <CareerMetricCard
                                    label="Credentials"
                                    value={`${certifications.length}`}
                                    hint={`${Math.min(certifications.length, 2)}/2 certificates improving readiness score`}
                                    icon={Award}
                                    tone={certifications.length > 0 ? 'success' : 'warning'}
                                />
                                <CareerMetricCard
                                    label="Skill Validation"
                                    value={certifications.length > 0 ? 'Active' : 'Low'}
                                    hint={certifications.length > 0 ? 'You already have verified learning proof.' : 'Complete a course to add trusted proof.'}
                                    icon={Shield}
                                    tone={certifications.length > 0 ? 'success' : 'default'}
                                />
                                <CareerMetricCard
                                    label="Next Growth Move"
                                    value={certifications.length >= 2 ? 'Projects' : 'Courses'}
                                    hint={certifications.length >= 2 ? 'Shift focus toward outcome-based proof now.' : 'Add one more certificate if it matches your target role.'}
                                    icon={Rocket}
                                    tone="primary"
                                />
                            </div>

                            {certifications.length === 0 ? (
                                <div className="rounded-3xl border-2 border-dashed py-8 text-center">
                                    <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
                                    <p className="text-sm text-muted-foreground">
                                        Complete courses to earn verified certificates and strengthen your student profile.
                                    </p>
                                    <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/dashboard')}>
                                        Browse Courses
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {certifications.map((certificate: any) => (
                                        <div key={certificate._id} className="flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:bg-muted/20">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">{certificate.courseName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ID: <code className="rounded bg-muted px-1">{certificate.certificateId}</code>
                                                    {certificate.date && ` - ${new Date(certificate.date).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 shrink-0"
                                                onClick={() => window.open(`/verify-certificate?id=${certificate.certificateId}`, '_blank')}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
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
