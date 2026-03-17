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
    FileText, Briefcase, GraduationCap, Award, Eye, CheckCircle, Loader2, User, Link2, Sparkles, Search, Target, AlertCircle
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';


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

// ─── Profession options ───────────────────────────────────────────────────────
const PROFESSIONS = [
    { label: 'Software Developer', icon: '💻', suggestedSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'Git', 'CSS', 'HTML', 'REST API'] },
    { label: 'Data Scientist', icon: '📊', suggestedSkills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization', 'Pandas', 'NumPy'] },
    { label: 'Product Manager', icon: '🎯', suggestedSkills: ['Agile', 'Scrum', 'Product Roadmap', 'User Research', 'Data Analysis', 'Stakeholder Management'] },
    { label: 'UI/UX Designer', icon: '🎨', suggestedSkills: ['Figma', 'Adobe XD', 'Sketch', 'User Interface Design', 'User Experience', 'Prototyping', 'Wireframing'] },
    { label: 'DevOps Engineer', icon: '⚙️', suggestedSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Jenkins', 'Terraform', 'Linux', 'Ansible'] },
    { label: 'Business Analyst', icon: '📈', suggestedSkills: ['Business Analysis', 'Requirement Gathering', 'Process Mapping', 'SQL', 'Excel', 'Problem Solving'] },
    { label: 'Digital Marketer', icon: '📣', suggestedSkills: ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Google Analytics', 'Email Marketing', 'Copywriting'] },
    { label: 'Cybersecurity Analyst', icon: '🔐', suggestedSkills: ['Network Security', 'Penetration Testing', 'Incident Response', 'Cryptography', 'SIEM', 'Compliance'] },
    { label: 'Cloud Architect', icon: '☁️', suggestedSkills: ['Cloud Infrastructure', 'AWS/Azure/GCP', 'Virtualization', 'Networking', 'Security', 'Disaster Recovery'] },
    { label: 'AI/ML Engineer', icon: '🤖', suggestedSkills: ['Natural Language Processing', 'Computer Vision', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Neural Networks'] },
    { label: 'Full Stack Developer', icon: '🌐', suggestedSkills: ['React', 'Node.js', 'Express', 'SQL/NoSQL', 'Frontend', 'Backend', 'DevOps', 'Mobile Apps'] },
    { label: 'Other', icon: '🧑‍💼', suggestedSkills: [] },
];

const STEPS = [
    { id: 1, label: 'Profession', icon: Briefcase },
    { id: 2, label: 'Profile', icon: User },
    { id: 3, label: 'Experience', icon: Briefcase },
    { id: 4, label: 'Education', icon: GraduationCap },
    { id: 5, label: 'Certifications', icon: Award },
    { id: 6, label: 'ATS Scanner', icon: Search },
    { id: 7, label: 'Preview', icon: Eye },
];

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
                    fontFamily: 'Georgia, serif', padding: '60px 72px', boxSizing: 'border-box',
                    position: 'absolute', top: '-9999px', left: '-9999px'
                }}
            >
                {/* Header */}
                <div style={{ borderBottom: '3px solid #1a56db', paddingBottom: '18px', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a56db', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {userName}
                    </h1>
                    <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 8px', fontStyle: 'italic' }}>
                        {resume.profession}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: '#444' }}>
                        {resume.email && <span>✉ {resume.email}</span>}
                        {resume.phone && <span>📞 {resume.phone}</span>}
                        {resume.location && <span>📍 {resume.location}</span>}
                        {resume.linkedIn && <span>in: {resume.linkedIn}</span>}
                        {resume.github && <span>⌥ {resume.github}</span>}
                        {resume.website && <span>🌐 {resume.website}</span>}
                    </div>
                </div>

                {/* Summary */}
                {resume.summary && (
                    <Section title="Professional Summary">
                        <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#333' }}>{resume.summary}</p>
                    </Section>
                )}

                {/* Experience */}
                {resume.experience.length > 0 && (
                    <Section title="Work Experience">
                        {resume.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <strong style={{ fontSize: '14px' }}>{exp.title}</strong>
                                    <span style={{ fontSize: '11px', color: '#666' }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#1a56db', margin: '2px 0' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                {exp.description && <p style={{ fontSize: '12px', color: '#444', marginTop: '4px', lineHeight: '1.6' }}>{exp.description}</p>}
                            </div>
                        ))}
                    </Section>
                )}

                {/* Education */}
                {resume.education.length > 0 && (
                    <Section title="Education">
                        {resume.education.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong style={{ fontSize: '14px' }}>{edu.degree}</strong>
                                    <span style={{ fontSize: '11px', color: '#666' }}>{edu.year}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#1a56db', margin: '2px 0' }}>{edu.institution}</p>
                                {edu.grade && <p style={{ fontSize: '12px', color: '#555' }}>Grade/CGPA: {edu.grade}</p>}
                            </div>
                        ))}
                    </Section>
                )}

                {/* Skills */}
                {resume.skills.length > 0 && (
                    <Section title="Skills">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {resume.skills.map((s, i) => (
                                <span key={i} style={{ background: '#e8f0fe', color: '#1a56db', fontSize: '12px', padding: '3px 10px', borderRadius: '9999px' }}>{s}</span>
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
                                    <strong style={{ fontSize: '13px' }}>🏅 {c.courseName}</strong>
                                    <span style={{ fontSize: '11px', color: '#666' }}>{c.date ? new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : ''}</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>ID: {c.certificateId}</p>
                            </div>
                        ))}
                    </Section>
                )}
            </div>
        );
    }
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a56db', marginBottom: '10px', borderBottom: '1px solid #dde', paddingBottom: '4px' }}>
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4">
                <div className="text-6xl">🔒</div>
                <h2 className="text-2xl font-bold">Resume Builder is a Premium Feature</h2>
                <p className="text-muted-foreground max-w-md">
                    Upgrade to a paid plan to access the professional Resume Builder with PDF download and social sharing.
                </p>
                <Button asChild className="rounded-full px-8">
                    <a href="/dashboard/pricing">Upgrade Now</a>
                </Button>
            </div>
        );
    }

    // Fetch resume data and check access
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
                console.log('ATS Raw AI Response:', rawText);

                try {
                    const parsed = JSON.parse(rawText);
                    console.log('ATS Parsed Result:', parsed);

                    // Ensure score is a number between 0-100
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
                    // Fallback for manual extraction if JSON mode fails (unlikely with schema)
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

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
            heightLeft -= pageH;

            // Add additional pages if content remains
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
            text: `Check out ${userName}'s professional resume built with AiStudy!`,
            url: shareUrl,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: '🔗 Link Copied!', description: 'Resume link copied to clipboard. Share it on LinkedIn, WhatsApp or Twitter!' });
        }
    };

    // ── Render ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const selectedCerts = allCerts.filter(c => resume.selectedCertificateIds.includes(c.certificateId));

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            {/* Hidden print element */}
            <ResumePrint ref={printRef} resume={resume} userName={userName} certs={allCerts} />

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                        Resume Builder
                    </h1>
                    <p className="text-muted-foreground mt-1">Build your professional resume in minutes</p>
                </div>
                {step === 7 && (
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 rounded-full" onClick={handleShare}>
                            <Share2 className="h-4 w-4" /> Share
                        </Button>
                        <Button className="gap-2 rounded-full" onClick={handleDownload} disabled={downloading}>
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {STEPS.map((s, idx) => {
                    const Icon = s.icon;
                    const active = step === s.id;
                    const done = step > s.id;
                    return (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => setStep(s.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                  ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : done ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                            >
                                {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                {s.label}
                            </button>
                            {idx < STEPS.length - 1 && <div className="h-px w-4 bg-border flex-shrink-0" />}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-sm">

                {/* Step 1: Profession */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-primary" /> Select Your Profession</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {PROFESSIONS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => setField('profession', p.label)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-medium text-sm
                    ${resume.profession === p.label ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 hover:bg-muted'}`}
                                >
                                    <span className="text-2xl">{p.icon}</span>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {resume.profession === 'Other' && (
                            <div className="space-y-2">
                                <Label>Specify your profession</Label>
                                <Input value={customProfession} onChange={e => setCustomProfession(e.target.value)} placeholder="e.g. Technical Writer" className="rounded-xl" />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Profile */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-primary" /> Profile Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Full Name" value={userName} readOnly onChange={() => { }} placeholder="Your name" />
                            <FormField label="Email" value={resume.email} onChange={v => setField('email', v)} placeholder="you@email.com" />
                            <FormField label="Phone" value={resume.phone} onChange={v => setField('phone', v)} placeholder="+91 XXXXX XXXXX" />
                            <FormField label="Location" value={resume.location} onChange={v => setField('location', v)} placeholder="City, Country" />
                            <FormField label="LinkedIn" value={resume.linkedIn} onChange={v => setField('linkedIn', v)} placeholder="linkedin.com/in/you" />
                            <FormField label="GitHub" value={resume.github} onChange={v => setField('github', v)} placeholder="github.com/you" />
                            <FormField label="Website / Portfolio" value={resume.website} onChange={v => setField('website', v)} placeholder="yoursite.com" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Professional Summary</Label>
                                <Button
                                    onClick={handleAISummary}
                                    disabled={generatingSummary}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5 rounded-full"
                                >
                                    {generatingSummary ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Generate
                                </Button>
                            </div>
                            <Textarea
                                value={resume.summary} rows={5}
                                onChange={e => setField('summary', e.target.value)}
                                placeholder="A brief summary about your professional background and goals..."
                                className="rounded-xl resize-none"
                            />
                        </div>
                        {/* Skills */}
                        <div className="space-y-4">
                            <Label>Skills</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="Add skill and press Enter"
                                    className="rounded-xl"
                                />
                                <Button onClick={addSkill} variant="outline" className="rounded-xl">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {resume.skills.map(s => (
                                    <span key={s} className="flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/20">
                                        {s}
                                        <button onClick={() => removeSkill(s)} className="hover:text-destructive transition-colors">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Suggested Skills */}
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-primary" /> Suggested based on profession & certificates:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const prof = PROFESSIONS.find(p => p.label === resume.profession);
                                        const suggested = [...(prof?.suggestedSkills || [])];

                                        allCerts.forEach(c => {
                                            const name = c.courseName.toLowerCase();
                                            if (name.includes('react')) suggested.push('React.js');
                                            if (name.includes('node')) suggested.push('Node.js');
                                            if (name.includes('python')) suggested.push('Python');
                                            if (name.includes('java')) suggested.push('Java');
                                            if (name.includes('javascript')) suggested.push('JavaScript');
                                            if (name.includes('aws')) suggested.push('AWS');
                                            if (name.includes('mongo')) suggested.push('MongoDB');
                                            if (name.includes('sql')) suggested.push('SQL');
                                            if (name.includes('machine learning')) suggested.push('Machine Learning');
                                            if (name.includes('ai')) suggested.push('Artificial Intelligence');
                                        });

                                        const uniqueSuggested = Array.from(new Set(suggested)).filter(s => !resume.skills.includes(s));

                                        return uniqueSuggested.length > 0 ? uniqueSuggested.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setField('skills', [...resume.skills, s])}
                                                className="text-xs bg-background hover:bg-primary/10 hover:border-primary/50 transition-all px-3 py-1.5 rounded-lg border border-border/50 shadow-sm"
                                            >
                                                + {s}
                                            </button>
                                        )) : <p className="text-xs text-muted-foreground italic">No suggestions available for this profession.</p>;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Experience */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-primary" /> Work Experience</h2>
                            <Button onClick={addExp} variant="outline" className="gap-2 rounded-full" size="sm"><Plus className="h-4 w-4" /> Add</Button>
                        </div>
                        {resume.experience.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No experience added yet. Click "Add" to get started.</p>
                            </div>
                        )}
                        {resume.experience.map((exp, i) => (
                            <div key={i} className="border border-border/60 rounded-2xl p-5 space-y-4 relative">
                                <button onClick={() => removeExp(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Job Title" value={exp.title} onChange={v => updateExp(i, 'title', v)} placeholder="e.g. Senior Developer" />
                                    <FormField label="Company" value={exp.company} onChange={v => updateExp(i, 'company', v)} placeholder="e.g. Google Inc." />
                                    <FormField label="Location" value={exp.location} onChange={v => updateExp(i, 'location', v)} placeholder="e.g. Bangalore, India" />
                                    <FormField label="Start Date" value={exp.startDate} onChange={v => updateExp(i, 'startDate', v)} placeholder="e.g. Jan 2022" />
                                    <FormField label="End Date" value={exp.endDate} onChange={v => updateExp(i, 'endDate', v)} placeholder="e.g. Dec 2023 or Present" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea value={exp.description} rows={3} onChange={e => updateExp(i, 'description', e.target.value)}
                                        placeholder="Key responsibilities and achievements..." className="rounded-xl resize-none" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 4: Education */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="text-primary" /> Education</h2>
                            <Button onClick={addEdu} variant="outline" className="gap-2 rounded-full" size="sm"><Plus className="h-4 w-4" /> Add</Button>
                        </div>
                        {resume.education.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No education added yet. Click "Add" to get started.</p>
                            </div>
                        )}
                        {resume.education.map((edu, i) => (
                            <div key={i} className="border border-border/60 rounded-2xl p-5 space-y-4 relative">
                                <button onClick={() => removeEdu(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Degree / Certificate" value={edu.degree} onChange={v => updateEdu(i, 'degree', v)} placeholder="e.g. B.Tech Computer Science" />
                                    <FormField label="Institution" value={edu.institution} onChange={v => updateEdu(i, 'institution', v)} placeholder="e.g. IIT Madras" />
                                    <FormField label="Year" value={edu.year} onChange={v => updateEdu(i, 'year', v)} placeholder="e.g. 2020 or 2018–2022" />
                                    <FormField label="Grade / CGPA" value={edu.grade} onChange={v => updateEdu(i, 'grade', v)} placeholder="e.g. 8.5/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 5: Certifications */}
                {step === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Award className="text-primary" /> Certifications</h2>
                        {allCerts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>You haven't earned any certificates through this platform yet.</p>
                                <p className="text-sm mt-1">Complete a course to earn your certificate!</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">Select the certificates you want to include in your resume:</p>
                                <div className="space-y-3">
                                    {allCerts.map(c => (
                                        <div key={c.certificateId} className="flex items-center gap-4 p-4 border border-border/60 rounded-xl hover:bg-muted/40 transition">
                                            <Checkbox
                                                id={c.certificateId}
                                                checked={resume.selectedCertificateIds.includes(c.certificateId)}
                                                onCheckedChange={() => toggleCert(c.certificateId)}
                                            />
                                            <label htmlFor={c.certificateId} className="flex-1 cursor-pointer">
                                                <p className="font-semibold text-sm">{c.courseName}</p>
                                                <p className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}</p>
                                            </label>
                                            <Award className="h-5 w-5 text-yellow-500" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Step 6: ATS Scanner */}
                {step === 6 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Target className="text-primary" /> ATS Analysis</h2>
                            <Badge variant="outline" className="text-xs">AI Powered</Badge>
                        </div>
                        
                        <div className="space-y-4">
                            <Label>Job Description</Label>
                            <Textarea 
                                value={jobDescription} 
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to analyze how well your resume matches..."
                                className="min-h-[200px] rounded-2xl resize-none border-primary/20 focus:border-primary shadow-inner"
                            />
                            <Button 
                                onClick={handleATSScan} 
                                disabled={isScanning || !jobDescription}
                                className="w-full rounded-2xl h-12 text-lg font-bold gap-2 shadow-lg shadow-primary/20"
                            >
                                {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                                {isScanning ? 'Analyzing Resume...' : 'Analyze Match Score'}
                            </Button>
                        </div>

                        {atsResult && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-primary/5 rounded-3xl p-6 flex flex-col items-center justify-center border border-primary/10">
                                        <div className="text-sm font-semibold text-muted-foreground mb-2">ATS Score</div>
                                        <div className={`text-5xl font-black ${atsResult.score > 70 ? 'text-green-500' : atsResult.score > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                            {atsResult.score}%
                                        </div>
                                        <Badge className="mt-2" variant={atsResult.matchLevel === 'High' ? 'default' : atsResult.matchLevel === 'Medium' ? 'secondary' : 'destructive'}>
                                            {atsResult.matchLevel} Match
                                        </Badge>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <div className="bg-card border border-border/60 rounded-3xl p-6">
                                            <h3 className="font-bold flex items-center gap-2 mb-3">
                                                <AlertCircle className="h-4 w-4 text-amber-500" /> Missing Keywords
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(atsResult.missingKeywords || []).map(kw => (
                                                    <span key={kw} className="bg-muted text-xs px-3 py-1 rounded-full border border-border/40">
                                                        {kw}
                                                    </span>
                                                ))}
                                                {(atsResult.missingKeywords || []).length === 0 && <p className="text-sm text-muted-foreground italic">None found. Great job!</p>}
                                            </div>
                                        </div>

                                        <div className="bg-card border border-border/60 rounded-3xl p-6">
                                            <h3 className="font-bold flex items-center gap-2 mb-3">
                                                <Sparkles className="h-4 w-4 text-primary" /> Improvement Suggestions
                                            </h3>
                                            <ul className="text-sm space-y-2 text-muted-foreground">
                                                {(atsResult.suggestions || []).map((s, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="text-primary font-bold">•</span>
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 7: Preview */}
                {step === 7 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Eye className="text-primary" /> Resume Preview</h2>

                        {/* Preview Card */}
                        <div className="border border-border rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-8 shadow-inner max-h-[75vh] overflow-y-auto">
                            <div className="border-b-2 border-blue-600 pb-4 mb-5">
                                <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-widest uppercase">{userName}</h1>
                                <p className="text-sm text-slate-500 italic">{resume.profession === 'Other' ? customProfession : resume.profession}</p>
                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                                    {resume.email && <span>✉ {resume.email}</span>}
                                    {resume.phone && <span>📞 {resume.phone}</span>}
                                    {resume.location && <span>📍 {resume.location}</span>}
                                    {resume.linkedIn && <span>in {resume.linkedIn}</span>}
                                    {resume.github && <span>⌥ {resume.github}</span>}
                                </div>
                            </div>

                            {resume.summary && <PreviewSection title="Summary"><p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{resume.summary}</p></PreviewSection>}

                            {resume.experience.length > 0 && (
                                <PreviewSection title="Work Experience">
                                    {resume.experience.map((e, i) => (
                                        <div key={i} className="mb-3">
                                            <div className="flex justify-between"><span className="font-semibold text-sm">{e.title}</span><span className="text-xs text-slate-500">{e.startDate} – {e.endDate || 'Present'}</span></div>
                                            <p className="text-blue-600 dark:text-blue-400 text-sm">{e.company}{e.location ? `, ${e.location}` : ''}</p>
                                            {e.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{e.description}</p>}
                                        </div>
                                    ))}
                                </PreviewSection>
                            )}

                            {resume.education.length > 0 && (
                                <PreviewSection title="Education">
                                    {resume.education.map((e, i) => (
                                        <div key={i} className="mb-3">
                                            <div className="flex justify-between"><span className="font-semibold text-sm">{e.degree}</span><span className="text-xs text-slate-500">{e.year}</span></div>
                                            <p className="text-blue-600 dark:text-blue-400 text-sm">{e.institution}</p>
                                        </div>
                                    ))}
                                </PreviewSection>
                            )}

                            {resume.skills.length > 0 && (
                                <PreviewSection title="Skills">
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((s, i) => <span key={i} className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full">{s}</span>)}
                                    </div>
                                </PreviewSection>
                            )}

                            {selectedCerts.length > 0 && (
                                <PreviewSection title="Certifications">
                                    {selectedCerts.map((c, i) => (
                                        <div key={i} className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-1"><Award className="h-3 w-3 text-yellow-500" />{c.courseName}</span>
                                            <span className="text-xs text-slate-500">{c.date ? new Date(c.date).toLocaleDateString('en-IN') : ''}</span>
                                        </div>
                                    ))}
                                </PreviewSection>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2 rounded-full px-6">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                {saving ? 'Saving...' : 'Save Resume'}
                            </Button>
                            <Button onClick={handleDownload} disabled={downloading} className="gap-2 rounded-full px-6">
                                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                {downloading ? 'Generating PDF...' : 'Download PDF'}
                            </Button>
                            <Button onClick={handleShare} variant="secondary" className="gap-2 rounded-full px-6">
                                <Share2 className="h-4 w-4" /> Share Resume
                            </Button>
                        </div>

                        {/* Share info */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                            <Link2 className="h-3 w-3" />
                            <span>Share link: <span className="font-mono">{websiteURL}/resume/{uid}</span></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline" className="gap-2 rounded-full"
                    onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </Button>

                <span className="text-sm text-muted-foreground">Step {step} of {STEPS.length}</span>

                {step < STEPS.length ? (
                    <Button className="gap-2 rounded-full" onClick={() => setStep(step + 1)}>
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="gap-2 rounded-full" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        {saving ? 'Saving...' : 'Save & Finish'}
                    </Button>
                )}
            </div>
        </div >
    );
};

// ─── Preview Section ──────────────────────────────────────────────────────────
const PreviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-900 pb-1 mb-3">{title}</h3>
        {children}
    </div>
);

// ─── FormField Helper ─────────────────────────────────────────────────────────
const FormField = ({ label, value, onChange, placeholder, readOnly = false }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; readOnly?: boolean;
}) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`rounded-xl ${readOnly ? 'bg-muted cursor-default' : ''}`}
        />
    </div>
);

export default ResumeBuilder;
