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
    Brain, Lock
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

// ─── Profession options with enhanced metadata ───────────────────────────────
const PROFESSIONS = [
    { label: 'Software Developer', icon: Code, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20', suggestedSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'Git', 'CSS', 'HTML', 'REST API'] },
    { label: 'Data Scientist', icon: TrendingUp, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/20', suggestedSkills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization', 'Pandas', 'NumPy'] },
    { label: 'Product Manager', icon: Target, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-950/20', suggestedSkills: ['Agile', 'Scrum', 'Product Roadmap', 'User Research', 'Data Analysis', 'Stakeholder Management'] },
    { label: 'UI/UX Designer', icon: Zap, color: 'from-rose-500 to-orange-500', bg: 'bg-rose-50 dark:bg-rose-950/20', suggestedSkills: ['Figma', 'Adobe XD', 'Sketch', 'User Interface Design', 'User Experience', 'Prototyping', 'Wireframing'] },
    { label: 'DevOps Engineer', icon: Shield, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20', suggestedSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Jenkins', 'Terraform', 'Linux', 'Ansible'] },
    { label: 'Business Analyst', icon: Briefcase, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-950/20', suggestedSkills: ['Business Analysis', 'Requirement Gathering', 'Process Mapping', 'SQL', 'Excel', 'Problem Solving'] },
    { label: 'Digital Marketer', icon: Share2, color: 'from-red-500 to-pink-500', bg: 'bg-red-50 dark:bg-red-950/20', suggestedSkills: ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Google Analytics', 'Email Marketing', 'Copywriting'] },
    { label: 'Cybersecurity Analyst', icon: Shield, color: 'from-slate-500 to-gray-500', bg: 'bg-slate-50 dark:bg-slate-950/20', suggestedSkills: ['Network Security', 'Penetration Testing', 'Incident Response', 'Cryptography', 'SIEM', 'Compliance'] },
    { label: 'Cloud Architect', icon: Globe, color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50 dark:bg-sky-950/20', suggestedSkills: ['Cloud Infrastructure', 'AWS/Azure/GCP', 'Virtualization', 'Networking', 'Security', 'Disaster Recovery'] },
   { label: 'AI/ML Engineer', icon: Zap, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/20', suggestedSkills: ['Natural Language Processing', 'Computer Vision', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Neural Networks'] },
    { label: 'Full Stack Developer', icon: Code, color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/20', suggestedSkills: ['React', 'Node.js', 'Express', 'SQL/NoSQL', 'Frontend', 'Backend', 'DevOps', 'Mobile Apps'] },
    { label: 'Other', icon: User, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50 dark:bg-gray-800', suggestedSkills: [] },
];

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
                <div style={{ borderBottom: '3px solid #8b5cf6', paddingBottom: '20px', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#8b5cf6', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                                <p style={{ fontSize: '13px', color: '#8b5cf6', margin: '2px 0' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
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
                                <p style={{ fontSize: '13px', color: '#8b5cf6', margin: '2px 0' }}>{edu.institution}</p>
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
                                <span key={i} style={{ background: '#f3f4f6', color: '#8b5cf6', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: 500 }}>{s}</span>
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
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#8b5cf6', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
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
    const [selectedProfession, setSelectedProfession] = useState(null);
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
                    toast({ title: 'Scan Complete', description: 'Your resume has been analyzed.' });
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
                        toast({ title: 'Scan Complete', description: 'Your resume has been analyzed (recovered).' });
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="container max-w-6xl mx-auto py-8 px-4">
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
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                                <Button className="gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handleDownload} disabled={downloading}>
                                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Download PDF
                                </Button>
                            </div>
                        )}
                    </div>
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
                                        ? `bg-gradient-to-r ${professionColor} text-white shadow-lg` 
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
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-purple-500" />
                                    Choose Your Profession
                                </CardTitle>
                                <CardDescription>Select your career path to get personalized suggestions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {PROFESSIONS.map(p => {
                                        const Icon = p.icon;
                                        const isSelected = resume.profession === p.label;
                                        return (
                                            <motion.button
                                                key={p.label}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setField('profession', p.label)}
                                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isSelected
                                                    ? `border-purple-500 bg-gradient-to-br ${p.bg} shadow-lg`
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-md`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-center">{p.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                {resume.profession === 'Other' && (
                                    <div className="mt-6 space-y-2">
                                        <Label>Specify your profession</Label>
                                        <Input 
                                            value={customProfession} 
                                            onChange={e => setCustomProfession(e.target.value)} 
                                            placeholder="e.g. Technical Writer, Blockchain Developer..."
                                            className="rounded-xl"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Profile */}
                    {step === 2 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-purple-500" />
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
                                        <Input value={resume.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="rounded-xl" />
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
                                        <Label className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-500" /> Professional Summary</Label>
                                        <Button
                                            onClick={handleAISummary}
                                            disabled={generatingSummary}
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full"
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
                                    <Label className="flex items-center gap-2"><Zap className="h-4 w-4 text-purple-500" /> Skills</Label>
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
                                            <span key={s} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
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
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                                    <Sparkles className="h-3 w-3 text-purple-500" /> Suggested skills for {resume.profession}:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {uniqueSuggested.slice(0, 8).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setField('skills', [...resume.skills, s])}
                                                            className="text-xs bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
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
                                        <Briefcase className="h-5 w-5 text-purple-500" />
                                        Work Experience
                                    </CardTitle>
                                    <CardDescription>Showcase your professional journey</CardDescription>
                                </div>
                                <Button onClick={addExp} variant="outline" className="gap-2 rounded-full">
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
                                        <GraduationCap className="h-5 w-5 text-purple-500" />
                                        Education
                                    </CardTitle>
                                    <CardDescription>Your academic background</CardDescription>
                                </div>
                                <Button onClick={addEdu} variant="outline" className="gap-2 rounded-full">
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
                                    <Award className="h-5 w-5 text-purple-500" />
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
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
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
                                    <Search className="h-5 w-5 text-purple-500" />
                                    ATS Compatibility Scanner
                                </CardTitle>
                                <CardDescription>Optimize your resume for Applicant Tracking Systems</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Job Description</Label>
                                    <Textarea 
                                        value={jobDescription} 
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here to analyze how well your resume matches..."
                                        className="min-h-[200px] rounded-2xl resize-none border-2 focus:border-purple-500"
                                    />
                                    <Button 
                                        onClick={handleATSScan} 
                                        disabled={isScanning || !jobDescription}
                                        className="w-full rounded-2xl h-12 text-lg font-bold gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Target className="h-5 w-5" />}
                                        {isScanning ? 'Analyzing Resume...' : 'Analyze Match Score'}
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

                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6">
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
                                                    <Sparkles className="h-5 w-5 text-purple-500" />
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
                                                            <span className="text-purple-500 font-bold">•</span>
                                                            {s}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 7: Preview */}
                    {step === 7 && (
                        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-purple-500" />
                                    Resume Preview
                                </CardTitle>
                                <CardDescription>Review your professional resume</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Preview Card */}
                                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner max-h-[70vh] overflow-y-auto">
                                    <div className="p-8">
                                        <div className={`border-b-2 border-purple-500 pb-4 mb-5`}>
                                            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase">{userName}</h1>
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
                                                        <p className="text-purple-600 dark:text-purple-400 text-sm">{e.company}{e.location ? `, ${e.location}` : ''}</p>
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
                                                        <p className="text-purple-600 dark:text-purple-400 text-sm">{e.institution}</p>
                                                        {e.grade && <p className="text-xs text-muted-foreground mt-1">Grade: {e.grade}</p>}
                                                    </div>
                                                ))}
                                            </PreviewSection>
                                        )}

                                        {resume.skills.length > 0 && (
                                            <PreviewSection title="Skills">
                                                <div className="flex flex-wrap gap-2">
                                                    {resume.skills.map((s, i) => (
                                                        <span key={i} className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
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
                                    <Button onClick={handleDownload} disabled={downloading} className="gap-2 rounded-full px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
                                    <span>Share link: <span className="font-mono text-purple-600">{websiteURL}/resume/{uid}</span></span>
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
                                className={`h-2 w-2 rounded-full transition-all ${step >= s.id ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    {step < STEPS.length ? (
                        <Button className="gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={() => setStep(step + 1)}>
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handleSave} disabled={saving}>
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 border-b border-purple-200 dark:border-purple-800 pb-2 mb-3">
            {title}
        </h3>
        {children}
    </div>
);

export default ResumeBuilder;