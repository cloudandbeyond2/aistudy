// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
    X, Mail, Phone, MapPin, Linkedin, Github, Globe, Zap, TrendingUp, Shield, Code,
    Lock, Palette, Type, AlignLeft, Sliders, ChevronDown, ChevronUp, RotateCcw,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

// ─── Types ────────────────────────────────────────────────────────────────────
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
interface ResumeStyle {
    accentColor: string; headingColor: string; textColor: string; bgColor: string;
    fontFamily: string; fontSize: number; paddingX: number; paddingY: number;
    lineHeight: number; borderStyle: 'solid' | 'dashed' | 'double' | 'none';
    headerLayout: 'left' | 'center'; skillStyle: 'pill' | 'badge' | 'plain';
    sectionSpacing: number;
}

const DEFAULT_STYLE: ResumeStyle = {
    accentColor: '#8b5cf6', headingColor: '#8b5cf6', textColor: '#111827', bgColor: '#ffffff',
    fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, paddingX: 72, paddingY: 60,
    lineHeight: 1.7, borderStyle: 'solid', headerLayout: 'left', skillStyle: 'pill', sectionSpacing: 24,
};

const COLOR_PRESETS = [
    { name: 'Violet',  accent: '#8b5cf6', heading: '#8b5cf6' },
    { name: 'Indigo',  accent: '#6366f1', heading: '#6366f1' },
    { name: 'Rose',    accent: '#f43f5e', heading: '#f43f5e' },
    { name: 'Emerald', accent: '#10b981', heading: '#10b981' },
    { name: 'Amber',   accent: '#f59e0b', heading: '#d97706' },
    { name: 'Sky',     accent: '#0ea5e9', heading: '#0ea5e9' },
    { name: 'Slate',   accent: '#475569', heading: '#1e293b' },
    { name: 'Black',   accent: '#000000', heading: '#000000' },
];

const FONT_OPTIONS = [
    { label: 'Inter',        value: 'Inter, system-ui, sans-serif' },
    { label: 'Georgia',      value: 'Georgia, serif' },
    { label: 'Garamond',     value: '"EB Garamond", Garamond, serif' },
    { label: 'Merriweather', value: '"Merriweather", serif' },
    { label: 'Montserrat',   value: '"Montserrat", sans-serif' },
    { label: 'Lato',         value: '"Lato", sans-serif' },
    { label: 'Playfair',     value: '"Playfair Display", serif' },
    { label: 'Courier',      value: '"Courier New", monospace' },
];

const PROFESSIONS = [
    { label: 'Software Developer',    icon: Code,        color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-50 dark:bg-blue-950/20',    suggestedSkills: ['JavaScript','React','Node.js','TypeScript','MongoDB','Git','CSS','HTML','REST API'] },
    { label: 'Data Scientist',        icon: TrendingUp,  color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/20',  suggestedSkills: ['Python','R','SQL','Machine Learning','Statistics','Data Visualization','Pandas','NumPy'] },
    { label: 'Product Manager',       icon: Target,      color: 'from-purple-500 to-pink-500',   bg: 'bg-purple-50 dark:bg-purple-950/20',suggestedSkills: ['Agile','Scrum','Product Roadmap','User Research','Data Analysis','Stakeholder Management'] },
    { label: 'UI/UX Designer',        icon: Zap,         color: 'from-rose-500 to-orange-500',   bg: 'bg-rose-50 dark:bg-rose-950/20',    suggestedSkills: ['Figma','Adobe XD','Sketch','User Interface Design','User Experience','Prototyping','Wireframing'] },
    { label: 'DevOps Engineer',       icon: Shield,      color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20',suggestedSkills: ['Docker','Kubernetes','AWS','CI/CD','Jenkins','Terraform','Linux','Ansible'] },
    { label: 'Business Analyst',      icon: Briefcase,   color: 'from-amber-500 to-yellow-500',  bg: 'bg-amber-50 dark:bg-amber-950/20',  suggestedSkills: ['Business Analysis','Requirement Gathering','Process Mapping','SQL','Excel','Problem Solving'] },
    { label: 'Digital Marketer',      icon: Share2,      color: 'from-red-500 to-pink-500',      bg: 'bg-red-50 dark:bg-red-950/20',      suggestedSkills: ['SEO','SEM','Content Marketing','Social Media','Google Analytics','Email Marketing','Copywriting'] },
    { label: 'Cybersecurity Analyst', icon: Shield,      color: 'from-slate-500 to-gray-500',    bg: 'bg-slate-50 dark:bg-slate-950/20',  suggestedSkills: ['Network Security','Penetration Testing','Incident Response','Cryptography','SIEM','Compliance'] },
    { label: 'Cloud Architect',       icon: Globe,       color: 'from-sky-500 to-blue-500',      bg: 'bg-sky-50 dark:bg-sky-950/20',      suggestedSkills: ['Cloud Infrastructure','AWS/Azure/GCP','Virtualization','Networking','Security','Disaster Recovery'] },
    { label: 'AI/ML Engineer',        icon: Zap,         color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/20',suggestedSkills: ['Natural Language Processing','Computer Vision','Deep Learning','PyTorch','TensorFlow','Neural Networks'] },
    { label: 'Full Stack Developer',  icon: Code,        color: 'from-teal-500 to-cyan-500',     bg: 'bg-teal-50 dark:bg-teal-950/20',    suggestedSkills: ['React','Node.js','Express','SQL/NoSQL','Frontend','Backend','DevOps','Mobile Apps'] },
    { label: 'Other',                 icon: User,        color: 'from-gray-500 to-gray-600',     bg: 'bg-gray-50 dark:bg-gray-800',       suggestedSkills: [] },
];

const STEPS = [
    { id: 1, label: 'Profession',     icon: Briefcase,     description: 'Choose your career path' },
    { id: 2, label: 'Profile',        icon: User,          description: 'Personal information' },
    { id: 3, label: 'Experience',     icon: Briefcase,     description: 'Work history' },
    { id: 4, label: 'Education',      icon: GraduationCap, description: 'Academic background' },
    { id: 5, label: 'Certifications', icon: Award,         description: 'Your achievements' },
    { id: 6, label: 'ATS Scanner',    icon: Search,        description: 'Optimize for jobs' },
    { id: 7, label: 'Preview',        icon: Eye,           description: 'Final review' },
];

const emptyExp = (): Experience => ({ title: '', company: '', location: '', startDate: '', endDate: '', description: '' });
const emptyEdu = (): Education => ({ degree: '', institution: '', year: '', grade: '' });

// ─── Mobile Step Selector ─────────────────────────────────────────────────────
const MobileStepSelector = ({ step, setStep, professionColor, accentColor }: {
    step: number; setStep: (n: number) => void; professionColor: string; accentColor: string;
}) => {
    const [open, setOpen] = useState(false);
    const current = STEPS.find(s => s.id === step)!;
    return (
        <div className="sm:hidden mb-4 relative z-20">
            <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-gray-900 shadow-sm gap-3" style={{ borderColor: `${accentColor}30` }}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${professionColor} text-white shadow-sm shrink-0`}>
                        <current.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-muted-foreground">Step {step} of {STEPS.length}</p>
                        <p className="text-sm font-semibold leading-tight">{current.label}</p>
                    </div>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 rounded-xl border bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
                        style={{ borderColor: `${accentColor}30` }}>
                        {STEPS.map(s => (
                            <button key={s.id} onClick={() => { setStep(s.id); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-800">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step >= s.id ? `bg-gradient-to-r ${professionColor} text-white` : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                    {step > s.id ? <CheckCircle className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                                </div>
                                <span className={`text-sm ${step === s.id ? 'font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
                                {step === s.id && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accentColor }} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Style Customization Panel ────────────────────────────────────────────────
const StylePanel = ({ style, onChange, onReset, onClose }: {
    style: ResumeStyle; onChange: (p: Partial<ResumeStyle>) => void; onReset: () => void; onClose?: () => void;
}) => {
    const [open, setOpen] = useState<string | null>('colors');

    const Accordion = ({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) => (
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-2">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                onClick={() => setOpen(open === id ? null : id)}>
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <Icon className="h-4 w-4" style={{ color: style.accentColor }} /> {title}
                </span>
                {open === id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            <AnimatePresence>
                {open === id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const ColorRow = ({ label, field }: { label: string; field: keyof ResumeStyle }) => (
        <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center justify-between">
                {label} <span className="font-mono text-xs">{style[field] as string}</span>
            </Label>
            <div className="flex items-center gap-2">
                <input type="color" value={style[field] as string} onChange={e => onChange({ [field]: e.target.value } as any)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                <input type="text" value={style[field] as string} maxLength={7} onChange={e => onChange({ [field]: e.target.value } as any)}
                    className="flex-1 text-xs font-mono border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-transparent" />
            </div>
        </div>
    );

    return (
        <div className="w-full lg:w-72 flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100svh - 200px)' }}>
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${style.accentColor}18, ${style.accentColor}06)` }}>
                <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" style={{ color: style.accentColor }} />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Customize Resume</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onReset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
                <Accordion id="colors" icon={Palette} title="Colors">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Quick Presets</p>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map(p => (
                                <button key={p.name} title={p.name} onClick={() => onChange({ accentColor: p.accent, headingColor: p.heading })}
                                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
                                    style={{ background: p.accent, borderColor: style.accentColor === p.accent ? '#fff' : 'transparent', boxShadow: style.accentColor === p.accent ? `0 0 0 2.5px ${p.accent}` : 'none' }} />
                            ))}
                        </div>
                    </div>
                    <ColorRow label="Accent / Border" field="accentColor" />
                    <ColorRow label="Heading Color"   field="headingColor" />
                    <ColorRow label="Body Text"       field="textColor" />
                    <ColorRow label="Background"      field="bgColor" />
                </Accordion>
                <Accordion id="typography" icon={Type} title="Typography">
                    <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Font Family</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {FONT_OPTIONS.map(f => (
                                <button key={f.value} onClick={() => onChange({ fontFamily: f.value })}
                                    className="text-xs px-2 py-2 rounded-lg border-2 transition-all text-left truncate"
                                    style={{ fontFamily: f.value, borderColor: style.fontFamily === f.value ? style.accentColor : '#e5e7eb', color: style.fontFamily === f.value ? style.accentColor : undefined, background: style.fontFamily === f.value ? `${style.accentColor}12` : undefined, fontWeight: style.fontFamily === f.value ? 600 : 400 }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                            Font Size <span className="font-semibold text-gray-700 dark:text-gray-200">{style.fontSize}px</span>
                        </Label>
                        <Slider min={10} max={16} step={0.5} value={[style.fontSize]} onValueChange={([v]) => onChange({ fontSize: v })} />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>10px</span><span>16px</span></div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                            Line Height <span className="font-semibold text-gray-700 dark:text-gray-200">{style.lineHeight.toFixed(1)}</span>
                        </Label>
                        <Slider min={1.2} max={2.2} step={0.1} value={[style.lineHeight]} onValueChange={([v]) => onChange({ lineHeight: v })} />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>Compact</span><span>Spacious</span></div>
                    </div>
                </Accordion>
                <Accordion id="spacing" icon={Sliders} title="Spacing & Layout">
                    {[
                        { label: 'Horizontal Padding', field: 'paddingX' as const, min: 24, max: 100, step: 4, unit: 'px', lo: 'Narrow', hi: 'Wide' },
                        { label: 'Vertical Padding',   field: 'paddingY' as const, min: 20, max: 80,  step: 4, unit: 'px', lo: 'Tight',  hi: 'Airy' },
                        { label: 'Section Spacing',    field: 'sectionSpacing' as const, min: 8, max: 48, step: 4, unit: 'px', lo: 'Dense', hi: 'Open' },
                    ].map(({ label, field, min, max, step, unit, lo, hi }) => (
                        <div key={field}>
                            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                                {label} <span className="font-semibold text-gray-700 dark:text-gray-200">{style[field]}{unit}</span>
                            </Label>
                            <Slider min={min} max={max} step={step} value={[style[field] as number]} onValueChange={([v]) => onChange({ [field]: v } as any)} />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>{lo}</span><span>{hi}</span></div>
                        </div>
                    ))}
                </Accordion>
                <Accordion id="options" icon={AlignLeft} title="Style Options">
                    <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Header Alignment</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['left', 'center'] as const).map(v => (
                                <button key={v} onClick={() => onChange({ headerLayout: v })}
                                    className="text-xs py-2 px-3 rounded-lg border-2 capitalize transition-all font-medium"
                                    style={style.headerLayout === v ? { borderColor: style.accentColor, color: style.accentColor, background: `${style.accentColor}12` } : { borderColor: '#e5e7eb' }}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Section Divider</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {(['solid', 'dashed', 'double', 'none'] as const).map(v => (
                                <button key={v} onClick={() => onChange({ borderStyle: v })}
                                    className="text-xs py-2 px-2 rounded-lg border-2 capitalize transition-all"
                                    style={style.borderStyle === v ? { borderColor: style.accentColor, color: style.accentColor, background: `${style.accentColor}12` } : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Skill Tag Style</Label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['pill', 'badge', 'plain'] as const).map(v => (
                                <button key={v} onClick={() => onChange({ skillStyle: v })}
                                    className="text-xs py-2 px-2 rounded-lg border-2 capitalize transition-all"
                                    style={style.skillStyle === v ? { borderColor: style.accentColor, color: style.accentColor, background: `${style.accentColor}12` } : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </Accordion>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: style.accentColor }} />
                <span className="text-xs text-gray-400">Live preview active</span>
            </div>
        </div>
    );
};

// ─── Hidden PDF Print Template ─────────────────────────────────────────────────
const ResumePrint = React.forwardRef<HTMLDivElement, {
    resume: ResumeData; userName: string; certs: Certificate[]; style: ResumeStyle; customProfession: string;
}>(({ resume, userName, certs, style, customProfession }, ref) => {
    const selectedCerts = certs.filter(c => resume.selectedCertificateIds.includes(c.certificateId));
    const profession = resume.profession === 'Other' ? customProfession : resume.profession;
    const sectionTitle: React.CSSProperties = {
        fontSize: `${style.fontSize - 1}px`, fontWeight: 'bold', textTransform: 'uppercase',
        letterSpacing: '1px', color: style.headingColor, marginBottom: '10px', paddingBottom: '6px',
        borderBottom: style.borderStyle !== 'none' ? `1px ${style.borderStyle} ${style.accentColor}40` : 'none',
    };
    const skillTag = (s: string): React.CSSProperties => style.skillStyle === 'pill'
        ? { background: `${style.accentColor}18`, color: style.accentColor, fontSize: `${style.fontSize - 2}px`, padding: '4px 12px', borderRadius: '20px', fontWeight: 500, border: `1px solid ${style.accentColor}30` }
        : style.skillStyle === 'badge'
        ? { background: `${style.accentColor}22`, color: style.accentColor, fontSize: `${style.fontSize - 2}px`, padding: '3px 8px', borderRadius: '4px', fontWeight: 600, border: `1px solid ${style.accentColor}50` }
        : { fontSize: `${style.fontSize - 2}px`, color: style.textColor, marginRight: '6px' };
    return (
        <div ref={ref} id="resume-print" style={{ width: '794px', background: style.bgColor, color: style.textColor, fontFamily: style.fontFamily, padding: `${style.paddingY}px ${style.paddingX}px`, boxSizing: 'border-box', position: 'absolute', top: '-9999px', left: '-9999px', lineHeight: style.lineHeight }}>
            <div style={{ borderBottom: style.borderStyle !== 'none' ? `3px ${style.borderStyle} ${style.accentColor}` : 'none', paddingBottom: '20px', marginBottom: '24px', textAlign: style.headerLayout }}>
                <h1 style={{ fontSize: `${style.fontSize + 18}px`, fontWeight: 'bold', margin: 0, color: style.headingColor, letterSpacing: '1px', textTransform: 'uppercase' }}>{userName}</h1>
                <p style={{ fontSize: `${style.fontSize + 1}px`, color: `${style.textColor}90`, margin: '4px 0 12px', fontWeight: 500 }}>{profession}</p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: `${style.fontSize - 1}px`, color: style.textColor, justifyContent: style.headerLayout === 'center' ? 'center' : 'flex-start' }}>
                    {resume.email && <span>📧 {resume.email}</span>}{resume.phone && <span>📱 {resume.phone}</span>}
                    {resume.location && <span>📍 {resume.location}</span>}{resume.linkedIn && <span>🔗 {resume.linkedIn}</span>}
                    {resume.github && <span>💻 {resume.github}</span>}{resume.website && <span>🌐 {resume.website}</span>}
                </div>
            </div>
            {resume.summary && <div style={{ marginBottom: `${style.sectionSpacing}px` }}><h2 style={sectionTitle}>Professional Summary</h2><p style={{ fontSize: `${style.fontSize}px`, lineHeight: style.lineHeight }}>{resume.summary}</p></div>}
            {resume.experience.length > 0 && <div style={{ marginBottom: `${style.sectionSpacing}px` }}><h2 style={sectionTitle}>Work Experience</h2>
                {resume.experience.map((e, i) => <div key={i} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: `${style.fontSize + 1}px` }}>{e.title}</strong><span style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}80` }}>{e.startDate} – {e.endDate || 'Present'}</span></div>
                    <p style={{ fontSize: `${style.fontSize}px`, color: style.accentColor, margin: '2px 0' }}>{e.company}{e.location ? `, ${e.location}` : ''}</p>
                    {e.description && <p style={{ fontSize: `${style.fontSize - 1}px`, color: `${style.textColor}bb`, lineHeight: style.lineHeight }}>{e.description}</p>}
                </div>)}
            </div>}
            {resume.education.length > 0 && <div style={{ marginBottom: `${style.sectionSpacing}px` }}><h2 style={sectionTitle}>Education</h2>
                {resume.education.map((e, i) => <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: `${style.fontSize + 1}px` }}>{e.degree}</strong><span style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}80` }}>{e.year}</span></div>
                    <p style={{ fontSize: `${style.fontSize}px`, color: style.accentColor, margin: '2px 0' }}>{e.institution}</p>
                    {e.grade && <p style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}80` }}>Grade: {e.grade}</p>}
                </div>)}
            </div>}
            {resume.skills.length > 0 && <div style={{ marginBottom: `${style.sectionSpacing}px` }}><h2 style={sectionTitle}>Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{resume.skills.map((s, i) => <span key={i} style={skillTag(s)}>{s}</span>)}</div>
            </div>}
            {selectedCerts.length > 0 && <div style={{ marginBottom: `${style.sectionSpacing}px` }}><h2 style={sectionTitle}>Certifications</h2>
                {selectedCerts.map((c, i) => <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: `${style.fontSize - 1}px` }}>🏅 {c.courseName}</strong>
                    <span style={{ fontSize: `${style.fontSize - 3}px`, color: `${style.textColor}80` }}>{c.date ? new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : ''}</span>
                </div>)}
            </div>}
        </div>
    );
});

// ─── Live Preview ──────────────────────────────────────────────────────────────
const LivePreview = ({ resume, userName, certs, style, customProfession }: {
    resume: ResumeData; userName: string; certs: Certificate[]; style: ResumeStyle; customProfession: string;
}) => {
    const selectedCerts = certs.filter(c => resume.selectedCertificateIds.includes(c.certificateId));
    const profession = resume.profession === 'Other' ? customProfession : resume.profession;
    const SectionHeading = ({ title }: { title: string }) => (
        <h2 style={{ fontSize: `${style.fontSize - 1}px`, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: style.headingColor, borderBottom: style.borderStyle !== 'none' ? `1px ${style.borderStyle} ${style.accentColor}35` : 'none', paddingBottom: '4px', marginBottom: '8px' }}>{title}</h2>
    );
    const SkillTag = ({ s }: { s: string }) => {
        if (style.skillStyle === 'pill') return <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ background: `${style.accentColor}15`, color: style.accentColor, borderColor: `${style.accentColor}30` }}>{s}</span>;
        if (style.skillStyle === 'badge') return <span className="text-xs font-semibold px-2 py-0.5 rounded border" style={{ background: `${style.accentColor}20`, color: style.accentColor, borderColor: `${style.accentColor}50` }}>{s}</span>;
        return <span className="text-xs mr-2" style={{ color: style.textColor }}>• {s}</span>;
    };
    const sc = Math.round(style.sectionSpacing * 0.6);
    return (
        <div className="rounded-xl overflow-auto shadow-inner border" style={{ maxHeight: '60vh', background: style.bgColor, borderColor: `${style.accentColor}30` }}>
            <div style={{ padding: `${Math.round(style.paddingY * 0.5)}px ${Math.round(style.paddingX * 0.5)}px`, fontFamily: style.fontFamily, color: style.textColor, lineHeight: style.lineHeight }}>
                <div style={{ borderBottom: style.borderStyle !== 'none' ? `2px ${style.borderStyle} ${style.accentColor}` : 'none', paddingBottom: '14px', marginBottom: '16px', textAlign: style.headerLayout }}>
                    <h1 style={{ fontSize: `${style.fontSize + 10}px`, fontWeight: 'bold', color: style.headingColor, textTransform: 'uppercase', margin: 0 }}>{userName || 'Your Name'}</h1>
                    <p style={{ fontSize: `${style.fontSize}px`, color: `${style.textColor}90`, margin: '3px 0 8px', fontWeight: 500 }}>{profession || 'Your Profession'}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}bb`, justifyContent: style.headerLayout === 'center' ? 'center' : 'flex-start' }}>
                        {resume.email && <span>📧 {resume.email}</span>}{resume.phone && <span>📱 {resume.phone}</span>}
                        {resume.location && <span>📍 {resume.location}</span>}{resume.linkedIn && <span>🔗 {resume.linkedIn}</span>}
                    </div>
                </div>
                {resume.summary && <div style={{ marginBottom: `${sc}px` }}><SectionHeading title="Professional Summary" /><p style={{ fontSize: `${style.fontSize}px`, lineHeight: style.lineHeight, color: `${style.textColor}cc` }}>{resume.summary}</p></div>}
                {resume.experience.length > 0 && <div style={{ marginBottom: `${sc}px` }}><SectionHeading title="Work Experience" />
                    {resume.experience.map((e, i) => <div key={i} className="mb-2">
                        <div className="flex flex-wrap justify-between gap-1"><span style={{ fontWeight: 600, fontSize: `${style.fontSize}px` }}>{e.title}</span><span style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}70` }}>{e.startDate}{e.startDate ? ` – ${e.endDate || 'Present'}` : ''}</span></div>
                        <p style={{ color: style.accentColor, fontSize: `${style.fontSize - 1}px` }}>{e.company}{e.location ? `, ${e.location}` : ''}</p>
                        {e.description && <p style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}99`, lineHeight: style.lineHeight }}>{e.description}</p>}
                    </div>)}
                </div>}
                {resume.education.length > 0 && <div style={{ marginBottom: `${sc}px` }}><SectionHeading title="Education" />
                    {resume.education.map((e, i) => <div key={i} className="mb-2">
                        <div className="flex flex-wrap justify-between gap-1"><span style={{ fontWeight: 600, fontSize: `${style.fontSize}px` }}>{e.degree}</span><span style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}70` }}>{e.year}</span></div>
                        <p style={{ color: style.accentColor, fontSize: `${style.fontSize - 1}px` }}>{e.institution}</p>
                        {e.grade && <p style={{ fontSize: `${style.fontSize - 2}px`, color: `${style.textColor}80` }}>Grade: {e.grade}</p>}
                    </div>)}
                </div>}
                {resume.skills.length > 0 && <div style={{ marginBottom: `${sc}px` }}><SectionHeading title="Skills" /><div className="flex flex-wrap gap-1.5">{resume.skills.map((s, i) => <SkillTag key={i} s={s} />)}</div></div>}
                {selectedCerts.length > 0 && <div><SectionHeading title="Certifications" />
                    {selectedCerts.map((c, i) => <div key={i} className="flex flex-wrap justify-between items-center mb-1.5 gap-1">
                        <span style={{ fontSize: `${style.fontSize - 1}px` }}>🏅 {c.courseName}</span>
                        <span style={{ fontSize: `${style.fontSize - 3}px`, color: `${style.textColor}80` }}>{c.date ? new Date(c.date).toLocaleDateString('en-IN') : ''}</span>
                    </div>)}
                </div>}
            </div>
        </div>
    );
};

// ─── PDF Toast ────────────────────────────────────────────────────────────────
const PDFToastNotification = ({ userName, onClose, onDownloadAgain, accentColor }: {
    userName: string; onClose: () => void; onDownloadAgain: () => void; accentColor: string;
}) => {
    const [progress, setProgress] = useState(100);
    const [exiting, setExiting] = useState(false);
    const handleClose = () => { setExiting(true); setTimeout(onClose, 350); };
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => { if (prev - 1.25 <= 0) { clearInterval(timer); handleClose(); return 0; } return prev - 1.25; });
        }, 100);
        return () => clearInterval(timer);
    }, []);
    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div initial={{ opacity: 0, y: 100, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] sm:w-[320px] rounded-2xl shadow-2xl overflow-hidden bg-white"
                    style={{ border: `1px solid ${accentColor}25`, boxShadow: `0 20px 60px ${accentColor}25, 0 4px 20px rgba(0,0,0,0.1)` }}>
                    <div className="h-[3px] w-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)`, transition: 'width 100ms linear' }} />
                    </div>
                    <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                            <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}>
                                <FileText className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                        <CheckCircle className="h-3 w-3 text-white" />
                                    </motion.div>
                                    <p className="text-sm font-semibold text-gray-900">PDF Downloaded!</p>
                                </div>
                                <p className="text-xs text-gray-400 font-mono truncate">{userName.replace(/ /g, '_')}_Resume.pdf</p>
                            </div>
                            <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"><X className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { handleClose(); setTimeout(onDownloadAgain, 400); }}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
                                <Download className="h-3 w-3" /> Download Again
                            </button>
                            <button onClick={handleClose} className="flex items-center justify-center text-xs font-medium py-2.5 px-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

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
    const [showPDFToast, setShowPDFToast] = useState(false);
    const [showStylePanel, setShowStylePanel] = useState(false);
    const [resumeStyle, setResumeStyle] = useState<ResumeStyle>(DEFAULT_STYLE);
    const printRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [atsResult, setAtsResult] = useState<{ score: number; missingKeywords: string[]; matchLevel: string; suggestions: string[]; } | null>(null);

    const [resume, setResume] = useState<ResumeData>({
        profession: sessionStorage.getItem('profession') || '', summary: '',
        phone: sessionStorage.getItem('phone') || '', email: sessionStorage.getItem('email') || '',
        location: [sessionStorage.getItem('city'), sessionStorage.getItem('country')].filter(Boolean).join(', '),
        linkedIn: '', github: '', website: '', skills: [], experience: [], education: [], selectedCertificateIds: [],
    });

    const isPaid = PAID.includes(userType);
    const isOrgUser = !!orgId;
    const updateStyle = useCallback((partial: Partial<ResumeStyle>) => setResumeStyle(prev => ({ ...prev, ...partial })), []);
    const resetStyle = useCallback(() => setResumeStyle(DEFAULT_STYLE), []);

    if (!isPaid && !isOrgUser) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto w-full">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Premium Feature</h2>
                    <p className="text-muted-foreground mb-6 text-sm sm:text-base px-2">Unlock the professional Resume Builder with AI-powered suggestions, ATS optimization, and beautiful templates.</p>
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-8 w-full sm:w-auto"><a href="/dashboard/pricing">Upgrade Now →</a></Button>
                </motion.div>
            </div>
        );
    }

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        const fetch = async () => {
            try {
                const settingsRes = await axios.get(`${serverURL}/api/settings`);
                if (settingsRes.data?.resumeEnabled) {
                    const es = settingsRes.data.resumeEnabled;
                    const isEnabled = userRole === 'org_admin' ? es.org_admin : userRole === 'student' ? es.student : es[userType] || false;
                    if (!isEnabled) { toast({ title: "Access Restricted", description: "Resume Builder is currently disabled.", variant: "destructive" }); navigate('/dashboard'); return; }
                }
                setUserName(sessionStorage.getItem('mName') || '');
                const res = await axios.get(`${serverURL}/api/resume/my/${uid}`, { headers: { 'x-user-id': uid } });
                if (res.data.success) {
                    setUserName(res.data.userName || sessionStorage.getItem('mName') || '');
                    setAllCerts(res.data.allCertifications || []);
                    const r = res.data.resume;
                    setResume(prev => ({ ...prev, profession: r.profession || prev.profession, summary: r.summary || '', phone: r.phone || prev.phone, email: r.email || prev.email, location: r.location || prev.location, linkedIn: r.linkedIn || '', github: r.github || '', website: r.website || '', skills: r.skills || [], experience: r.experience || [], education: r.education || [], selectedCertificateIds: r.selectedCertificateIds || [] }));
                    if (r.style) setResumeStyle({ ...DEFAULT_STYLE, ...r.style });
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, [uid, userRole, userType, navigate]);

    const setField = (f: keyof ResumeData, v: any) => setResume(p => ({ ...p, [f]: v }));
    const addExp = () => setResume(p => ({ ...p, experience: [...p.experience, emptyExp()] }));
    const removeExp = (i: number) => setResume(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
    const updateExp = (i: number, f: keyof Experience, v: string) => setResume(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
    const addEdu = () => setResume(p => ({ ...p, education: [...p.education, emptyEdu()] }));
    const removeEdu = (i: number) => setResume(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));
    const updateEdu = (i: number, f: keyof Education, v: string) => setResume(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
    const addSkill = () => { const s = skillInput.trim(); if (s && !resume.skills.includes(s)) { setField('skills', [...resume.skills, s]); setSkillInput(''); } };
    const removeSkill = (s: string) => setField('skills', resume.skills.filter(sk => sk !== s));
    const toggleCert = (id: string) => setField('selectedCertificateIds', resume.selectedCertificateIds.includes(id) ? resume.selectedCertificateIds.filter(x => x !== id) : [...resume.selectedCertificateIds, id]);

    const handleAISummary = async () => {
        if (!resume.profession) { toast({ title: 'Select Profession First', variant: 'destructive' }); return; }
        setGeneratingSummary(true);
        try {
            const res = await axios.post(`${serverURL}/api/prompt`, { prompt: `Create a professional 2-3 sentence resume summary for ${userName}, a ${resume.profession === 'Other' ? customProfession : resume.profession}. Return ONLY plain text.` });
            if (res.data?.generatedText) { setField('summary', res.data.generatedText.trim()); toast({ title: '✨ Summary Generated' }); }
        } catch (e: any) { toast({ title: 'AI Error', description: e?.response?.data?.message || 'Could not generate summary.', variant: 'destructive' }); }
        finally { setGeneratingSummary(false); }
    };

    const handleATSScan = async () => {
        if (!jobDescription) { toast({ title: 'Input Required', variant: 'destructive' }); return; }
        setIsScanning(true);
        try {
            const resumeText = [`Name: ${userName}`, `Skills: ${resume.skills.join(', ')}`, `Experience: ${resume.experience.map(e => `${e.title} at ${e.company}: ${e.description}`).join('; ')}`, `Education: ${resume.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}`].join('\n');
            const res = await axios.post(`${serverURL}/api/prompt`, { prompt: `Compare resume against job description.\n\nRESUME:\n${resumeText}\n\nJOB:\n${jobDescription}`, systemInstruction: 'You are an expert ATS analyzer. Respond ONLY with a valid JSON object.', responseMimeType: 'application/json', responseSchema: { type: 'object', properties: { score: { type: 'number' }, missingKeywords: { type: 'array', items: { type: 'string' } }, matchLevel: { type: 'string', enum: ['High', 'Medium', 'Low'] }, suggestions: { type: 'array', items: { type: 'string' } } }, required: ['score', 'missingKeywords', 'matchLevel', 'suggestions'] } });
            if (res.data?.generatedText) {
                try {
                    const p = JSON.parse(res.data.generatedText);
                    setAtsResult({ score: typeof p.score === 'number' ? p.score : parseInt(p.score) || 0, missingKeywords: p.missingKeywords || [], matchLevel: p.matchLevel || 'Low', suggestions: p.suggestions || [] });
                    toast({ title: 'Scan Complete' });
                } catch {
                    const m = res.data.generatedText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim().match(/\{[\s\S]*\}/);
                    if (m) { const p = JSON.parse(m[0]); setAtsResult({ score: parseInt(p.score) || 0, missingKeywords: p.missingKeywords || [], matchLevel: p.matchLevel || 'Low', suggestions: p.suggestions || [] }); }
                }
            }
        } catch { toast({ title: 'Scan Error', variant: 'destructive' }); }
        finally { setIsScanning(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.post(`${serverURL}/api/resume`, { userId: uid, ...resume, profession: resume.profession === 'Other' ? customProfession : resume.profession, style: resumeStyle }, { headers: { 'x-user-id': uid } });
            if (res.data.success) toast({ title: '✅ Resume Saved' });
        } catch (e: any) { toast({ title: 'Error saving', description: e?.response?.data?.message || 'Server error', variant: 'destructive' }); }
        finally { setSaving(false); }
    };

    const handleDownload = async () => {
        if (!printRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: resumeStyle.bgColor });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
            const imgW = pageW, imgH = (canvas.height * imgW) / canvas.width;
            let heightLeft = imgH, position = 0;
            pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH); heightLeft -= pageH;
            while (heightLeft > 0) { position = heightLeft - imgH; pdf.addPage(); pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH); heightLeft -= pageH; }
            pdf.save(`${userName.replace(/ /g, '_')}_Resume.pdf`);
            setShowPDFToast(true);
        } catch { toast({ title: 'PDF error', variant: 'destructive' }); }
        finally { setDownloading(false); }
    };

    const handleShare = async () => {
        const url = `${websiteURL}/resume/${uid}`;
        if (navigator.share) { try { await navigator.share({ title: `${userName}'s Resume`, url }); } catch { } }
        else { await navigator.clipboard.writeText(url); toast({ title: '🔗 Link Copied!' }); }
    };

    const currentProfession = PROFESSIONS.find(p => p.label === resume.profession);
    const professionColor = currentProfession?.color || 'from-purple-500 to-pink-500';

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-pink-500 border-b-purple-500 border-l-pink-500" />
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-500 animate-pulse" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="container max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
                <ResumePrint ref={printRef} resume={resume} userName={userName} certs={allCerts} style={resumeStyle} customProfession={customProfession} />

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-7">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Resume Builder</h1>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Create a professional resume that stands out</p>
                        </div>
                        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                            <Button variant={showStylePanel ? 'default' : 'outline'} size="sm" className="gap-1.5 rounded-full flex-1 sm:flex-none text-xs sm:text-sm"
                                onClick={() => setShowStylePanel(v => !v)}
                                style={showStylePanel ? { background: `linear-gradient(135deg, ${resumeStyle.accentColor}, ${resumeStyle.accentColor}cc)`, border: 'none' } : {}}>
                                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>{showStylePanel ? 'Hide Style' : 'Customize'}</span>
                            </Button>
                            {step === 7 && <>
                                <Button variant="outline" size="sm" className="gap-1.5 rounded-full flex-1 sm:flex-none text-xs sm:text-sm" onClick={handleShare}>
                                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Share
                                </Button>
                                <Button size="sm" className="gap-1.5 rounded-full flex-1 sm:flex-none text-xs sm:text-sm" onClick={handleDownload} disabled={downloading}
                                    style={{ background: `linear-gradient(135deg, ${resumeStyle.accentColor}, ${resumeStyle.accentColor}cc)` }}>
                                    {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                    <span className="hidden xs:inline">Download PDF</span>
                                    <span className="xs:hidden">PDF</span>
                                </Button>
                            </>}
                        </div>
                    </div>
                </motion.div>

                {/* ── Step Progress (Desktop) ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-7">
                    {/* Desktop steps row */}
                    <div className="hidden sm:flex items-center justify-between mb-3">
                        {STEPS.map(s => (
                            <button key={s.id} onClick={() => setStep(s.id)}
                                className={`flex flex-col items-center gap-1 transition-all ${step === s.id ? 'opacity-100' : 'opacity-45 hover:opacity-70'}`}>
                                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${step >= s.id ? `bg-gradient-to-r ${professionColor} text-white shadow-md` : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                    {step > s.id ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <s.icon className="h-4 w-4 md:h-5 md:w-5" />}
                                </div>
                                <span className="text-[9px] md:text-[11px] font-medium hidden md:inline">{s.label}</span>
                            </button>
                        ))}
                    </div>
                    {/* Mobile step dropdown */}
                    <MobileStepSelector step={step} setStep={setStep} professionColor={professionColor} accentColor={resumeStyle.accentColor} />
                    <Progress value={(step / STEPS.length) * 100} className="h-1.5 sm:h-2" />
                </motion.div>

                {/* ── Style Panel — Mobile (full width, above content) ── */}
                <AnimatePresence>
                    {showStylePanel && (
                        <motion.div key="style-mobile" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="lg:hidden mb-4 overflow-hidden">
                            <StylePanel style={resumeStyle} onChange={updateStyle} onReset={resetStyle} onClose={() => setShowStylePanel(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main content + desktop side panel ── */}
                <div className="flex gap-5 items-start">
                    <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="flex-1 min-w-0">

                        {/* Step 1 — Profession */}
                        {step === 1 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Briefcase className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />Choose Your Profession</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">Select your career path to get personalized suggestions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                        {PROFESSIONS.map(p => {
                                            const Icon = p.icon; const isSelected = resume.profession === p.label;
                                            return (
                                                <motion.button key={p.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => setField('profession', p.label)}
                                                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${isSelected ? `${p.bg} shadow-md` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                                    style={isSelected ? { borderColor: resumeStyle.accentColor } : {}}>
                                                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-sm`}>
                                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                                    </div>
                                                    <span className="text-[11px] sm:text-xs font-medium text-center leading-tight">{p.label}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    {resume.profession === 'Other' && (
                                        <div className="mt-4 space-y-2"><Label className="text-sm">Specify your profession</Label>
                                            <Input value={customProfession} onChange={e => setCustomProfession(e.target.value)} placeholder="e.g. Technical Writer, Blockchain Developer..." className="rounded-xl text-sm" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2 — Profile */}
                        {step === 2 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><User className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />Profile Information</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">Tell us about yourself</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><User className="h-3 w-3" />Full Name</Label><Input value={userName} readOnly className="rounded-xl bg-muted text-sm h-9 sm:h-10" /></div>
                                        <div className="space-y-1.5"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><Mail className="h-3 w-3" />Email</Label><Input value={resume.email} onChange={e => setField('email', e.target.value)} placeholder="you@email.com" className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                        <div className="space-y-1.5"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><Phone className="h-3 w-3" />Phone</Label><Input value={resume.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                        <div className="space-y-1.5"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><MapPin className="h-3 w-3" />Location</Label><Input value={resume.location} onChange={e => setField('location', e.target.value)} placeholder="City, Country" className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                        <div className="space-y-1.5"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><Linkedin className="h-3 w-3" />LinkedIn</Label><Input value={resume.linkedIn} onChange={e => setField('linkedIn', e.target.value)} placeholder="linkedin.com/in/you" className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                        <div className="space-y-1.5"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><Github className="h-3 w-3" />GitHub</Label><Input value={resume.github} onChange={e => setField('github', e.target.value)} placeholder="github.com/you" className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                        <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs sm:text-sm flex items-center gap-1.5"><Globe className="h-3 w-3" />Website / Portfolio</Label><Input value={resume.website} onChange={e => setField('website', e.target.value)} placeholder="yoursite.com" className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <Label className="text-xs sm:text-sm flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" style={{ color: resumeStyle.accentColor }} />Professional Summary</Label>
                                            <Button onClick={handleAISummary} disabled={generatingSummary} variant="ghost" size="sm" className="gap-1.5 rounded-full text-xs h-7 shrink-0" style={{ color: resumeStyle.accentColor }}>
                                                {generatingSummary ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Generate
                                            </Button>
                                        </div>
                                        <Textarea value={resume.summary} rows={4} onChange={e => setField('summary', e.target.value)} placeholder="A compelling summary about your professional background..." className="rounded-xl resize-none text-sm" />
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <Label className="text-xs sm:text-sm flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" style={{ color: resumeStyle.accentColor }} />Skills</Label>
                                        <div className="flex gap-2">
                                            <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill and press Enter" className="rounded-xl text-sm h-9 sm:h-10" />
                                            <Button onClick={addSkill} variant="outline" className="rounded-xl shrink-0 h-9 sm:h-10 px-3"><Plus className="h-4 w-4" /></Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {resume.skills.map(s => (
                                                <span key={s} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                                                    style={{ background: `${resumeStyle.accentColor}15`, color: resumeStyle.accentColor, borderColor: `${resumeStyle.accentColor}30` }}>
                                                    {s}<button onClick={() => removeSkill(s)} className="hover:opacity-60 ml-0.5"><X className="h-2.5 w-2.5" /></button>
                                                </span>
                                            ))}
                                        </div>
                                        {(() => {
                                            const prof = PROFESSIONS.find(p => p.label === resume.profession);
                                            const suggestions = Array.from(new Set(prof?.suggestedSkills || [])).filter(s => !resume.skills.includes(s));
                                            if (!suggestions.length) return null;
                                            return (
                                                <div className="p-3 rounded-xl border" style={{ background: `${resumeStyle.accentColor}08`, borderColor: `${resumeStyle.accentColor}20` }}>
                                                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" style={{ color: resumeStyle.accentColor }} />Suggested for {resume.profession}:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {suggestions.slice(0, 8).map(s => (
                                                            <button key={s} onClick={() => setField('skills', [...resume.skills, s])} className="text-xs bg-white dark:bg-gray-800 hover:opacity-80 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">+ {s}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3 — Experience */}
                        {step === 3 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Briefcase className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />Work Experience</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm mt-1">Showcase your professional journey</CardDescription>
                                        </div>
                                        <Button onClick={addExp} variant="outline" size="sm" className="gap-1.5 rounded-full w-full sm:w-auto text-xs sm:text-sm shrink-0"><Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Add Experience</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {resume.experience.length === 0
                                        ? <div className="text-center py-10"><div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><Briefcase className="h-7 w-7 text-muted-foreground" /></div><p className="text-sm text-muted-foreground">No experience added yet</p><p className="text-xs text-muted-foreground mt-1">Click "Add Experience" to start</p></div>
                                        : <div className="space-y-4">
                                            {resume.experience.map((exp, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative border border-gray-200 dark:border-gray-700 rounded-2xl p-3 sm:p-5 hover:shadow-md transition-shadow">
                                                    <button onClick={() => removeExp(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 p-1 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pr-8 sm:pr-0">
                                                        {([['Job Title', 'title', 'e.g. Senior Software Engineer'], ['Company', 'company', 'e.g. Google'], ['Location', 'location', 'e.g. Bangalore, India'], ['Start Date', 'startDate', 'e.g. Jan 2022'], ['End Date', 'endDate', 'e.g. Present']] as [string, keyof Experience, string][]).map(([lbl, fld, ph]) => (
                                                            <div key={fld} className="space-y-1.5"><Label className="text-xs sm:text-sm">{lbl}</Label><Input value={exp[fld]} onChange={e => updateExp(i, fld, e.target.value)} placeholder={ph} className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-1.5 mt-2 sm:mt-3"><Label className="text-xs sm:text-sm">Description</Label><Textarea value={exp.description} rows={3} onChange={e => updateExp(i, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." className="rounded-xl resize-none text-sm" /></div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    }
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 4 — Education */}
                        {step === 4 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />Education</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm mt-1">Your academic background</CardDescription>
                                        </div>
                                        <Button onClick={addEdu} variant="outline" size="sm" className="gap-1.5 rounded-full w-full sm:w-auto text-xs sm:text-sm shrink-0"><Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Add Education</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {resume.education.length === 0
                                        ? <div className="text-center py-10"><div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><GraduationCap className="h-7 w-7 text-muted-foreground" /></div><p className="text-sm text-muted-foreground">No education added yet</p></div>
                                        : <div className="space-y-4">
                                            {resume.education.map((edu, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative border border-gray-200 dark:border-gray-700 rounded-2xl p-3 sm:p-5 hover:shadow-md transition-shadow">
                                                    <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 p-1 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pr-8 sm:pr-0">
                                                        {([['Degree / Certificate', 'degree', 'e.g. B.Tech Computer Science'], ['Institution', 'institution', 'e.g. IIT Madras'], ['Year', 'year', 'e.g. 2018–2022'], ['Grade / CGPA', 'grade', 'e.g. 8.5/10']] as [string, keyof Education, string][]).map(([lbl, fld, ph]) => (
                                                            <div key={fld} className="space-y-1.5"><Label className="text-xs sm:text-sm">{lbl}</Label><Input value={edu[fld]} onChange={e => updateEdu(i, fld, e.target.value)} placeholder={ph} className="rounded-xl text-sm h-9 sm:h-10" /></div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    }
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 5 — Certifications */}
                        {step === 5 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Award className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />Certifications</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">Select certificates to showcase your expertise</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {allCerts.length === 0
                                        ? <div className="text-center py-10"><div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"><Award className="h-7 w-7 text-muted-foreground" /></div><p className="text-sm text-muted-foreground">No certifications earned yet</p></div>
                                        : <div className="space-y-2">
                                            {allCerts.map(c => (
                                                <motion.div key={c.certificateId} whileHover={{ scale: 1.01 }} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer"
                                                    style={resume.selectedCertificateIds.includes(c.certificateId) ? { borderColor: resumeStyle.accentColor, background: `${resumeStyle.accentColor}08` } : { borderColor: '#e5e7eb' }}
                                                    onClick={() => toggleCert(c.certificateId)}>
                                                    <Checkbox checked={resume.selectedCertificateIds.includes(c.certificateId)} onCheckedChange={() => toggleCert(c.certificateId)} className="pointer-events-none shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-xs sm:text-sm truncate">{c.courseName}</p>
                                                        <p className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not available'}</p>
                                                    </div>
                                                    <Award className="h-5 w-5 text-yellow-500 shrink-0" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    }
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 6 — ATS */}
                        {step === 6 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Search className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />ATS Compatibility Scanner</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">Optimize your resume for Applicant Tracking Systems</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-5">
                                    <div className="space-y-3">
                                        <Label className="text-sm">Job Description</Label>
                                        <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the job description here..." className="min-h-[160px] sm:min-h-[200px] rounded-2xl resize-none border-2 text-sm" />
                                        <Button onClick={handleATSScan} disabled={isScanning || !jobDescription} className="w-full rounded-2xl h-11 sm:h-12 font-bold gap-2 text-sm sm:text-base"
                                            style={{ background: `linear-gradient(135deg, ${resumeStyle.accentColor}, ${resumeStyle.accentColor}bb)` }}>
                                            {isScanning ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Target className="h-4 w-4 sm:h-5 sm:w-5" />}
                                            {isScanning ? 'Analyzing Resume...' : 'Analyze Match Score'}
                                        </Button>
                                    </div>
                                    <AnimatePresence>
                                        {atsResult && (
                                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className={`rounded-2xl p-4 sm:p-6 text-center border ${atsResult.score >= 70 ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : atsResult.score >= 40 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20' : 'bg-red-50 border-red-200 dark:bg-red-950/20'}`}>
                                                        <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">ATS Score</div>
                                                        <div className={`text-5xl sm:text-6xl font-black ${atsResult.score >= 70 ? 'text-green-600' : atsResult.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{atsResult.score}%</div>
                                                        <Badge className="mt-2" variant={atsResult.matchLevel === 'High' ? 'default' : atsResult.matchLevel === 'Medium' ? 'secondary' : 'destructive'}>{atsResult.matchLevel} Match</Badge>
                                                    </div>
                                                    <div className="rounded-2xl p-4 sm:p-6" style={{ background: `${resumeStyle.accentColor}08`, border: `1px solid ${resumeStyle.accentColor}20` }}>
                                                        <div className="flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /><h3 className="font-semibold text-sm">Missing Keywords</h3></div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {atsResult.missingKeywords.map(kw => <span key={kw} className="bg-white dark:bg-gray-800 text-xs px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">{kw}</span>)}
                                                            {!atsResult.missingKeywords.length && <p className="text-sm text-green-600">✨ No missing keywords!</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-5">
                                                    <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 shrink-0" style={{ color: resumeStyle.accentColor }} /><h3 className="font-semibold text-sm">Improvement Suggestions</h3></div>
                                                    <ul className="space-y-2">
                                                        {atsResult.suggestions.map((s, i) => (
                                                            <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                <span className="font-bold shrink-0 mt-0.5" style={{ color: resumeStyle.accentColor }}>•</span>{s}
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

                        {/* Step 7 — Preview */}
                        {step === 7 && (
                            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                <CardHeader className="pb-2 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: resumeStyle.accentColor }} />Resume Preview
                                        <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: resumeStyle.accentColor }} />Live
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">Use <strong>Customize</strong> to change colors, fonts, and spacing in real time</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <LivePreview resume={resume} userName={userName} certs={allCerts} style={resumeStyle} customProfession={customProfession} />
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="gap-1.5 rounded-full px-4 text-xs sm:text-sm">
                                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}{saving ? 'Saving...' : 'Save Resume'}
                                        </Button>
                                        <Button onClick={handleDownload} disabled={downloading} size="sm" className="gap-1.5 rounded-full px-4 text-xs sm:text-sm" style={{ background: `linear-gradient(135deg, ${resumeStyle.accentColor}, ${resumeStyle.accentColor}cc)` }}>
                                            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{downloading ? 'Generating...' : 'Download PDF'}
                                        </Button>
                                        <Button onClick={handleShare} variant="secondary" size="sm" className="gap-1.5 rounded-full px-4 text-xs sm:text-sm"><Share2 className="h-3.5 w-3.5" />Share</Button>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl overflow-hidden">
                                        <Link2 className="h-3 w-3 shrink-0" />
                                        <span className="truncate min-w-0">Share: <span className="font-mono" style={{ color: resumeStyle.accentColor }}>{websiteURL}/resume/{uid}</span></span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>

                    {/* ── Style Panel — Desktop side ── */}
                    <AnimatePresence>
                        {showStylePanel && (
                            <motion.div key="style-desktop" initial={{ opacity: 0, x: 40, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 40, scale: 0.97 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                className="hidden lg:block sticky top-8 w-72 shrink-0">
                                <StylePanel style={resumeStyle} onChange={updateStyle} onReset={resetStyle} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Navigation ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mt-5 sm:mt-7 gap-3">
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs sm:text-sm px-3 sm:px-4" onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}>
                        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Back</span>
                    </Button>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        {STEPS.map(s => <div key={s.id} className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all" style={{ background: step >= s.id ? resumeStyle.accentColor : '#d1d5db' }} />)}
                    </div>
                    {step < STEPS.length
                        ? <Button size="sm" className="gap-1.5 rounded-full text-xs sm:text-sm px-3 sm:px-4" onClick={() => setStep(step + 1)} style={{ background: `linear-gradient(135deg, ${resumeStyle.accentColor}, ${resumeStyle.accentColor}cc)` }}>
                            <span className="hidden sm:inline">Next</span><ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        : <Button size="sm" className="gap-1.5 rounded-full text-xs sm:text-sm px-3 sm:px-4" onClick={handleSave} disabled={saving} style={{ background: `linear-gradient(135deg, ${resumeStyle.accentColor}, ${resumeStyle.accentColor}cc)` }}>
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save & Finish'}</span>
                        </Button>
                    }
                </motion.div>
            </div>

            {showPDFToast && (
                <PDFToastNotification userName={userName} accentColor={resumeStyle.accentColor}
                    onClose={() => setShowPDFToast(false)} onDownloadAgain={() => { setShowPDFToast(false); setTimeout(handleDownload, 400); }} />
            )}
        </div>
    );
};

export default ResumeBuilder;
