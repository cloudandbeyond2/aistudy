// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL, websiteURL } from '@/constants';
import {
    Plus, Trash2, Download, Share2, ChevronRight, ChevronLeft,
    FileText, Briefcase, GraduationCap, Award, Eye, CheckCircle, Loader2, User, Link2, Sparkles, Search, Target, AlertCircle,
    X, Building, Calendar, Mail, Phone, MapPin, Linkedin, Github, Globe, BookOpen, Zap, TrendingUp, Shield, Star, Heart, Code,
    Brain, Lock, Stethoscope, HeartPulse, Microscope, Users, ChartBar, Palette, FlaskConical, Music, Cog, HardHat, Factory,
    School, Library, Apple, Cpu, Database, Network, ChartPie, Sigma, ChartLine, Tractor, Leaf, Sprout, Scale, Gavel, FileCheck,
    Camera, Video, Newspaper, Mic, Utensils, Plane, Bed, Map, Truck, Package, Box
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Experience {
    title: string; company: string; location: string;
    startDate: string; endDate: string; description: string;
}
interface Education {
    degree: string; institution: string; year: string; grade: string;
}
interface Certificate {
    certificateId: string; courseName: string; studentName: string; date: string;
}
interface ResumeData {
    profession: string; summary: string; phone: string; email: string;
    location: string; linkedIn: string; github: string; website: string;
    skills: string[]; experience: Experience[]; education: Education[];
    selectedCertificateIds: string[];
}

const INDUSTRY_CATEGORIES = [
    {
        id: 'medical',
        label: 'Nursing & Medical',
        icon: Stethoscope,
        color: 'from-rose-500 to-pink-500',
        bg: 'bg-rose-50 dark:bg-rose-950/20',
        description: 'Healthcare, Nursing, and Medical specialists',
        divisions: [
            { label: 'Registered Nurse', suggestedSkills: ['Patient Care', 'CPR', 'Vital Signs', 'Medical Records', 'Triage'] },
            { label: 'Medical Doctor', suggestedSkills: ['Diagnosis', 'Treatment Planning', 'Patient Counseling', 'Internal Medicine'] },
            { label: 'Pharmacist', suggestedSkills: ['Pharmacology', 'Prescription Verification', 'Drug Safety', 'Patient Education'] },
            { label: 'Lab Technician', suggestedSkills: ['Lab Testing', 'Specimen Collection', 'Microscopy', 'Quality Control'] },
            { label: 'Healthcare Admin', suggestedSkills: ['Hospital Management', 'Medical Billing', 'Compliance', 'Scheduling'] },
        ]
    },
    {
        id: 'management',
        label: 'Management Studies',
        icon: Users,
        color: 'from-blue-600 to-indigo-600',
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        description: 'Business, Admin, and Leadership roles',
        divisions: [
            { label: 'Marketing Manager', suggestedSkills: ['Brand Strategy', 'Market Research', 'Digital Marketing', 'Campaign Management'] },
            { label: 'Financial Analyst', suggestedSkills: ['Financial Modeling', 'Data Analysis', 'Reporting', 'Forecasting'] },
            { label: 'HR Manager', suggestedSkills: ['Recruitment', 'Employee Relations', 'Payroll', 'Performance Management'] },
            { label: 'Project Manager', suggestedSkills: ['Agile', 'Scrum', 'Stakeholder Management', 'Planning'] },
            { label: 'Operations Lead', suggestedSkills: ['Process Optimization', 'Supply Chain', 'Vendor Management', 'Budgeting'] },
        ]
    },
    {
        id: 'arts-science',
        label: 'Arts & Science',
        icon: Palette,
        color: 'from-purple-500 to-violet-500',
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        description: 'Creative arts and scientific research',
        divisions: [
            { label: 'Graphic Designer', suggestedSkills: ['UI Design', 'Photoshop', 'Illustrator', 'Branding', 'Layout'] },
            { label: 'Microbiologist', suggestedSkills: ['Cell Culture', 'Lab Research', 'Microscopy', 'Data Analysis'] },
            { label: 'Psychologist', suggestedSkills: ['Counseling', 'Mental Health', 'Patient Assessment', 'Behavioral Therapy'] },
            { label: 'Content Writer', suggestedSkills: ['Copywriting', 'SEO', 'Creative Writing', 'Editing'] },
            { label: 'Fine Artist', suggestedSkills: ['Painting', 'Sculpting', 'Theory', 'Exhibition Planning'] },
        ]
    },
    {
        id: 'engineering',
        label: 'Engineering',
        icon: Cog,
        color: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        description: 'Technical and structural engineering',
        divisions: [
            { label: 'Civil Engineer', suggestedSkills: ['AutoCAD', 'Structural Analysis', 'Project Management', 'Surveying'] },
            { label: 'Mechanical Engineer', suggestedSkills: ['SolidWorks', 'Thermodynamics', 'Manufacturing', 'CAD'] },
            { label: 'Electrical Engineer', suggestedSkills: ['Circuit Design', 'Power Systems', 'PLC', 'Troubleshooting'] },
            { label: 'Aerospace Engineer', suggestedSkills: ['Aerodynamics', 'Avionics', 'Simulations', 'Materials Science'] },
            { label: 'Structural Engineer', suggestedSkills: ['BIM', 'Seismic Design', 'Project Coordination', 'Specifications'] },
        ]
    },
    {
        id: 'schools',
        label: 'Schools & Education',
        icon: School,
        color: 'from-emerald-500 to-green-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        description: 'Teaching, Admin, and Counseling',
        divisions: [
            { label: 'High School Teacher', suggestedSkills: ['Lesson Planning', 'Curriculum Development', 'Student Assessment', 'Classroom Management'] },
            { label: 'Primary School Teacher', suggestedSkills: ['Child Development', 'Activity Planning', 'Teaching Aids', 'Parent Interaction'] },
            { label: 'School Principal', suggestedSkills: ['Educational Leadership', 'Team Management', 'Budgeting', 'Policy Implementation'] },
            { label: 'Librarian', suggestedSkills: ['Information Management', 'Cataloging', 'Research Support', 'Literacy Programs'] },
            { label: 'Counselor', suggestedSkills: ['Student Counseling', 'Career Guidance', 'Crisis Intervention', 'Workshops'] },
        ]
    },
    {
        id: 'it',
        label: 'IT Company',
        icon: Cpu,
        color: 'from-cyan-500 to-blue-500',
        bg: 'bg-cyan-50 dark:bg-cyan-950/20',
        description: 'Software, Cloud, and Tech infrastructure',
        divisions: [
            { label: 'Frontend Developer', suggestedSkills: ['React', 'TypeScript', 'CSS/Tailwind', 'Responsive Design', 'Next.js'] },
            { label: 'Backend Developer', suggestedSkills: ['Node.js', 'PostgreSQL', 'APIs', 'System Design', 'Docker'] },
            { label: 'Full Stack Engineer', suggestedSkills: ['MERN Stack', 'Architecture', 'Deployment', 'Testing'] },
            { label: 'Cloud Architect', suggestedSkills: ['AWS', 'Azure', 'Serverless', 'Microservices'] },
            { label: 'Cybersecurity Specialist', suggestedSkills: ['Ethical Hacking', 'Network Security', 'Firewalls', 'Incident Response'] },
        ]
    },
    {
        id: 'analytics',
        label: 'Research & Analytics',
        icon: ChartLine,
        color: 'from-fuchsia-500 to-purple-600',
        bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/20',
        description: 'Data science and market research',
        divisions: [
            { label: 'Data Analyst', suggestedSkills: ['SQL', 'Python', 'Power BI', 'Statistical Modeling', 'Excel'] },
            { label: 'Market Researcher', suggestedSkills: ['Consumer Insights', 'Surveys', 'Trend Analysis', 'Reporting'] },
            { label: 'BI Analyst', suggestedSkills: ['Data Visualization', 'ETL', 'Dashboards', 'Business Strategy'] },
            { label: 'Statistician', suggestedSkills: ['Probability', 'R Programming', 'Hypothesis Testing', 'Data Cleaning'] },
            { label: 'Ops Research Analyst', suggestedSkills: ['Optimization', 'Simulation', 'Decision Analysis', 'Mathematics'] },
        ]
    },
    {
        id: 'agriculture',
        label: 'Agri & Environment',
        icon: Tractor,
        color: 'from-lime-600 to-green-600',
        bg: 'bg-lime-50 dark:bg-lime-950/20',
        description: 'Farming, Sustainability, and Food Science',
        divisions: [
            { label: 'Agronomist', suggestedSkills: ['Crop Science', 'Soil Analysis', 'Irrigation', 'Pest Management'] },
            { label: 'Food Scientist', suggestedSkills: ['Food Safety', 'R&D', 'Quality Assurance', 'Lab Testing'] },
            { label: 'Sustainability Specialist', suggestedSkills: ['Environmental Auditing', 'Waste Management', 'Carbon Credits', 'ESG'] },
            { label: 'Environmental Engineer', suggestedSkills: ['Water Treatment', 'Environmental Compliance', 'Permitting', 'Risk Assessment'] },
        ]
    },
    {
        id: 'legal',
        label: 'Legal & Law',
        icon: Scale,
        color: 'from-slate-700 to-gray-800',
        bg: 'bg-slate-50 dark:bg-slate-950/20',
        description: 'Law firms and corporate compliance',
        divisions: [
            { label: 'Corporate Lawyer', suggestedSkills: ['Contract Law', 'Legal Writing', 'Negotiation', 'Intellectual Property'] },
            { label: 'Paralegal', suggestedSkills: ['Legal Research', 'Case Management', 'Documentation', 'Administrative Support'] },
            { label: 'Compliance Officer', suggestedSkills: ['Risk Management', 'Regulatory Audits', 'Policy Drafting', 'AML'] },
            { label: 'Legal Consultant', suggestedSkills: ['Legal Strategy', 'Arbitration', 'Dispute Resolution', 'Advisory'] },
        ]
    },
    {
        id: 'media',
        label: 'Media & Entertainment',
        icon: Camera,
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-50 dark:bg-pink-950/20',
        description: 'Journalism, Film, and Content Creation',
        divisions: [
            { label: 'Journalist', suggestedSkills: ['Reporting', 'News Writing', 'Interviewing', 'Digital Media'] },
            { label: 'Video Editor', suggestedSkills: ['Premiere Pro', 'After Effects', 'Storyboarding', 'Color Grading'] },
            { label: 'Filmmaker', suggestedSkills: ['Direction', 'Cinematography', 'Scriptwriting', 'Production'] },
            { label: 'Digital Content Creator', suggestedSkills: ['Social Media', 'Content Strategy', 'Video Production', 'SEO'] },
        ]
    },
    {
        id: 'hospitality',
        label: 'Hospitality & Tourism',
        icon: Utensils,
        color: 'from-yellow-600 to-orange-600',
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        description: 'Hotels, Travel, and Culinary arts',
        divisions: [
            { label: 'Hotel Manager', suggestedSkills: ['Hospitality Management', 'Guest Services', 'Staff Leadership', 'Budgeting'] },
            { label: 'Executive Chef', suggestedSkills: ['Menu Planning', 'Culinary Arts', 'Kitchen Prep', 'Food Safety'] },
            { label: 'Flight Attendant', suggestedSkills: ['Safety Procedures', 'Customer Service', 'Emergency Management', 'Communication'] },
            { label: 'Travel Consultant', suggestedSkills: ['Tour Planning', 'CRM', 'Ticketing', 'Destination Knowledge'] },
        ]
    },
    {
        id: 'logistics',
        label: 'Logistics & Supply Chain',
        icon: Truck,
        color: 'from-sky-700 to-blue-800',
        bg: 'bg-sky-50 dark:bg-sky-950/20',
        description: 'Shipping, Inventory, and Procurement',
        divisions: [
            { label: 'Logistics Manager', suggestedSkills: ['Freight Management', 'Route Optimization', 'Inventory Control', 'SAP'] },
            { label: 'Supply Chain Analyst', suggestedSkills: ['Demand Planning', 'Forecasting', 'Vendor Analysis', 'Data Analytics'] },
            { label: 'Warehouse Lead', suggestedSkills: ['Storage Layout', 'Workplace Safety', 'WMS', 'Team Supervision'] },
            { label: 'Procurement Specialist', suggestedSkills: ['Strategic Sourcing', 'Price Negotiation', 'Purchase Orders', 'Contract Management'] },
        ]
    },
    {
        id: 'other',
        label: 'Other Profession',
        icon: User,
        color: 'from-gray-500 to-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-800',
        description: 'Manual entry for specialized roles',
        divisions: [
            { label: 'Other', suggestedSkills: [] }
        ]
    }
];

const PROFESSIONS = INDUSTRY_CATEGORIES.flatMap(cat => 
    cat.divisions.map(div => ({
        label: div.label,
        icon: cat.icon,
        color: cat.color,
        bg: cat.bg,
        suggestedSkills: div.suggestedSkills,
        category: cat.label
    }))
);

const STEPS = [
    { id: 1, label: 'Profession', icon: Briefcase, description: 'Choose your career path' },
    { id: 2, label: 'Profile', icon: User, description: 'Personal information' },
    { id: 3, label: 'Experience', icon: Briefcase, description: 'Work history' },
    { id: 4, label: 'Education', icon: GraduationCap, description: 'Academic background' },
    { id: 5, label: 'Certifications', icon: Award, description: 'Your achievements' },
    { id: 6, label: 'ATS Scanner', icon: Search, description: 'Optimize for jobs' },
    { id: 7, label: 'Preview', icon: Eye, description: 'Final review' },
];

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const emptyExp = (): Experience => ({ title: '', company: '', location: '', startDate: '', endDate: '', description: '' });
const emptyEdu = (): Education => ({ degree: '', institution: '', year: '', grade: '' });

// ─── Resume Print Template ────────────────────────────────────────────────────
const ResumePrint = React.forwardRef<HTMLDivElement, { resume: ResumeData; userName: string; certs: Certificate[] }>(
    ({ resume, userName, certs }, ref) => {
        const selectedCerts = certs.filter(c => resume.selectedCertificateIds.includes(c.certificateId));
        return (
            <div
                ref={ref}
                id="resume-print"
                style={{
                    width: '794px', background: '#fff', color: '#111',
                    fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 72px', boxSizing: 'border-box',
                    position: 'absolute', top: '-9999px', left: '-9999px'
                }}
            >
                {/* Header */}
                <div style={{ borderBottom: '3px solid #0d9488', paddingBottom: '20px', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#0d9488', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {userName}
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 12px', fontWeight: 500 }}>
                        {resume.profession}
                    </p>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px', color: '#374151' }}>
                        {resume.email && <span>📧 {resume.email}</span>}
                        {resume.phone && <span>📱 {resume.phone}</span>}
                        {resume.location && <span>📍 {resume.location}</span>}
                        {resume.linkedIn && <span>🔗 {resume.linkedIn}</span>}
                        {resume.github && <span>💻 {resume.github}</span>}
                        {resume.website && <span>🌐 {resume.website}</span>}
                    </div>
                </div>

                {/* Summary */}
                {resume.summary && (
                    <Section title="Professional Summary">
                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#1f2937' }}>{resume.summary}</p>
                    </Section>
                )}

                {/* Experience */}
                {resume.experience.length > 0 && (
                    <Section title="Work Experience">
                        {resume.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <strong style={{ fontSize: '14px', color: '#1f2937' }}>{exp.title}</strong>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#0d9488', margin: '2px 0' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                {exp.description && <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', lineHeight: '1.6' }}>{exp.description}</p>}
                            </div>
                        ))}
                    </Section>
                )}

                {/* Education */}
                {resume.education.length > 0 && (
                    <Section title="Education">
                        {resume.education.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: '14px', color: '#1f2937' }}>{edu.degree}</strong>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{edu.year}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#0d9488', margin: '2px 0' }}>{edu.institution}</p>
                                {edu.grade && <p style={{ fontSize: '11px', color: '#6b7280' }}>Grade: {edu.grade}</p>}
                            </div>
                        ))}
                    </Section>
                )}

                {/* Skills */}
                {resume.skills.length > 0 && (
                    <Section title="Skills">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {resume.skills.map((s, i) => (
                                <span key={i} style={{ background: '#f0fdfa', color: '#0d9488', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: 500, border: '1px solid #99f6e4' }}>{s}</span>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Certifications */}
                {selectedCerts.length > 0 && (
                    <Section title="Certifications">
                        {selectedCerts.map((c, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <strong style={{ fontSize: '12px' }}>🏅 {c.courseName}</strong>
                                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>{c.date ? new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : ''}</span>
                                </div>
                            </div>
                        ))}
                    </Section>
                )}
            </div>
        );
    }
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#0d9488', marginBottom: '12px', borderBottom: '1px solid #ccfbf1', paddingBottom: '6px' }}>
            {title}
        </h2>
        {children}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ResumeBuilder = () => {
    const uid = sessionStorage.getItem('uid');
    const userType = sessionStorage.getItem('type');
    const userRole = sessionStorage.getItem('role');
    const orgId = sessionStorage.getItem('orgId');
    const PAID = ['monthly', 'yearly', 'forever'];

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [userName, setUserName] = useState('');
    const [allCerts, setAllCerts] = useState<Certificate[]>([]);
    const [customProfession, setCustomProfession] = useState('');
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const printRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [atsResult, setAtsResult] = useState<{
        score: number,
        missingKeywords: string[],
        matchLevel: string,
        suggestions: string[]
    } | null>(null);

    // ── ATS Daily Rate Limit (3 scans/day) ─────────────────────────────────────
    const ATS_LIMIT = 3;
    const ATS_LS_KEY = `ats_scans_${uid}`;
    const getATSUsage = () => {
        try {
            const raw = localStorage.getItem(ATS_LS_KEY);
            if (!raw) return { count: 0, date: '' };
            return JSON.parse(raw) as { count: number; date: string };
        } catch { return { count: 0, date: '' }; }
    };
    const todayStr = new Date().toISOString().slice(0, 10);
    const atsUsage = getATSUsage();
    const atsToday = atsUsage.date === todayStr ? atsUsage.count : 0;
    const [atsScansLeft, setAtsScansLeft] = useState(Math.max(0, ATS_LIMIT - atsToday));

    const [resume, setResume] = useState<ResumeData>({
        profession: sessionStorage.getItem('profession') || '',
        summary: '',
        phone: sessionStorage.getItem('phone') || '',
        email: sessionStorage.getItem('email') || '',
        location: [sessionStorage.getItem('city'), sessionStorage.getItem('country')].filter(Boolean).join(', '),
        linkedIn: '',
        github: '',
        website: '',
        skills: [],
        experience: [],
        education: [],
        selectedCertificateIds: [],
    });

    // Access guard
    const isPaid = PAID.includes(userType);
    const isOrgUser = !!orgId;

    if (!isPaid && !isOrgUser) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md mx-auto"
                >
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Lock className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
                    <p className="text-muted-foreground mb-6">
                        Unlock the professional Resume Builder with AI-powered suggestions, ATS optimization, and beautiful templates.
                    </p>
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-8">
                        <a href="/dashboard/pricing">Upgrade Now →</a>
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Fetch resume data
    useEffect(() => {
        if (!uid) { setLoading(false); return; }

        const checkAccessAndFetch = async () => {
            try {
                // Check Access
                const settingsRes = await axios.get(`${serverURL}/api/settings`);
                if (settingsRes.data && settingsRes.data.resumeEnabled) {
                    const enabledSettings = settingsRes.data.resumeEnabled;
                    let isEnabled = false;

                    if (userRole === 'org_admin') isEnabled = enabledSettings.org_admin;
                    else if (userRole === 'student') isEnabled = enabledSettings.student;
                    else isEnabled = enabledSettings[userType] || false;

                    if (!isEnabled) {
                        toast({
                            title: "Access Restricted",
                            description: "Resume Builder is currently disabled by the administrator.",
                            variant: "destructive",
                        });
                        navigate('/dashboard');
                        return;
                    }
                }

                // Fetch Data
                setUserName(sessionStorage.getItem('mName') || '');
                const res = await axios.get(`${serverURL}/api/resume/my/${uid}`, { headers: { 'x-user-id': uid } });
                if (res.data.success) {
                    setUserName(res.data.userName || sessionStorage.getItem('mName') || '');
                    setAllCerts(res.data.allCertifications || []);
                    const r = res.data.resume;
                    setResume(prev => ({
                        ...prev,
                        profession: r.profession || prev.profession,
                        summary: r.summary || '',
                        phone: r.phone || prev.phone,
                        email: r.email || prev.email,
                        location: r.location || prev.location,
                        linkedIn: r.linkedIn || '',
                        github: r.github || '',
                        website: r.website || '',
                        skills: r.skills || [],
                        experience: r.experience || [],
                        education: r.education || [],
                        selectedCertificateIds: r.selectedCertificateIds || [],
                    }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        checkAccessAndFetch();
    }, [uid, userRole, userType, navigate]);

    // ── handlers ──────────────────────────────────────────────
    const setField = (field: keyof ResumeData, value: any) =>
        setResume(prev => ({ ...prev, [field]: value }));

    const addExp = () => setResume(prev => ({ ...prev, experience: [...prev.experience, emptyExp()] }));
    const removeExp = (i: number) => setResume(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
    const updateExp = (i: number, field: keyof Experience, val: string) =>
        setResume(prev => ({ ...prev, experience: prev.experience.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

    const addEdu = () => setResume(prev => ({ ...prev, education: [...prev.education, emptyEdu()] }));
    const removeEdu = (i: number) => setResume(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
    const updateEdu = (i: number, field: keyof Education, val: string) =>
        setResume(prev => ({ ...prev, education: prev.education.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !resume.skills.includes(s)) { setField('skills', [...resume.skills, s]); setSkillInput(''); }
    };
    const removeSkill = (s: string) => setField('skills', resume.skills.filter(sk => sk !== s));

    const toggleCert = (certId: string) => {
        const selected = resume.selectedCertificateIds;
        setField('selectedCertificateIds', selected.includes(certId)
            ? selected.filter(id => id !== certId)
            : [...selected, certId]);
    };

    // ── AI Summary ──────────────────────────────────────────
    const handleAISummary = async () => {
        if (!resume.profession) {
            toast({ title: 'Select Profession First', description: 'Please select your profession in Step 1 to generate an AI summary.', variant: 'destructive' });
            return;
        }
        setGeneratingSummary(true);
        try {
            const professionToUse = resume.profession === 'Other' ? customProfession : resume.profession;
            const prompt = `Create a professional 2-3 sentence resume summary for ${userName}, a ${professionToUse}. Focus on expertise, impact, and a professional tone. 
            IMPORTANT: Return ONLY the summary as plain text. Do NOT include any JSON, markdown, array format, or extra labels. Just the sentences.`;
            const res = await axios.post(`${serverURL}/api/prompt`, { prompt });
            if (res.data && res.data.generatedText) {
                setField('summary', res.data.generatedText.trim());
                toast({ title: '✨ Summary Generated', description: 'AI has generated a summary based on your profession.' });
            }
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || 'Could not generate AI summary. Please try manual entry.';
            toast({ title: 'AI Error', description: msg, variant: 'destructive' });
        } finally {
            setGeneratingSummary(false);
        }
    };

    // ── ATS Scan ───────────────────────────────────────────
    const handleATSScan = async () => {
        if (!jobDescription) {
            toast({ title: 'Input Required', description: 'Please paste a Job Description to scan against.', variant: 'destructive' });
            return;
        }
        // Rate limit check
        if (atsScansLeft <= 0) {
            toast({ title: '🚫 Daily Limit Reached', description: 'You can only run 3 ATS scans per day. Try again tomorrow!', variant: 'destructive' });
            return;
        }
        setIsScanning(true);
        try {
            const resumeText = [
                `Name: ${userName}`,
                `Profession: ${resume.profession}`,
                `Summary: ${resume.summary}`,
                `Skills: ${resume.skills.join(', ')}`,
                `Experience: ${resume.experience.map(e => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'}): ${e.description}`).join('; ')}`,
                `Education: ${resume.education.map(e => `${e.degree} from ${e.institution} (${e.year})`).join('; ')}`,
            ].join('\n');

            const res = await axios.post(`${serverURL}/api/prompt`, { 
                prompt: `Compare the following resume against the job description and provide a detailed analysis.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`,
                systemInstruction: `You are an expert ATS (Applicant Tracking System) analyzer. 
                1. Calculate an ATS compatibility score from 0 to 100 based on keyword matches, skills alignment, and experience relevance.
                2. List the important keywords from the job description that are MISSING from the resume.
                3. Determine the match level: "High" if score >= 70, "Medium" if score >= 40, "Low" if score < 40.
                4. Provide 3-5 actionable suggestions to improve the resume's ATS score.
                
                You MUST respond with ONLY a valid JSON object matching the requested schema.`,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: "object",
                    properties: {
                        score: { type: "number" },
                        missingKeywords: { type: "array", items: { type: "string" } },
                        matchLevel: { type: "string", enum: ["High", "Medium", "Low"] },
                        suggestions: { type: "array", items: { type: "string" } }
                    },
                    required: ["score", "missingKeywords", "matchLevel", "suggestions"]
                }
            });
            if (res.data && res.data.generatedText) {
                const rawText = res.data.generatedText;
                try {
                    const parsed = JSON.parse(rawText);
                    let finalScore = 0;
                    if (typeof parsed.score === 'number') {
                        finalScore = parsed.score;
                    } else if (typeof parsed.score === 'string') {
                        finalScore = parseInt(parsed.score.replace(/[^0-9]/g, '')) || 0;
                    }
                    setAtsResult({
                        score: finalScore,
                        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
                        matchLevel: parsed.matchLevel || 'Low',
                        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                    });
                    // Deduct a scan from daily quota
                    const newCount = atsToday + 1;
                    localStorage.setItem(ATS_LS_KEY, JSON.stringify({ count: newCount, date: todayStr }));
                    setAtsScansLeft(Math.max(0, ATS_LIMIT - newCount));
                    toast({ title: '✅ Scan Complete', description: `Your resume has been analyzed. ${Math.max(0, ATS_LIMIT - newCount)} scan(s) remaining today.` });
                } catch (parseErr) {
                    console.error('ATS JSON Parse Error:', parseErr);
                    let jsonStr = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
                    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const extractedParsed = JSON.parse(jsonMatch[0]);
                        setAtsResult({
                            score: parseInt(extractedParsed.score) || 0,
                            missingKeywords: extractedParsed.missingKeywords || [],
                            matchLevel: extractedParsed.matchLevel || 'Low',
                            suggestions: extractedParsed.suggestions || [],
                        });
                        const newCount = atsToday + 1;
                        localStorage.setItem(ATS_LS_KEY, JSON.stringify({ count: newCount, date: todayStr }));
                        setAtsScansLeft(Math.max(0, ATS_LIMIT - newCount));
                        toast({ title: '✅ Scan Complete', description: `Resume analyzed. ${Math.max(0, ATS_LIMIT - newCount)} scan(s) remaining today.` });
                    } else {
                        throw new Error('Failed to parse AI response');
                    }
                }
            }
        } catch (err: any) {
            console.error('ATS Scan Error:', err);
            toast({ title: 'Scan Error', description: 'Could not complete ATS scan. Please try again.', variant: 'destructive' });
        } finally {
            setIsScanning(false);
        }
    };

    // ── Save ─────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const profToSave = resume.profession === 'Other' ? customProfession : resume.profession;
            const res = await axios.post(`${serverURL}/api/resume`, { userId: uid, ...resume, profession: profToSave },
                { headers: { 'x-user-id': uid } });
            if (res.data.success) {
                toast({ title: '✅ Resume Saved', description: 'Your resume has been saved successfully.' });
            }
        } catch (err: any) {
            toast({ title: 'Error saving resume', description: err?.response?.data?.message || 'Server error', variant: 'destructive' });
        } finally { setSaving(false); }
    };

    // ── PDF Download ─────────────────────────────────────────
    const handleDownload = async () => {
        if (!printRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgW = pageW;
            const imgH = (canvas.height * imgW) / canvas.width;

            let heightLeft = imgH;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
            heightLeft -= pageH;

            while (heightLeft > 0) {
                position = heightLeft - imgH;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
                heightLeft -= pageH;
            }

            pdf.save(`${userName.replace(/ /g, '_')}_Resume.pdf`);
        } catch (err) {
            console.error(err);
            toast({ title: 'PDF error', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
        } finally { setDownloading(false); }
    };

    // ── Social Share ──────────────────────────────────────────
    const handleShare = async () => {
        const shareUrl = `${websiteURL}/resume/${uid}`;
        const shareData = {
            title: `${userName}'s Professional Resume`,
            text: `Check out ${userName}'s professional resume built with Colossus IQ!`,
            url: shareUrl,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: '🔗 Link Copied!', description: 'Resume link copied to clipboard. Share it on LinkedIn, WhatsApp or Twitter!' });
        }
    };

    // Get current profession color
    const currentProfession = PROFESSIONS.find(p => p.label === resume.profession);
    const professionColor = currentProfession?.color || 'from-purple-500 to-pink-500';
    const professionBg = currentProfession?.bg || 'bg-purple-50 dark:bg-purple-950/20';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-pink-500"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-500 animate-pulse" />
                </div>
            </div>
        );
    }

    const selectedCerts = allCerts.filter(c => resume.selectedCertificateIds.includes(c.certificateId));

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/30 dark:from-slate-950 dark:via-teal-950/10 dark:to-cyan-950/10">
            <div className="container max-w-6xl mx-auto py-8 px-4 relative">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-cyan-400/5 blur-[120px] rounded-full"></div>
                {/* Hidden print element */}
                <ResumePrint ref={printRef} resume={resume} userName={userName} certs={allCerts} />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Resume Builder
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Create a professional resume that stands out
                            </p>
                        </div>
                        {step === 7 && (
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2 rounded-full" onClick={handleShare}>
                                    <Share2 className="h-4 w-4" /> Share
                                </Button>
                                <Button className="gap-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700" onClick={handleDownload} disabled={downloading}>
                                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Download PDF
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── How-to-Use Guide ─────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <details className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-teal-200 dark:border-teal-800 rounded-2xl shadow-md overflow-hidden">
                        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none list-none">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-teal-700 dark:text-teal-300 text-sm">📋 How to Use the Resume Builder</p>
                                    <p className="text-xs text-muted-foreground">Click to read step-by-step instructions</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-teal-500 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="px-6 pb-6 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {[
                                    { step: '1', icon: Briefcase, title: 'Choose Profession', desc: 'Select your industry and specific role. This personalises your AI suggestions throughout.' },
                                    { step: '2', icon: User, title: 'Fill Your Profile', desc: 'Add your contact info, professional summary (use AI Generate!), and skills.' },
                                    { step: '3', icon: Building, title: 'Add Experience', desc: 'List your work history with job titles, companies, dates and key responsibilities.' },
                                    { step: '4', icon: GraduationCap, title: 'Education', desc: 'Enter your degrees, institutions, year, and grades.' },
                                    { step: '5', icon: Award, title: 'Certifications', desc: 'Select courses you have completed on the platform to auto-attach certificates.' },
                                    { step: '6', icon: Search, title: 'ATS Scanner', desc: 'Paste a job description to check how well your resume matches it. 3 free scans/day.' },
                                    { step: '7', icon: Eye, title: 'Preview & Download', desc: 'Review your resume, download as a professional PDF, or share a live link.' },
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
                                    '✅ Your progress saves automatically',
                                    '✅ Use AI Generate for a smart professional summary',
                                    '✅ Download as PDF in one click',
                                    '✅ Share your resume link on LinkedIn or WhatsApp',
                                ].map(tip => (
                                    <span key={tip} className="text-xs bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-3 py-1 rounded-full">{tip}</span>
                                ))}
                            </div>
                        </div>
                    </details>
                </motion.div>

                {/* Step Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((s, idx) => (
                            <button
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                className={`flex flex-col items-center gap-2 transition-all ${step === s.id ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    step >= s.id 
                                        ? `bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg` 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                                    {step > s.id ? <CheckCircle className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                                </div>
                                <span className="text-xs hidden sm:inline">{s.label}</span>
                            </button>
                        ))}
                    </div>
                    <Progress value={(step / STEPS.length) * 100} className="h-2" />
                </motion.div>

                {/* Step Content */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Step 1: Profession */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <AnimatePresence mode="wait">
                                {!selectedCategory ? (
                                    <motion.div
                                        key="categories"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {INDUSTRY_CATEGORIES.map((cat) => (
                                            <Card 
                                                key={cat.id}
                                                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md overflow-hidden"
                                                onClick={() => setSelectedCategory(cat)}
                                            >
                                                <div className={`h-2 w-full bg-gradient-to-r ${cat.color}`}></div>
                                                <CardHeader className="pb-2">
                                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center p-2.5 shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                                                        <cat.icon className="text-white h-7 w-7" />
                                                    </div>
                                                    <CardTitle className="text-xl">{cat.label}</CardTitle>
                                                    <CardDescription className="line-clamp-2">{cat.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                                                        View roles <ChevronRight className="h-4 w-4 ml-1" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="divisions"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setSelectedCategory(null)}
                                                className="rounded-full gap-1"
                                            >
                                                <ChevronLeft className="h-4 w-4" /> Back to Industries
                                            </Button>
                                            <Separator orientation="vertical" className="h-6" />
                                            <div className="flex items-center gap-2">
                                                <selectedCategory.icon className={`h-5 w-5 bg-gradient-to-r ${selectedCategory.color} bg-clip-text text-transparent`} />
                                                <span className="font-semibold text-lg">{selectedCategory.label}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {selectedCategory.divisions.map((div) => {
                                                const isSelected = resume.profession === div.label;
                                                return (
                                                    <motion.button
                                                        key={div.label}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => {
                                                            setField('profession', div.label);
                                                            if (div.label !== 'Other') {
                                                                toast({
                                                                    title: "Profession Selected",
                                                                    description: `Great! We'll tailor your resume for ${div.label}.`,
                                                                });
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${isSelected
                                                            ? `border-teal-500 bg-gradient-to-br ${selectedCategory.bg} shadow-lg ring-2 ring-teal-500/20`
                                                            : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-800'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2">
                                                                <CheckCircle className="h-4 w-4 text-teal-600" />
                                                            </div>
                                                        )}
                                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                            <selectedCategory.icon className="h-7 w-7 text-white" />
                                                        </div>
                                                        <span className="text-sm font-bold text-center tracking-tight">{div.label}</span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {resume.profession === 'Other' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-teal-300 dark:border-teal-800 max-w-xl mx-auto"
                                            >
                                                <Label className="text-base font-semibold mb-3 block">Specify your specialized role</Label>
                                                <div className="flex gap-3">
                                                    <Input 
                                                        value={customProfession} 
                                                        onChange={e => setCustomProfession(e.target.value)} 
                                                        placeholder="e.g. Technical Writer, AI Architect, Research Fellow..."
                                                        className="rounded-2xl h-12 text-lg border-2 focus:ring-teal-500"
                                                    />
                                                    <Button 
                                                        onClick={() => setField('profession', customProfession)}
                                                        className="h-12 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700"
                                                    >
                                                        Set Role
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {resume.profession && resume.profession !== 'Other' && (
                                            <div className="flex justify-center mt-8">
                                                <Button 
                                                    onClick={() => setStep(2)}
                                                    size="lg"
                                                    className="rounded-full px-12 h-14 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all gap-2 text-lg font-bold"
                                                >
                                                    Continue to Profile <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Step 2: Profile */}
                    {step === 2 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-teal-500" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Tell us about yourself</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><User className="h-3 w-3" /> Full Name</Label>
                                        <Input value={userName} readOnly className="rounded-xl bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Mail className="h-3 w-3" /> Email</Label>
                                        <Input value={resume.email} onChange={e => setField('email', e.target.value)} placeholder="you@email.com" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Phone className="h-3 w-3" /> Phone</Label>
                                       <Input value={resume.phone} onChange={(e) => { let value = e.target.value.replace(/\D/g, ''); if (value.length > 10) { value = value.slice(0, 10);  } setField('phone', value); }} placeholder="Enter 10-digit number" className="rounded-xl" maxLength={10} inputMode="numeric"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Location</Label>
                                        <Input value={resume.location} onChange={e => setField('location', e.target.value)} placeholder="City, Country" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn</Label>
                                        <Input value={resume.linkedIn} onChange={e => setField('linkedIn', e.target.value)} placeholder="linkedin.com/in/you" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Github className="h-3 w-3" /> GitHub</Label>
                                        <Input value={resume.github} onChange={e => setField('github', e.target.value)} placeholder="github.com/you" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="flex items-center gap-2"><Globe className="h-3 w-3" /> Website / Portfolio</Label>
                                        <Input value={resume.website} onChange={e => setField('website', e.target.value)} placeholder="yoursite.com" className="rounded-xl" />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-teal-500" /> Professional Summary</Label>
                                        <Button
                                            onClick={handleAISummary}
                                            disabled={generatingSummary}
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full"
                                        >
                                            {generatingSummary ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                            AI Generate
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={resume.summary}
                                        rows={4}
                                        onChange={e => setField('summary', e.target.value)}
                                        placeholder="A compelling summary about your professional background, key achievements, and career goals..."
                                        className="rounded-xl resize-none"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2"><Zap className="h-4 w-4 text-teal-500" /> Skills</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            placeholder="Add a skill and press Enter"
                                            className="rounded-xl"
                                        />
                                        <Button onClick={addSkill} variant="outline" className="rounded-xl">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map(s => (
                                            <span key={s} className="flex items-center gap-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
                                                {s}
                                                <button onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Suggested Skills */}
                                    {(() => {
                                        const prof = PROFESSIONS.find(p => p.label === resume.profession);
                                        const suggested = [...(prof?.suggestedSkills || [])];
                                        const uniqueSuggested = Array.from(new Set(suggested)).filter(s => !resume.skills.includes(s));
                                        if (uniqueSuggested.length === 0) return null;
                                        return (
                                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800">
                                                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-teal-500" /> Suggested skills for {resume.profession}:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {uniqueSuggested.slice(0, 8).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setField('skills', [...resume.skills, s])}
                                                            className="text-xs bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                                                        >
                                                            + {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Experience */}
                    {step === 3 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-teal-500" />
                                        Work Experience
                                    </CardTitle>
                                    <CardDescription>Showcase your professional journey</CardDescription>
                                </div>
                                <Button onClick={addExp} variant="outline" className="gap-2 rounded-full border-teal-300 text-teal-700 hover:bg-teal-50">
                                    <Plus className="h-4 w-4" /> Add Experience
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {resume.experience.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">No experience added yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">Click "Add Experience" to start building your career timeline</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {resume.experience.map((exp, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-md transition-shadow"
                                            >
                                                <button onClick={() => removeExp(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Job Title</Label>
                                                        <Input value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} placeholder="e.g. Senior Software Engineer" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Company</Label>
                                                        <Input value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="e.g. Google, Microsoft" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Location</Label>
                                                        <Input value={exp.location} onChange={e => updateExp(i, 'location', e.target.value)} placeholder="e.g. Bangalore, India" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Start Date</Label>
                                                        <Input value={exp.startDate} onChange={e => updateExp(i, 'startDate', e.target.value)} placeholder="e.g. Jan 2022" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>End Date</Label>
                                                        <Input value={exp.endDate} onChange={e => updateExp(i, 'endDate', e.target.value)} placeholder="e.g. Dec 2023 or Present" className="rounded-xl" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mt-4">
                                                    <Label>Description</Label>
                                                    <Textarea 
                                                        value={exp.description} 
                                                        rows={3} 
                                                        onChange={e => updateExp(i, 'description', e.target.value)}
                                                        placeholder="Describe your key responsibilities, achievements, and impact..."
                                                        className="rounded-xl resize-none"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Education */}
                    {step === 4 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-teal-500" />
                                        Education
                                    </CardTitle>
                                    <CardDescription>Your academic background</CardDescription>
                                </div>
                                <Button onClick={addEdu} variant="outline" className="gap-2 rounded-full border-teal-300 text-teal-700 hover:bg-teal-50">
                                    <Plus className="h-4 w-4" /> Add Education
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {resume.education.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <GraduationCap className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">No education added yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">Click "Add Education" to add your degrees and certifications</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {resume.education.map((edu, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:shadow-md transition-shadow"
                                            >
                                                <button onClick={() => removeEdu(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Degree / Certificate</Label>
                                                        <Input value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="e.g. B.Tech Computer Science" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Institution</Label>
                                                        <Input value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="e.g. IIT Madras, Stanford" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Year</Label>
                                                        <Input value={edu.year} onChange={e => updateEdu(i, 'year', e.target.value)} placeholder="e.g. 2020 or 2018–2022" className="rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Grade / CGPA</Label>
                                                        <Input value={edu.grade} onChange={e => updateEdu(i, 'grade', e.target.value)} placeholder="e.g. 8.5/10, First Class" className="rounded-xl" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 5: Certifications */}
                    {step === 5 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-teal-500" />
                                    Certifications
                                </CardTitle>
                                <CardDescription>Select the certificates to showcase your expertise</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allCerts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Award className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">No certifications earned yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">Complete courses to earn certificates and add them to your resume</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {allCerts.map(c => (
                                            <motion.div
                                                key={c.certificateId}
                                                whileHover={{ scale: 1.02 }}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${resume.selectedCertificateIds.includes(c.certificateId)
                                                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-teal-300'
                                                }`}
                                                onClick={() => toggleCert(c.certificateId)}
                                            >
                                                <Checkbox
                                                    checked={resume.selectedCertificateIds.includes(c.certificateId)}
                                                    onCheckedChange={() => toggleCert(c.certificateId)}
                                                    className="pointer-events-none"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{c.courseName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {c.date ? new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}
                                                    </p>
                                                </div>
                                                <Award className="h-5 w-5 text-yellow-500" />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 6: ATS Scanner */}
                    {step === 6 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-teal-500" />
                                    ATS Compatibility Scanner
                                </CardTitle>
                                <CardDescription>Optimize your resume for Applicant Tracking Systems</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* ── Org Student Restriction ──────────────────────────────── */}
                                {isOrgUser && userRole === 'student' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center text-center py-10 px-6 gap-5"
                                    >
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                                            <Lock className="h-10 w-10 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">ATS Scanner — Restricted</h3>
                                            <p className="text-muted-foreground text-sm max-w-md">
                                                The ATS Compatibility Scanner is not available for organisation students. This feature is managed by your organisation administrator.
                                            </p>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4 max-w-sm w-full">
                                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2 justify-center">
                                                <AlertCircle className="h-4 w-4" /> Contact Your Organisation Admin
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                To get access to the ATS Scanner, please reach out to your organisation administrator or institution IT support team to enable this feature for your account.
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs px-4 py-1 rounded-full">
                                            🏫 Organisation Account Restriction
                                        </Badge>
                                    </motion.div>
                                ) : (
                                <>
                                {/* ── ATS How-to Instructions ──────────────────────────────── */}
                                <details className="group bg-teal-50/50 dark:bg-teal-950/10 border border-teal-200 dark:border-teal-800 rounded-2xl overflow-hidden">
                                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-teal-500" />
                                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">How does the ATS Scanner work?</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-teal-400 group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <div className="px-5 pb-5 pt-1 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { icon: '📋', title: 'Paste Job Description', desc: 'Copy a full job posting from LinkedIn, Naukri, or any job portal and paste it into the box below.' },
                                                { icon: '🤖', title: 'AI Analysis', desc: 'Our AI compares your resume content — skills, experience, keywords — against the job description.' },
                                                { icon: '📊', title: 'Get Your Score', desc: 'Receive an ATS score (0–100), missing keywords, a match level (High / Medium / Low), and improvement tips.' },
                                            ].map(tip => (
                                                <div key={tip.title} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-teal-100 dark:border-teal-900">
                                                    <p className="text-lg mb-1">{tip.icon}</p>
                                                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{tip.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {[
                                                '⚡ 3 free scans per day — resets at midnight',
                                                '🎯 Score ≥ 70 = High Match',
                                                '📝 Add missing keywords to boost your score',
                                                '🔁 Re-run after editing your resume for best results',
                                            ].map(t => (
                                                <span key={t} className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </details>

                                {/* Daily limit banner */}
                                <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
                                    atsScansLeft === 0
                                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                        : atsScansLeft === 1
                                            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                                            : 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <Target className={`h-4 w-4 ${
                                            atsScansLeft === 0 ? 'text-red-500' : atsScansLeft === 1 ? 'text-amber-500' : 'text-teal-500'
                                        }`} />
                                        <span className={`text-sm font-semibold ${
                                            atsScansLeft === 0 ? 'text-red-700 dark:text-red-300' : atsScansLeft === 1 ? 'text-amber-700 dark:text-amber-300' : 'text-teal-700 dark:text-teal-300'
                                        }`}>
                                            {atsScansLeft === 0 ? 'Daily limit reached — resets tomorrow' : `${atsScansLeft} of ${ATS_LIMIT} scans remaining today`}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(ATS_LIMIT)].map((_, i) => (
                                            <div key={i} className={`h-2.5 w-2.5 rounded-full ${
                                                i < (ATS_LIMIT - atsScansLeft) ? 'bg-red-400' : 'bg-teal-400'
                                            }`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Job Description</Label>
                                    <Textarea 
                                        value={jobDescription} 
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here to analyze how well your resume matches..."
                                        className="min-h-[200px] rounded-2xl resize-none border-2 focus:border-teal-500"
                                        disabled={atsScansLeft === 0}
                                    />
                                    <Button 
                                        onClick={handleATSScan} 
                                        disabled={isScanning || !jobDescription || atsScansLeft === 0}
                                        className={`w-full rounded-2xl h-12 text-lg font-bold gap-2 ${
                                            atsScansLeft === 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                                        }`}
                                    >
                                        {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}
                                        {isScanning ? 'Analyzing Resume...' : atsScansLeft === 0 ? 'Daily Limit Reached' : 'Analyze Match Score'}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {atsResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className={`rounded-2xl p-6 text-center ${atsResult.score >= 70 ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : atsResult.score >= 40 ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200'} border`}>
                                                    <div className="text-sm font-semibold text-muted-foreground mb-2">ATS Score</div>
                                                    <div className={`text-6xl font-black ${atsResult.score >= 70 ? 'text-green-600' : atsResult.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {atsResult.score}%
                                                    </div>
                                                    <Badge className="mt-3" variant={atsResult.matchLevel === 'High' ? 'default' : atsResult.matchLevel === 'Medium' ? 'secondary' : 'destructive'}>
                                                        {atsResult.matchLevel} Match
                                                    </Badge>
                                                </div>

                                                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-2xl p-6">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                                        <h3 className="font-semibold">Missing Keywords</h3>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(atsResult.missingKeywords || []).map(kw => (
                                                            <span key={kw} className="bg-white dark:bg-gray-800 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                        {(atsResult.missingKeywords || []).length === 0 && (
                                                            <p className="text-sm text-green-600">✨ Great! No missing keywords detected.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Sparkles className="h-5 w-5 text-teal-500" />
                                                    <h3 className="font-semibold">Improvement Suggestions</h3>
                                                </div>
                                                <ul className="space-y-3">
                                                    {(atsResult.suggestions || []).map((s, i) => (
                                                        <motion.li
                                                            key={i}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex gap-2 text-sm text-muted-foreground"
                                                        >
                                                            <span className="text-teal-500 font-bold">•</span>
                                                            {s}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 7: Preview */}
                    {step === 7 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-teal-500" />
                                    Resume Preview
                                </CardTitle>
                                <CardDescription>Review your professional resume</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Preview Card */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner max-h-[70vh] overflow-y-auto">
                                    <div className="p-8">
                                        <div className={`border-b-2 border-teal-500 pb-4 mb-5`}>
                                            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase">{userName}</h1>
                                            <p className="text-sm text-muted-foreground mt-1 font-medium">{resume.profession === 'Other' ? customProfession : resume.profession}</p>
                                            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                                                {resume.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {resume.email}</span>}
                                                {resume.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {resume.phone}</span>}
                                                {resume.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {resume.location}</span>}
                                                {resume.linkedIn && <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> {resume.linkedIn}</span>}
                                                {resume.github && <span className="flex items-center gap-1"><Github className="h-3 w-3" /> {resume.github}</span>}
                                            </div>
                                        </div>

                                        {resume.summary && (
                                            <PreviewSection title="Professional Summary">
                                                <p className="text-sm text-muted-foreground leading-relaxed">{resume.summary}</p>
                                            </PreviewSection>
                                        )}

                                        {resume.experience.length > 0 && (
                                            <PreviewSection title="Work Experience">
                                                {resume.experience.map((e, i) => (
                                                    <div key={i} className="mb-4">
                                                        <div className="flex justify-between items-baseline flex-wrap gap-2">
                                                            <span className="font-semibold text-sm">{e.title}</span>
                                                            <span className="text-xs text-muted-foreground">{e.startDate} – {e.endDate || 'Present'}</span>
                                                        </div>
                                                        <p className="text-teal-600 dark:text-teal-400 text-sm">{e.company}{e.location ? `, ${e.location}` : ''}</p>
                                                        {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                                                    </div>
                                                ))}
                                            </PreviewSection>
                                        )}

                                        {resume.education.length > 0 && (
                                            <PreviewSection title="Education">
                                                {resume.education.map((e, i) => (
                                                    <div key={i} className="mb-3">
                                                        <div className="flex justify-between flex-wrap gap-2">
                                                            <span className="font-semibold text-sm">{e.degree}</span>
                                                            <span className="text-xs text-muted-foreground">{e.year}</span>
                                                        </div>
                                                        <p className="text-teal-600 dark:text-teal-400 text-sm">{e.institution}</p>
                                                        {e.grade && <p className="text-xs text-muted-foreground mt-1">Grade: {e.grade}</p>}
                                                    </div>
                                                ))}
                                            </PreviewSection>
                                        )}

                                        {resume.skills.length > 0 && (
                                            <PreviewSection title="Skills">
                                                <div className="flex flex-wrap gap-2">
                                                    {resume.skills.map((s, i) => (
                                                        <span key={i} className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </PreviewSection>
                                        )}

                                        {selectedCerts.length > 0 && (
                                            <PreviewSection title="Certifications">
                                                {selectedCerts.map((c, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm mb-2">
                                                        <span className="flex items-center gap-1"><Award className="h-3 w-3 text-yellow-500" /> {c.courseName}</span>
                                                        <span className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString('en-IN') : ''}</span>
                                                    </div>
                                                ))}
                                            </PreviewSection>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2 rounded-full px-6">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                        {saving ? 'Saving...' : 'Save Resume'}
                                    </Button>
                                    <Button onClick={handleDownload} disabled={downloading} className="gap-2 rounded-full px-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {downloading ? 'Generating PDF...' : 'Download PDF'}
                                    </Button>
                                    <Button onClick={handleShare} variant="secondary" className="gap-2 rounded-full px-6">
                                        <Share2 className="h-4 w-4" /> Share Resume
                                    </Button>
                                </div>

                                {/* Share info */}
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                                    <Link2 className="h-3 w-3" />
                                    <span>Share link: <span className="font-mono text-teal-600">{websiteURL}/resume/{uid}</span></span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Navigation Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between mt-8"
                >
                    <Button
                        variant="outline"
                        className="gap-2 rounded-full"
                        onClick={() => step > 1 && setStep(step - 1)}
                        disabled={step === 1}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>

                    <div className="flex items-center gap-2">
                        {STEPS.map(s => (
                            <div
                                key={s.id}
                                className={`h-2 w-2 rounded-full transition-all ${step >= s.id ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    {step < STEPS.length ? (
                        <Button className="gap-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700" onClick={() => setStep(step + 1)}>
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="gap-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                            {saving ? 'Saving...' : 'Save & Finish'}
                        </Button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// ─── Preview Section ──────────────────────────────────────────────────────────
const PreviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 border-b border-teal-200 dark:border-teal-800 pb-2 mb-3">
            {title}
        </h3>
        {children}
    </div>
);

export default ResumeBuilder;