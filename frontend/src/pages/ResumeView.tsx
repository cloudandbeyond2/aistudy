// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Award, Loader2, Briefcase, GraduationCap, Mail, Phone, MapPin, Globe, Github, Linkedin, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResumeView = () => {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        axios.get(`${serverURL}/api/resume/${userId}`)
            .then(res => {
                if (res.data.success) setData(res.data);
                else setNotFound(true);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleDownload = async () => {
        const el = document.getElementById('public-resume');
        if (!el) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
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

            pdf.save(`${data?.resume?.userName || 'Resume'}_Resume.pdf`);
        } catch (err) {
            toast({ title: 'PDF error', description: 'Could not generate PDF.', variant: 'destructive' });
        } finally { setDownloading(false); }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: `${data?.resume?.userName}'s Resume`, url }); } catch { }
        } else {
            await navigator.clipboard.writeText(url);
            toast({ title: '🔗 Link Copied!', description: 'Resume link copied to clipboard.' });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );

    if (notFound) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
            <div className="text-5xl">📄</div>
            <h1 className="text-2xl font-bold">Resume Not Found</h1>
            <p className="text-slate-500">This resume doesn't exist or hasn't been published yet.</p>
            <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
    );

    const { resume, userName } = data;
    const certs = data.certifications || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-10 px-4">
            <Toaster />
            {/* Action bar */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
                <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    ← Back to Home
                </Link>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 rounded-full" onClick={handleShare}>
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button className="gap-2 rounded-full" onClick={handleDownload} disabled={downloading}>
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Resume Card */}
            <div id="public-resume" className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-10 py-10">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-wide">{userName}</h1>
                            <p className="text-blue-100 mt-1 text-base italic">{resume.profession}</p>
                        </div>
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold uppercase flex-shrink-0">
                            {userName?.charAt(0)}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-blue-100">
                        {resume.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{resume.email}</span>}
                        {resume.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{resume.phone}</span>}
                        {resume.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{resume.location}</span>}
                        {resume.linkedIn && <span className="flex items-center gap-1"><Linkedin className="h-3.5 w-3.5" />{resume.linkedIn}</span>}
                        {resume.github && <span className="flex items-center gap-1"><Github className="h-3.5 w-3.5" />{resume.github}</span>}
                        {resume.website && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{resume.website}</span>}
                    </div>
                </div>

                {/* Body */}
                <div className="px-10 py-8 space-y-8">
                    {/* Summary */}
                    {resume.summary && (
                        <Section title="Professional Summary" icon="📋">
                            <p className="text-slate-600 leading-relaxed text-sm">{resume.summary}</p>
                        </Section>
                    )}

                    {/* Experience */}
                    {resume.experience?.length > 0 && (
                        <Section title="Work Experience" icon={<Briefcase className="h-4 w-4" />}>
                            {resume.experience.map((exp: any, i: number) => (
                                <div key={i} className="mb-5">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-800 text-base">{exp.title}</h4>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{exp.startDate} – {exp.endDate || 'Present'}</span>
                                    </div>
                                    <p className="text-blue-600 text-sm font-medium">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                                    {exp.description && <p className="text-slate-500 text-sm mt-1 leading-relaxed">{exp.description}</p>}
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Education */}
                    {resume.education?.length > 0 && (
                        <Section title="Education" icon={<GraduationCap className="h-4 w-4" />}>
                            {resume.education.map((edu: any, i: number) => (
                                <div key={i} className="mb-4">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-800 text-base">{edu.degree}</h4>
                                        <span className="text-xs text-slate-400">{edu.year}</span>
                                    </div>
                                    <p className="text-blue-600 text-sm font-medium">{edu.institution}</p>
                                    {edu.grade && <p className="text-slate-500 text-xs mt-0.5">Grade/CGPA: {edu.grade}</p>}
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Skills */}
                    {resume.skills?.length > 0 && (
                        <Section title="Skills" icon="🛠️">
                            <div className="flex flex-wrap gap-2">
                                {resume.skills.map((s: string, i: number) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-100">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Certifications */}
                    {certs.length > 0 && (
                        <Section title="Certifications" icon={<Award className="h-4 w-4" />}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {certs.map((c: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl hover:shadow-md transition-shadow">
                                        <Award className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-sm text-slate-700">{c.courseName}</p>
                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                {c.date && <p className="text-[10px] text-slate-400 font-medium">{new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>}
                                                <p className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {c.certificateId}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-10 py-4 flex justify-between items-center">
                    <p className="text-xs text-slate-400">Built with AiStudy Resume Builder</p>
                    <p className="text-xs text-slate-400">{new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div>
        <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-600">{typeof icon === 'string' ? icon : icon}</span>
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent ml-2" />
        </div>
        {children}
    </div>
);

export default ResumeView;
