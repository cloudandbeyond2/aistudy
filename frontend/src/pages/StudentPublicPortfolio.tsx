import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Award, Github, Linkedin, Globe, MapPin, Mail, FolderOpen, ExternalLink, Briefcase, CheckCircle, FileText } from 'lucide-react';
import SEO from '@/components/SEO';

const StudentPublicPortfolio = () => {
    const { studentId } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (studentId) fetchPortfolio();
    }, [studentId]);

    const fetchPortfolio = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/career/public-portfolio/${studentId}`);
            if (res.data.success) setData(res.data);
            else setError(res.data.message || 'Portfolio not found');
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Portfolio unavailable');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                    <h1 className="text-xl font-bold mb-2">Portfolio Unavailable</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    const { user, resume, profile, projects, certifications } = data;
    const score = profile?.placementScore || 0;
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
            <SEO
                title={`${user?.name || 'Student'} — Portfolio`}
                description={`View the professional portfolio, projects, and skills of ${user?.name || 'this student'}.`}
            />

            {/* Hero */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-white">
                <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/40 shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{user?.name}</h1>
                        {(user?.profession || profile?.jobPreferences) && (
                            <p className="text-white/80 text-lg mt-1">{user?.profession || profile?.jobPreferences}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start">
                            {user?.city && (
                                <span className="flex items-center gap-1 text-white/70 text-sm">
                                    <MapPin className="w-3.5 h-3.5" /> {user.city}{user.country ? `, ${user.country}` : ''}
                                </span>
                            )}
                            {user?.email && (
                                <span className="flex items-center gap-1 text-white/70 text-sm">
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
                            {profile?.githubUrl && (
                                <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                    <Github className="w-4 h-4" />
                                </a>
                            )}
                            {profile?.linkedinUrl && (
                                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            )}
                            {profile?.portfolioUrl && (
                                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                    <Globe className="w-4 h-4" />
                                </a>
                            )}
                            {resume && (
                                <a href={`/resume/${studentId}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors">
                                    <FileText className="w-3.5 h-3.5" /> View Resume
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Score Badge */}
                    {score > 0 && (
                        <div className="shrink-0 text-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 border-4 flex flex-col items-center justify-center"
                                style={{ borderColor: scoreColor }}>
                                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}</span>
                                <span className="text-xs text-white/60">/ 100</span>
                            </div>
                            <p className="text-xs text-white/70 mt-1.5">Placement Score</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

                {/* Skills */}
                {profile?.skills?.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary" /> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill: string) => (
                                <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* About (Summary from Resume) */}
                {resume?.summary && (
                    <section>
                        <h2 className="text-lg font-bold mb-4">About</h2>
                        <p className="text-muted-foreground leading-relaxed">{resume.summary}</p>
                    </section>
                )}

                {/* Projects */}
                {projects?.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-primary" /> Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((p: any) => (
                                <div key={p._id} className="border rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                    {p.image ? (
                                        <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                                    ) : (
                                        <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-blue-100/50 dark:from-primary/20 dark:to-blue-900/20 flex items-center justify-center">
                                            <FolderOpen className="w-10 h-10 text-primary/30" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-1">{p.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                                        {p.techStack?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {p.techStack.map((t: string) => (
                                                    <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            {p.githubUrl && (
                                                <a href={p.githubUrl} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                    <Github className="w-4 h-4" /> Code
                                                </a>
                                            )}
                                            {p.liveUrl && (
                                                <a href={p.liveUrl} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1 text-sm text-primary hover:underline">
                                                    <ExternalLink className="w-4 h-4" /> Live Demo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {resume?.experience?.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4">Experience</h2>
                        <div className="space-y-4">
                            {resume.experience.map((exp: any, i: number) => (
                                <div key={i} className="pl-4 border-l-2 border-primary/30">
                                    <h3 className="font-semibold">{exp.title}</h3>
                                    <p className="text-sm text-primary">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                                    <p className="text-xs text-muted-foreground">{exp.startDate} – {exp.endDate}</p>
                                    {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {resume?.education?.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4">Education</h2>
                        <div className="space-y-3">
                            {resume.education.map((edu: any, i: number) => (
                                <div key={i} className="pl-4 border-l-2 border-primary/30">
                                    <h3 className="font-semibold">{edu.degree}</h3>
                                    <p className="text-sm text-primary">{edu.institution}</p>
                                    <p className="text-xs text-muted-foreground">{edu.year}{edu.grade ? ` · Grade: ${edu.grade}` : ''}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certificates */}
                {certifications?.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" /> Verified Certificates
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {certifications.map((c: any) => (
                                <div key={c._id} className="flex items-center gap-3 p-4 border rounded-xl bg-white dark:bg-slate-800 hover:shadow-sm transition-shadow">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                        <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{c.courseName}</p>
                                        <p className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString() : ''}</p>
                                    </div>
                                    <a href={`/verify-certificate?id=${c.certificateId}`} target="_blank" rel="noreferrer">
                                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="border-t py-6 text-center">
                <p className="text-xs text-muted-foreground">
                    Portfolio powered by <span className="font-semibold text-primary">Colossus IQ</span> Career Platform
                </p>
            </div>
        </div>
    );
};

export default StudentPublicPortfolio;
