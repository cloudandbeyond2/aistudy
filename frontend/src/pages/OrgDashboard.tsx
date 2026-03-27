import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Bell, Plus, Upload, Search, Trash2, DollarSign, CheckCircle, RotateCcw, BarChart, Sparkles, ChevronDown, ChevronUp, Check, X, Clock, Video, Briefcase, Download, ExternalLink, Eye, TrendingUp, Award, Shield, Camera, Mic, AlertTriangle, BookOpen, FileQuestion, Calendar, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { serverURL } from '@/constants';
import SEO from '@/components/SEO';
import * as XLSX from 'xlsx';
import RichTextEditor from '@/components/RichTextEditor';
import AdminStatCard from "@/components/admin/AdminStatCard";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Swal from 'sweetalert2';

const defaultQuizSettings = {
    examMode: true,
    quizMode: 'secure',
    attemptLimit: 2,
    cooldownMinutes: 60,
    passPercentage: 50,
    questionCount: 10,
    difficultyMode: 'mixed',
    shuffleQuestions: true,
    shuffleOptions: true,
    reviewMode: 'after_submit_with_answers',
    positiveMarkPerCorrect: 1,
    negativeMarkingEnabled: false,
    negativeMarkPerWrong: 0.25,
    sectionPatternEnabled: false,
    sections: {
        easy: 0,
        medium: 0,
        difficult: 0
    },
    proctoring: {
        requireCamera: true,
        requireMicrophone: true,
        detectFullscreenExit: true,
        detectTabSwitch: true,
        detectCopyPaste: true,
        detectContextMenu: true,
        detectNoise: true
    }
};

const createEmptyQuiz = () => ({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    explanation: '',
    difficulty: 'medium'
});

const createEmptyCourse = () => ({
    title: '',
    description: '',
    department: '',
    topics: [],
    quizzes: [],
    quizSettings: { ...defaultQuizSettings, proctoring: { ...defaultQuizSettings.proctoring } }
});

const normalizeCourseForEdit = (course: any) => {
    const quizzes = Array.isArray(course?.quizzes)
        ? course.quizzes.map((q: any) => ({
            ...q,
            options: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
            difficulty: q?.difficulty || 'medium'
        }))
        : [];

    const quizSettings = {
        ...defaultQuizSettings,
        ...(course?.quizSettings || {}),
        sections: {
            ...defaultQuizSettings.sections,
            ...(course?.quizSettings?.sections || {})
        },
        proctoring: {
            ...defaultQuizSettings.proctoring,
            ...(course?.quizSettings?.proctoring || {})
        }
    };

    return {
        ...course,
        quizzes,
        quizSettings
    };
};

const CourseForm = ({ course, setCourse, onSave, isEdit = false, departments = [], role }: any) => {
    if (!course) return null;
    const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
    const quizSettings = {
        ...defaultQuizSettings,
        ...(course.quizSettings || {}),
        sections: {
            ...defaultQuizSettings.sections,
            ...(course.quizSettings?.sections || {})
        },
        proctoring: {
            ...defaultQuizSettings.proctoring,
            ...(course.quizSettings?.proctoring || {})
        }
    };
    const lockedDepartmentLabel =
        departments.find((d: any) => d._id === course.department || d.name === course.department)?.name ||
        course.department ||
        'Assigned department';

    const updateTopic = (index: number, field: string, value: any) => {
        const updatedTopics = [...course.topics];
        updatedTopics[index] = { ...updatedTopics[index], [field]: value };
        setCourse({ ...course, topics: updatedTopics });
    };

    const removeTopic = (index: number) => {
        const updatedTopics = course.topics.filter((_: any, i: number) => i !== index);
        setCourse({ ...course, topics: updatedTopics });
    };

    const updateSubtopic = (topicIndex: number, subIndex: number, field: string, value: any) => {
        const updatedTopics = [...course.topics];
        let finalValue = value;

        // Extract YouTube ID if it's a videoUrl
        if (field === 'videoUrl' && value) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = value.match(regExp);
            if (match && match[2].length === 11) {
                finalValue = match[2];
            }
        }

        updatedTopics[topicIndex].subtopics[subIndex] = { ...updatedTopics[topicIndex].subtopics[subIndex], [field]: finalValue };
        setCourse({ ...course, topics: updatedTopics });
    };

    const removeSubtopic = (topicIndex: number, subIndex: number) => {
        const updatedTopics = [...course.topics];
        updatedTopics[topicIndex].subtopics = updatedTopics[topicIndex].subtopics.filter((_: any, i: number) => i !== subIndex);
        setCourse({ ...course, topics: updatedTopics });
    };

    const updateQuiz = (index: number, field: string, value: any) => {
        const updatedQuizzes = [...course.quizzes];
        if (field === 'option') {
            updatedQuizzes[index].options[value.optIndex] = value.text;
        } else {
            updatedQuizzes[index] = { ...updatedQuizzes[index], [field]: value };
        }
        setCourse({ ...course, quizzes: updatedQuizzes });
    };

    const removeQuiz = (index: number) => {
        const updatedQuizzes = course.quizzes.filter((_: any, i: number) => i !== index);
        setCourse({ ...course, quizzes: updatedQuizzes });
    };

    const updateQuizSetting = (field: string, value: any) => {
        setCourse({
            ...course,
            quizSettings: {
                ...quizSettings,
                [field]: value
            }
        });
    };

    const updateProctoringSetting = (field: string, value: boolean) => {
        setCourse({
            ...course,
            quizSettings: {
                ...quizSettings,
                proctoring: {
                    ...quizSettings.proctoring,
                    [field]: value
                }
            }
        });
    };

    const updateSectionSetting = (field: string, value: number) => {
        setCourse({
            ...course,
            quizSettings: {
                ...quizSettings,
                sections: {
                    ...quizSettings.sections,
                    [field]: value
                }
            }
        });
    };


    return (
        <div className="space-y-8 py-4 px-1 max-w-4xl mx-auto">
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Essential details about your course.</p>
                </div>
                <div className="grid gap-6 p-5 border rounded-xl bg-card shadow-sm">
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Course Title <span className="text-destructive">*</span></Label>
                        <Input className="h-11 text-base bg-muted/50 focus:bg-background transition-colors" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} placeholder="e.g., Complete Python Developer in 2024" />
                    </div>
                    <div className="grid gap-3">
                        <Label className="text-sm font-medium">Course Overview</Label>
                        <RichTextEditor
                            value={course.description || ''}
                            onChange={(content) => setCourse({ ...course, description: content })}
                            placeholder="Write a compelling description..."
                            className="min-h-[160px] border-muted/60"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Label className="text-sm font-medium">Assign to Department</Label>
                            {role === 'dept_admin' ? (
                                <div className="rounded-xl border bg-muted/40 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">Locked department</p>
                                            <p className="text-xs text-muted-foreground">
                                                Department admins can only publish within their assigned department.
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">
                                            {lockedDepartmentLabel}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <select
                                    className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={course.department}
                                    onChange={(e) => setCourse({ ...course, department: e.target.value })}
                                >
                                    <option value="">All Students (Default)</option>
                                    {departments.map((d: any) => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="grid gap-3">
                            <Label className="text-sm font-medium">Course Type</Label>
                            <select
                                className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={course.type || 'video & text course'}
                                onChange={(e) => setCourse({ ...course, type: e.target.value })}
                            >
                                <option value="video & text course">Video & Text Course</option>
                                <option value="image & text course">Image & Text Course</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum */}
            <div className="space-y-4">
                <div className="border-b pb-2 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2"><Video className="w-5 h-5 text-blue-500" /> Curriculum Setup</h3>
                        <p className="text-sm text-muted-foreground">Structure your course into lessons and topics.</p>
                    </div>
                    <Button type="button" size="sm" onClick={() => {
                        const topic = { title: '', subtopics: [], order: course.topics.length };
                        setCourse({ ...course, topics: [...course.topics, topic] });
                        setExpandedTopic(course.topics.length);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lesson
                    </Button>
                </div>

                <div className="space-y-4">
                    {course.topics.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                            <Video className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No lessons added yet.</p>
                        </div>
                    )}
                    {course.topics.map((topic: any, tIdx: number) => (
                        <div key={tIdx} className="border rounded-xl bg-card shadow-sm overflow-hidden transition-all duration-200">
                            <div
                                className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${expandedTopic === tIdx ? 'bg-primary/5 border-b' : 'hover:bg-muted/50'}`}
                                onClick={() => setExpandedTopic(expandedTopic === tIdx ? null : tIdx)}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                        {tIdx + 1}
                                    </div>
                                    <Input
                                        className="h-9 max-w-md bg-transparent border-transparent hover:border-input focus:bg-background focus:border-input font-semibold text-base transition-all"
                                        value={topic.title}
                                        onChange={(e) => updateTopic(tIdx, 'title', e.target.value)}
                                        placeholder="Lesson Title"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="mr-2">{topic.subtopics.length} items</Badge>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setExpandedTopic(expandedTopic === tIdx ? null : tIdx); }}>
                                        {expandedTopic === tIdx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); removeTopic(tIdx); }}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            {expandedTopic === tIdx && (
                                <div className="p-5 space-y-6 bg-muted/10">
                                    {topic.subtopics.length === 0 && (
                                        <p className="text-sm text-center text-muted-foreground py-2 tracking-wide uppercase font-medium">No contents in this lesson</p>
                                    )}
                                    {topic.subtopics.map((sub: any, sIdx: number) => (
                                        <div key={sIdx} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:bottom-auto last:before:h-2">
                                            <div className="absolute left-1.5 top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10"></div>
                                            <div className="bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-colors space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subtopic Title</Label>
                                                        <Input
                                                            className="font-medium h-9 focus-visible:ring-1"
                                                            value={sub.title}
                                                            onChange={(e) => updateSubtopic(tIdx, sIdx, 'title', e.target.value)}
                                                            placeholder="What will students learn?"
                                                        />
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 mt-5" onClick={() => removeSubtopic(tIdx, sIdx)}><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Video Link (Optional)</Label>
                                                    <div className="flex items-center relative">
                                                        <Video className="w-4 h-4 absolute left-3" style={{ color: '#ff0000' }} />
                                                        <Input
                                                            className="h-9 pl-9"
                                                            value={sub.videoUrl || ''}
                                                            onChange={(e) => updateSubtopic(tIdx, sIdx, 'videoUrl', e.target.value)}
                                                            placeholder="YouTube Video URL"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Learning Material</Label>
                                                    <RichTextEditor
                                                        value={sub.content || ''}
                                                        onChange={(content) => updateSubtopic(tIdx, sIdx, 'content', content)}
                                                        placeholder="Add comprehensive text, code blocks, or images here..."
                                                        className="min-h-[200px]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => {
                                        const updated = [...course.topics];
                                        updated[tIdx].subtopics.push({ title: '', content: '', videoUrl: '', order: 0 });
                                        setCourse({ ...course, topics: updated });
                                    }}>
                                        <Plus className="w-4 h-4 mr-2 text-primary" /> Add Subtopic Item
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-amber-500" /> Quiz Exam Mode</h3>
                    <p className="text-sm text-muted-foreground">Configure GATE-style exam rules, attempts, cooldown, and malpractice monitoring.</p>
                </div>

                <div className="grid gap-4 p-5 border rounded-xl bg-card shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Quiz Mode</Label>
                            <select
                                className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={quizSettings.quizMode}
                                onChange={(e) => {
                                    const nextMode = e.target.value;
                                    setCourse({
                                        ...course,
                                        quizSettings: {
                                            ...quizSettings,
                                            quizMode: nextMode,
                                            examMode: nextMode === 'secure'
                                        }
                                    });
                                }}
                            >
                                <option value="practice">Practice Mode</option>
                                <option value="assessment">Assessment Mode</option>
                                <option value="secure">Secure Exam Mode</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Difficulty Mode</Label>
                            <select
                                className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={quizSettings.difficultyMode}
                                onChange={(e) => updateQuizSetting('difficultyMode', e.target.value)}
                            >
                                <option value="mixed">Mixed</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="difficult">Difficult</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Attempt Limit</Label>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                value={quizSettings.attemptLimit}
                                onChange={(e) => updateQuizSetting('attemptLimit', Number(e.target.value) || 1)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Cooldown After Failed Attempt (Minutes)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={1440}
                                value={quizSettings.cooldownMinutes}
                                onChange={(e) => updateQuizSetting('cooldownMinutes', Number(e.target.value) || 0)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Pass Percentage</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={quizSettings.passPercentage}
                                onChange={(e) => updateQuizSetting('passPercentage', Number(e.target.value) || 50)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Questions Per Attempt</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={quizSettings.questionCount}
                                onChange={(e) => updateQuizSetting('questionCount', Number(e.target.value) || 1)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Review Mode</Label>
                            <select
                                className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={quizSettings.reviewMode}
                                onChange={(e) => updateQuizSetting('reviewMode', e.target.value)}
                            >
                                <option value="after_submit_with_answers">Show answers after submit</option>
                                <option value="after_submit_without_answers">Show summary without answers</option>
                                <option value="score_only">Score only</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Positive Mark Per Correct Answer</Label>
                            <Input
                                type="number"
                                min={0.25}
                                step={0.25}
                                value={quizSettings.positiveMarkPerCorrect}
                                onChange={(e) => updateQuizSetting('positiveMarkPerCorrect', Number(e.target.value) || 1)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
                            <span className="text-sm font-medium">Shuffle questions per attempt</span>
                            <input type="checkbox" checked={quizSettings.shuffleQuestions} onChange={(e) => updateQuizSetting('shuffleQuestions', e.target.checked)} />
                        </label>
                        <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
                            <span className="text-sm font-medium">Shuffle options per attempt</span>
                            <input type="checkbox" checked={quizSettings.shuffleOptions} onChange={(e) => updateQuizSetting('shuffleOptions', e.target.checked)} />
                        </label>
                        <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
                            <span className="text-sm font-medium">Enable negative marking</span>
                            <input type="checkbox" checked={quizSettings.negativeMarkingEnabled} onChange={(e) => updateQuizSetting('negativeMarkingEnabled', e.target.checked)} />
                        </label>
                        <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
                            <span className="text-sm font-medium">Enable section pattern</span>
                            <input type="checkbox" checked={quizSettings.sectionPatternEnabled} onChange={(e) => updateQuizSetting('sectionPatternEnabled', e.target.checked)} />
                        </label>
                    </div>

                    {quizSettings.negativeMarkingEnabled && (
                        <div className="grid gap-2 md:max-w-xs">
                            <Label className="text-sm font-medium">Negative Mark Per Wrong Answer</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.25}
                                value={quizSettings.negativeMarkPerWrong}
                                onChange={(e) => updateQuizSetting('negativeMarkPerWrong', Number(e.target.value) || 0)}
                            />
                        </div>
                    )}

                    {quizSettings.sectionPatternEnabled && (
                        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                            <div className="mb-3">
                                <h4 className="text-sm font-semibold">Section Pattern</h4>
                                <p className="text-xs text-muted-foreground">
                                    Configure how many questions should be picked from each difficulty bucket.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Easy</Label>
                                    <Input type="number" min={0} value={quizSettings.sections.easy} onChange={(e) => updateSectionSetting('easy', Number(e.target.value) || 0)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Medium</Label>
                                    <Input type="number" min={0} value={quizSettings.sections.medium} onChange={(e) => updateSectionSetting('medium', Number(e.target.value) || 0)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Difficult</Label>
                                    <Input type="number" min={0} value={quizSettings.sections.difficult} onChange={(e) => updateSectionSetting('difficult', Number(e.target.value) || 0)} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                            <AlertTriangle className="w-4 h-4" />
                            Malpractice Monitoring
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
                                <span className="flex items-center gap-2 text-sm font-medium"><Camera className="w-4 h-4 text-primary" /> Require camera access</span>
                                <input type="checkbox" checked={quizSettings.proctoring.requireCamera} onChange={(e) => updateProctoringSetting('requireCamera', e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
                                <span className="flex items-center gap-2 text-sm font-medium"><Mic className="w-4 h-4 text-primary" /> Require microphone access</span>
                                <input type="checkbox" checked={quizSettings.proctoring.requireMicrophone} onChange={(e) => updateProctoringSetting('requireMicrophone', e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
                                <span className="text-sm font-medium">Detect tab switches</span>
                                <input type="checkbox" checked={quizSettings.proctoring.detectTabSwitch} onChange={(e) => updateProctoringSetting('detectTabSwitch', e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
                                <span className="text-sm font-medium">Detect fullscreen exit</span>
                                <input type="checkbox" checked={quizSettings.proctoring.detectFullscreenExit} onChange={(e) => updateProctoringSetting('detectFullscreenExit', e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
                                <span className="text-sm font-medium">Detect copy/paste</span>
                                <input type="checkbox" checked={quizSettings.proctoring.detectCopyPaste} onChange={(e) => updateProctoringSetting('detectCopyPaste', e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
                                <span className="text-sm font-medium">Detect context menu</span>
                                <input type="checkbox" checked={quizSettings.proctoring.detectContextMenu} onChange={(e) => updateProctoringSetting('detectContextMenu', e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background md:col-span-2">
                                <span className="text-sm font-medium">Detect external noise spikes</span>
                                <input type="checkbox" checked={quizSettings.proctoring.detectNoise} onChange={(e) => updateProctoringSetting('detectNoise', e.target.checked)} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quizzes */}
            <div className="space-y-4 pt-4 border-t">
                <div className="border-b pb-2 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Assessment Quizzes</h3>
                        <p className="text-sm text-muted-foreground">Add multiple choice questions to test knowledge.</p>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => {
                        const quiz = createEmptyQuiz();
                        setCourse({ ...course, quizzes: [...course.quizzes, quiz] });
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                </div>

                <div className="grid gap-4">
                    {course.quizzes.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No quiz questions added yet.</p>
                        </div>
                    )}
                    {course.quizzes.map((quiz: any, qIdx: number) => (
                        <div key={qIdx} className="p-5 border rounded-xl shadow-sm bg-card hover:border-emerald-500/30 transition-colors">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <div className="flex-1 space-y-1.5">
                                    <Label className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                                        <span className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">Q{qIdx + 1}</span>
                                        Question Text
                                    </Label>
                                    <Textarea
                                        className="font-medium text-base resize-y min-h-[80px] focus-visible:ring-emerald-500/50"
                                        value={quiz.question}
                                        onChange={(e) => updateQuiz(qIdx, 'question', e.target.value)}
                                        placeholder="What is..."
                                    />
                                </div>
                                <div className="w-36 space-y-1.5">
                                    <Label className="text-xs text-muted-foreground font-semibold uppercase">Difficulty</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={quiz.difficulty || 'medium'}
                                        onChange={(e) => updateQuiz(qIdx, 'difficulty', e.target.value)}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="difficult">Difficult</option>
                                    </select>
                                </div>
                                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeQuiz(qIdx)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {quiz.options.map((opt: string, oIdx: number) => {
                                    const isCorrect = quiz.answer === opt && opt !== '';
                                    return (
                                        <div key={oIdx} className={`flex items-center gap-2 p-2 px-3 border rounded-lg transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-transparent hover:border-input'}`}>
                                            <Button
                                                size="icon"
                                                variant={isCorrect ? 'default' : 'outline'}
                                                className={`h-7 w-7 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                                onClick={() => updateQuiz(qIdx, 'answer', opt)}
                                                disabled={!opt.trim()}
                                                title="Mark as correct answer"
                                            >
                                                <Check className={`w-3.5 h-3.5 ${isCorrect ? 'text-white' : 'opacity-30'}`} />
                                            </Button>
                                            <Input
                                                className={`h-9 border-none shadow-none focus-visible:ring-0 ${isCorrect ? 'bg-transparent text-emerald-900 font-medium' : 'bg-transparent'}`}
                                                value={opt}
                                                onChange={(e) => updateQuiz(qIdx, 'option', { optIndex: oIdx, text: e.target.value })}
                                                placeholder={`Option ${oIdx + 1}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-dashed">
                                <Label className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Explanation (Optional)</Label>
                                <Input
                                    value={quiz.explanation}
                                    onChange={(e) => updateQuiz(qIdx, 'explanation', e.target.value)}
                                    placeholder="Explain why the answer is correct..."
                                    className="h-9 bg-background/50 border-transparent focus:border-input focus:bg-background"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t pb-8">
                <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" size="lg" onClick={onSave}>
                    {isEdit ? 'Save Changes' : 'Publish Course'} <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

const OrgDashboard = () => {
    const [openDeptDialog, setOpenDeptDialog] = useState(false);
    const [openDeptAdminDialog, setOpenDeptAdminDialog] = useState(false);
    const [openStudentDialog, setOpenStudentDialog] = useState(false);
    const [openCourseDialog, setOpenCourseDialog] = useState(false);
    const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
    const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role');
    const deptId = sessionStorage.getItem('deptId');
    const activeTab = searchParams.get('tab') || (role === 'dept_admin' ? 'courses' : 'students');
    const { toast } = useToast();
    const [stats, setStats] = useState<{ studentCount: number; studentLimit: number; assignmentCount: number; submissionCount: number; placedCount: number }>({ studentCount: 0, studentLimit: 50, assignmentCount: 0, submissionCount: 0, placedCount: 0 });
    const [students, setStudents] = useState([]); // Simplified for now
    const [assignments, setAssignments] = useState([]);
    const [assignmentSubmissionStats, setAssignmentSubmissionStats] = useState<Record<string, { total: number; graded: number; pending: number; resubmit: number }>>({});
    const [assignmentStatsLoading, setAssignmentStatsLoading] = useState(false);
    const [assignmentDeskFilter, setAssignmentDeskFilter] = useState<'all' | 'review' | 'dueSoon' | 'overdue'>('all');
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [previewProject, setPreviewProject] = useState<any>(null);
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
    const [editStudent, setEditStudent] = useState<any>(null);
    const [placementStudent, setPlacementStudent] = useState<any>(null);
    const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
    const [editAssignment, setEditAssignment] = useState<any>(null); // New state for editing assignments
    const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all', department: '' });
    const [newCourse, setNewCourse] = useState<any>(createEmptyCourse());
    const [editCourse, setEditCourse] = useState<any>(null);
    const [editAICourse, setEditAICourse] = useState<any>(null);
    const [previewCourse, setPreviewCourse] = useState<any>(null);
    const [orgSettings, setOrgSettings] = useState<any>(null);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [quizReportsMap, setQuizReportsMap] = useState<Record<string, any>>({});
    const [quizReportsLoading, setQuizReportsLoading] = useState(false);
    const [selectedQuizReport, setSelectedQuizReport] = useState<any>(null);
    const [openQuizReportDialog, setOpenQuizReportDialog] = useState(false);
    const [expandedQuizAttemptId, setExpandedQuizAttemptId] = useState('');
    const [openLimitIncreaseDialog, setOpenLimitIncreaseDialog] = useState(false);
    const [limitIncreaseData, setLimitIncreaseData] = useState({ requestedSlot: 1, requestedCustomLimit: 0 });
    const [openDeptCourseLimitDialog, setOpenDeptCourseLimitDialog] = useState(false);
    const [deptCourseLimitData, setDeptCourseLimitData] = useState({ requestedCourseLimit: 5 });
    const [deptLimitRequests, setDeptLimitRequests] = useState<any[]>([]);

    // New features state
    const [meetings, setMeetings] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
    const [openProjectDialog, setOpenProjectDialog] = useState(false);



    const [newMeeting, setNewMeeting] = useState({ title: '', link: '', platform: 'google-meet', date: '', time: '', department: getDeptScopedDepartment() });
    const [newProject, setNewProject] = useState({ title: '', description: '', type: 'Project', department: '', dueDate: '', guidance: '', subtopics: [] as string[], isAiGenerated: false });
    const [projectAiTopic, setProjectAiTopic] = useState('');
    const [isGeneratingProject, setIsGeneratingProject] = useState(false);

    // Departments & Dept Admins
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);
    const [deptAdmins, setDeptAdmins] = useState<any[]>([]);

    // Staff activity (org_admin only)
    const [staffLoginLogs, setStaffLoginLogs] = useState<any[]>([]);
    const [staffLoginLoading, setStaffLoginLoading] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newDeptAdmin, setNewDeptAdmin] = useState({ name: '', email: '', password: '', phone: '', departmentId: '', courseLimit: 0 });
    // const [newMaterial, setNewMaterial] = useState({ title: '', description: '', fileUrl: '', type: 'PDF', department: '' });
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        fileUrl: '',
        file: null,
        type: 'PDF',
        department: ''
    });

    // Add this function before your return statement
const resetProjectForm = () => {
    setNewProject({
        title: '',
        description: '',
        type: 'Project',
        department: getDeptScopedDepartment(),
        dueDate: '',
        guidance: '',
        subtopics: [],
        isAiGenerated: false
    });
    setProjectAiTopic('');
};

    const getDepartmentValue = (value: any) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.name || '';
        return '';
    };
    const matchesCurrentDepartment = (value: any, departmentId?: any) => {
        const normalizedValue = getDepartmentValue(value);
        const normalizedDepartmentId = getDepartmentValue(departmentId);
        return Boolean(
            (userDeptName && normalizedValue === userDeptName) ||
            (deptId && normalizedValue === deptId) ||
            (deptId && normalizedDepartmentId === deptId)
        );
    };
    const getDepartmentLabel = (value: any) => {
        const normalizedValue = getDepartmentValue(value);
        if (!normalizedValue || normalizedValue === 'all') return '';
        return departmentsList.find((d: any) => d._id === normalizedValue || d.name === normalizedValue)?.name || normalizedValue;
    };

    useEffect(() => {
        if (!orgId) {
            console.warn('No organization ID found. Please log out and log back in.');
            return;
        }
        fetchStats();
        fetchStudents();
        fetchCourses();
        fetchAssignments();
        // fetchOrgSettings();
        fetchMeetings();
        fetchProjects();
        fetchMaterials();
        fetchOrgDepartments();
        fetchOrgDeptAdmins();
        fetchNotices();
        fetchDeptLimitRequests();
    }, [orgId]);

    useEffect(() => {
        if (role === 'dept_admin' && (userDeptName || deptId)) {
            fetchStats();
            fetchStudents();
            fetchCourses();
            fetchAssignments();
            fetchMeetings();
            fetchProjects();
            fetchMaterials();
            fetchNotices();
            fetchDeptLimitRequests();
        }
    }, [userDeptName, deptId, role]);

    useEffect(() => {
        // Find department name if missing but ID exists
        if (role === 'dept_admin' && deptId && departmentsList.length > 0 && !userDeptName) {
            const myDept = departmentsList.find((d: any) => d._id === deptId);
            if (myDept) {
                setUserDeptName(myDept.name);
                setUserDeptId(myDept._id);
            }
        }
    }, [departmentsList, deptId, role, userDeptName]);

    useEffect(() => {
        if (role === 'dept_admin' && (userDeptId || deptId)) {
            const targetId = getDeptScopedDepartment();
            setNewAssignment(prev => ({ ...prev, department: targetId }));
            setNewMeeting(prev => ({ ...prev, department: targetId }));
            setNewProject(prev => ({ ...prev, department: targetId }));
            setNewMaterial(prev => ({ ...prev, department: targetId }));
            setNewNotice(prev => ({ ...prev, department: targetId }));
            setNewCourse(prev => ({ ...prev, department: targetId }));
            setNewStudent(prev => ({ ...prev, department: targetId }));
        }
    }, [userDeptId, deptId, role]);

    const fetchOrgDepartments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
            if (res.data.success) setDepartmentsList(res.data.departments);
        } catch (e) {
            console.error("Failed to fetch departments", e);
        }
    };
 
    const fetchOrgDeptAdmins = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/dept-admins?organizationId=${orgId}`);
            if (res.data.success) setDeptAdmins(res.data.admins);
        } catch (e) {
            console.error("Failed to fetch dept admins", e);
        }
    };

    const handleCreateDepartment = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/department/create`, {
                ...newDept,
                organizationId: orgId
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department created" });

                setNewDept({ name: '', description: '' });

                setOpenDeptDialog(false);   // ⭐ CLOSE POPUP

                fetchOrgDepartments();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to create department" });
        }
    };

    const handleDeleteDepartment = async (id: string) => {
        if (!confirm('Delete this department?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/department/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Department deleted" });
                fetchOrgDepartments();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete department" });
        }
    };

    const handleAddDeptAdmin = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/dept-admin/add`, {
                ...newDeptAdmin,
                organizationId: orgId
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Department Admin added" });

                setNewDeptAdmin({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    departmentId: '',
                    courseLimit: 0
                });

                setOpenDeptAdminDialog(false);   // ⭐ CLOSE POPUP

                fetchOrgDeptAdmins();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to add dept admin" });
        }
    };
    const handleDeleteDeptAdmin = async (id: string) => {
        if (!confirm('Delete this department admin?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/dept-admin/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Dept Admin deleted" });
                fetchOrgDeptAdmins();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete dept admin" });
        }
    };

    const fetchMeetings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/meetings?organizationId=${orgId}`);
            if (res.data.success) {
                let meetingsData = res.data.meetings;
                if (role === 'dept_admin') {
                    meetingsData = meetingsData.filter((m: any) => matchesCurrentDepartment(m.department, m.departmentId));
                }
                setMeetings(meetingsData);
            }
        } catch (e) {
            console.error("Failed to fetch meetings", e);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}`);
            if (res.data.success) {
                let projectsData = res.data.projects;
                if (role === 'dept_admin') {
                    projectsData = projectsData.filter((p: any) => matchesCurrentDepartment(p.department, p.departmentId));
                }
                setProjects(projectsData);
            }
        } catch (e) {
            console.error("Failed to fetch projects", e);
        }
    };

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}`);
            if (res.data.success) {
                let materialsData = res.data.materials;
                if (role === 'dept_admin') {
                    materialsData = materialsData.filter((m: any) => matchesCurrentDepartment(m.department, m.departmentId));
                }
                setMaterials(materialsData);
            }
        } catch (e) {
            console.error("Failed to fetch materials", e);
        }
    };

    const fetchDeptLimitRequests = async () => {
        try {
            const endpoint = role === 'dept_admin' 
                ? `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}&deptAdminId=${sessionStorage.getItem('uid')}`
                : `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}`;
            const res = await axios.get(endpoint);
            if (res.data.success) {
                setDeptLimitRequests(res.data.requests);
            }
        } catch (e) {
            console.error("Failed to fetch dept limit requests", e);
        }
    };

    const handleDeptCourseLimitRequest = async () => {
        if (!deptCourseLimitData.requestedCourseLimit || deptCourseLimitData.requestedCourseLimit < 1) {
            toast({ title: "Error", description: "Please enter a valid number of courses", variant: "destructive" });
            return;
        }

        try {
            const res = await axios.post(`${serverURL}/api/org/dept-admin/course-limit/request`, {
                organizationId: orgId,
                deptAdminId: sessionStorage.getItem('uid'),
                requestedCourseLimit: deptCourseLimitData.requestedCourseLimit
            });
            
            if (res.data.success) {
                toast({ title: "Request Sent", description: "Your course limit increase request has been sent to the organization admin." });
                setOpenDeptCourseLimitDialog(false);
                fetchDeptLimitRequests();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to submit request", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || e.message || "Failed to submit request", variant: "destructive" });
        }
    };

    const handleProcessDeptCourseLimitRequest = async (requestId: string, status: 'approved' | 'rejected', adminComment: string = '') => {
        try {
            const orgAdminId = sessionStorage.getItem('uid') || '';
            const res = await axios.post(`${serverURL}/api/org/dept-admin/course-limit/process`, {
                organizationId: orgId,
                orgAdminId,
                requestId,
                status,
                adminComment
            });

            if (res.data.success) {
                toast({ title: "Success", description: `Request ${status} successfully` });
                fetchDeptLimitRequests();
                fetchStats(); // Update org admin limit numbers
            } else {
                toast({ title: "Error", description: res.data.message || `Failed to ${status} request`, variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || e.message || `Failed to ${status} request`, variant: "destructive" });
        }
    };

    const handleCreateMeeting = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/meeting/create`, { ...newMeeting, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Meeting scheduled successfully" });

                setNewMeeting({
                    title: '',
                    link: '',
                    platform: 'google-meet',
                    date: '',
                    time: '',
                    department: ''
                });

                setOpenMeetingDialog(false); // close popup

                fetchMeetings();
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to schedule meeting" });
        }
    };

    const handleDeleteMeeting = async (id: string) => {
        if (!confirm('Delete this meeting?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/meeting/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Meeting deleted" });
                fetchMeetings();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete meeting" });
        }
    };

    const handleCreateProject = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/project/create`, { ...newProject, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Project/Practical added" });

                setNewProject({
                    title: '',
                    description: '',
                    type: 'Project',
                    department: getDeptScopedDepartment(),
                    dueDate: '',
                    guidance: '',
                    subtopics: [],
                    isAiGenerated: false
                });
                setProjectAiTopic('');

                 resetProjectForm(); // Reset form
            setOpenProjectDialog(false); // Close popup
            fetchProjects(); // Refresh the list
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to add project" });
        }
    };

// const handleGenerateProjectContent = async () => {
//     if (!projectAiTopic) {
//         toast({ title: "Required", description: "Please enter a topic or keywords" });
//         return;
//     }

//     setIsGeneratingProject(true);
    
//     const steps = [
//         { name: 'Analyzing topic', icon: '🔍', progress: 10 },
//         { name: 'Researching keywords', icon: '📊', progress: 25 },
//         { name: 'Generating structure', icon: '🏗️', progress: 40 },
//         { name: 'Writing title', icon: '📝', progress: 55 },
//         { name: 'Creating description', icon: '✍️', progress: 70 },
//         { name: 'Developing guidance', icon: '📚', progress: 85 },
//         { name: 'Adding subtopics', icon: '🔖', progress: 95 },
//         { name: 'Finalizing', icon: '✨', progress: 100 }
//     ];
    
//     let currentStep = 0;
    
//     Swal.fire({
//         title: '🤖 AI Project Generator',
//         html: `
//             <div class="text-left space-y-4">
//                 <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
//                     <span>Topic:</span>
//                     <span class="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">${projectAiTopic.substring(0, 40)}${projectAiTopic.length > 40 ? '...' : ''}</span>
//                 </div>
                
//                 <div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
//                     <div id="progress-bar" class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" style="width: 0%"></div>
//                 </div>
                
//                 <div id="current-step" class="flex items-center gap-2 text-lg font-medium mt-4">
//                     <span id="step-icon">🔍</span>
//                     <span id="step-name">Analyzing topic</span>
//                 </div>
                
//                 <div id="progress-percentage" class="text-2xl font-bold text-blue-600 dark:text-blue-400">0%</div>
                
//                 <div class="grid grid-cols-2 gap-2 mt-4 text-xs">
//                     ${steps.map((step, index) => `
//                         <div id="step-${index}" class="step-item flex items-center gap-1 text-gray-400">
//                             <span>${step.icon}</span>
//                             <span>${step.name}</span>
//                         </div>
//                     `).join('')}
//                 </div>
//             </div>
//         `,
//         showConfirmButton: false,
//         allowOutsideClick: false,
//         allowEscapeKey: false,
//         didOpen: () => {
//             // Start progress animation
//             const progressBar = document.getElementById('progress-bar');
//             const stepIcon = document.getElementById('step-icon');
//             const stepName = document.getElementById('step-name');
//             const progressPercentage = document.getElementById('progress-percentage');
            
//             const updateStep = () => {
//                 if (currentStep < steps.length) {
//                     const step = steps[currentStep];
                    
//                     // Update progress bar
//                     if (progressBar) {
//                         progressBar.style.width = `${step.progress}%`;
//                     }
                    
//                     // Update step display
//                     if (stepIcon) stepIcon.textContent = step.icon;
//                     if (stepName) stepName.textContent = step.name;
//                     if (progressPercentage) progressPercentage.textContent = `${step.progress}%`;
                    
//                     // Update step indicators
//                     for (let i = 0; i <= currentStep; i++) {
//                         const stepEl = document.getElementById(`step-${i}`);
//                         if (stepEl) {
//                             stepEl.className = 'flex items-center gap-1 text-green-600 dark:text-green-400';
//                         }
//                     }
                    
//                     currentStep++;
                    
//                     // Schedule next step
//                     if (currentStep < steps.length) {
//                         setTimeout(updateStep, 800);
//                     }
//                 }
//             };
            
//             // Start the step progression
//             setTimeout(updateStep, 500);
//         }
//     });

//     try {
//         const res = await axios.post(`${serverURL}/api/org/project/generate`, { 
//             topic: projectAiTopic,
//             type: newProject.type 
//         });

//         if (res.data.success) {
//             const { title, description, guidance, subtopics } = res.data.content;
            
//             // Update to 100% and show completion
//             const progressBar = document.getElementById('progress-bar');
//             const progressPercentage = document.getElementById('progress-percentage');
//             const stepName = document.getElementById('step-name');
//             const stepIcon = document.getElementById('step-icon');
            
//             if (progressBar) progressBar.style.width = '100%';
//             if (progressPercentage) progressPercentage.textContent = '100%';
//             if (stepIcon) stepIcon.textContent = '🎉';
//             if (stepName) stepName.textContent = 'Complete!';
            
//             // Close and show result
//             setTimeout(() => {
//                 Swal.close();
                
//                 const formattedGuidance = guidance ? formatGuidanceText(guidance) : '';
//                 const formattedDescription = description ? formatGuidanceText(description) : '';
                
//                 setNewProject({
//                     ...newProject,
//                     title: title || '',
//                     description: formattedDescription || description || '',
//                     guidance: formattedGuidance,
//                     subtopics: subtopics || [],
//                     isAiGenerated: true
//                 });
                
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Project Generated!',
//                     text: 'Your AI project has been created successfully',
//                     timer: 2000,
//                     showConfirmButton: false
//                 });
//             }, 1000);
//         }
//     } catch (e: any) {
//         Swal.fire({
//             icon: 'error',
//             title: 'Generation Failed',
//             text: e.response?.data?.message || 'Failed to generate content',
//             confirmButtonColor: '#d33'
//         });
//     } finally {
//         setIsGeneratingProject(false);
//     }
// };


const handleGenerateProjectContent = async () => {
    if (!projectAiTopic) {
        toast({ title: "Required", description: "Please enter a topic or keywords" });
        return;
    }

    setIsGeneratingProject(true);
    
    let progressInterval;
    let progress = 0;
    
    Swal.fire({
        title: '🤖 AI Project Generator',
        html: `
            <div class="text-left space-y-4">
                <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Topic:</span>
                    <span class="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">${projectAiTopic.substring(0, 40)}${projectAiTopic.length > 40 ? '...' : ''}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <div id="progress-bar" class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <div id="progress-status" class="flex items-center justify-center gap-2 text-sm mt-2">
                    <span id="progress-icon">⏳</span>
                    <span id="progress-message">Initializing...</span>
                </div>
                <div id="progress-percentage" class="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">0%</div>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 2;
                    if (progress > 90) progress = 90;
                    
                    const progressBar = document.getElementById('progress-bar');
                    const progressPercentage = document.getElementById('progress-percentage');
                    const progressMessage = document.getElementById('progress-message');
                    
                    if (progressBar) progressBar.style.width = `${progress}%`;
                    if (progressPercentage) progressPercentage.textContent = `${Math.round(progress)}%`;
                    
                    if (progress < 20) {
                        if (progressMessage) progressMessage.textContent = 'Analyzing topic...';
                    } else if (progress < 40) {
                        if (progressMessage) progressMessage.textContent = 'Researching content...';
                    } else if (progress < 60) {
                        if (progressMessage) progressMessage.textContent = 'Generating structure...';
                    } else if (progress < 80) {
                        if (progressMessage) progressMessage.textContent = 'Writing content...';
                    } else {
                        if (progressMessage) progressMessage.textContent = 'Almost there...';
                    }
                }
            }, 200);
        }
    });

    try {
        const startTime = Date.now();
        const res = await axios.post(`${serverURL}/api/org/project/generate`, { 
            topic: projectAiTopic,
            type: newProject.type 
        });

        if (progressInterval) clearInterval(progressInterval);
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

        if (res.data.success) {
            const { title, description, guidance, subtopics } = res.data.content;
            
            const progressBar = document.getElementById('progress-bar');
            const progressPercentage = document.getElementById('progress-percentage');
            const progressMessage = document.getElementById('progress-message');
            const progressIcon = document.getElementById('progress-icon');
            
            if (progressBar) progressBar.style.width = '100%';
            if (progressPercentage) progressPercentage.textContent = '100%';
            if (progressMessage) progressMessage.textContent = `Complete! (${totalTime}s)`;
            if (progressIcon) progressIcon.textContent = '✅';
            
            await new Promise(resolve => setTimeout(resolve, 500));
            Swal.close();
            
            const formattedGuidance = guidance ? formatGuidanceText(guidance) : '';
            const formattedDescription = description ? formatGuidanceText(description) : '';
            
            setNewProject({
                ...newProject,
                title: title || '',
                description: formattedDescription || description || '',
                guidance: formattedGuidance,
                subtopics: subtopics || [],
                isAiGenerated: true
            });
            
            toast({ title: "Success", description: `Project generated in ${totalTime}s` });
        }
    } catch (e: any) {
        if (progressInterval) clearInterval(progressInterval);
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Generation Failed',
            text: e.response?.data?.message || 'Failed to generate content',
            confirmButtonColor: '#d33'
        });
    } finally {
        setIsGeneratingProject(false);
    }
};

const formatGuidanceText = (text: string) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimRight();
        
        if (line.startsWith('### ')) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            html += `<h3 class="text-lg font-bold text-primary mt-6 mb-3">${line.substring(4)}</h3>`;
        }
        else if (line.startsWith('## ')) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            html += `<h2 class="text-xl font-bold text-primary-dark mt-5 mb-3">${line.substring(3)}</h2>`;
        }
        else if (line.startsWith('# ')) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            html += `<h1 class="text-2xl font-bold text-primary mt-6 mb-4">${line.substring(2)}</h1>`;
        }
        else if (line.match(/^(Phase|Step|Part)\s+\d+[:.]/i)) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            html += `<h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 mt-6 mb-3">${line}</h3>`;
        }
        else if (line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*:$/) || (line.length < 60 && line.endsWith(':'))) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            html += `<h4 class="font-bold text-base text-foreground mt-4 mb-2">${line}</h4>`;
        }
        else if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
            if (!inList || listType !== 'ul') {
                if (inList) html += `</${listType}>`;
                html += '<ul class="list-disc pl-6 my-3 space-y-1.5">';
                inList = true;
                listType = 'ul';
            }
            const content = line.substring(line.indexOf(' ') + 1).trim();
            const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-foreground">$1</span>');
            html += `<li class="text-sm text-muted-foreground">${formattedContent}</li>`;
        }
        else if (line.match(/^\d+[.)]\s/)) {
            if (!inList || listType !== 'ol') {
                if (inList) html += `</${listType}>`;
                html += '<ol class="list-decimal pl-6 my-3 space-y-1.5">';
                inList = true;
                listType = 'ol';
            }
            const content = line.replace(/^\d+[.)]\s/, '');
            const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-foreground">$1</span>');
            html += `<li class="text-sm text-muted-foreground">${formattedContent}</li>`;
        }
        else if (line.length > 0) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-foreground">$1</span>');
            html += `<p class="text-sm text-muted-foreground mb-3 leading-relaxed">${formattedLine}</p>`;
        }
        else if (line === '' && !inList) {
            html += '<div class="h-3"></div>';
        }
    }
    
    if (inList) {
        html += `</${listType}>`;
    }
    
    return html;
};

   const handleDeleteProject = async (id: string) => {
    const result = await Swal.fire({
        title: 'Delete Project?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            const res = await axios.delete(`${serverURL}/api/org/project/${id}`);
            if (res.data.success) {
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Project has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchProjects();
            }
        } catch (e) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete project',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    }
};

    const handleCreateMaterial = async () => {
        try {
            let res;

            if (newMaterial.type === 'PDF' && newMaterial.file) {
                const formData = new FormData();
                formData.append('title', newMaterial.title);
                formData.append('description', newMaterial.description);
                formData.append('type', newMaterial.type);
                formData.append('department', newMaterial.department);
                formData.append('organizationId', orgId);
                formData.append('file', newMaterial.file);

                res = await axios.post(
                    `${serverURL}/api/org/material/create`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            } else {
                res = await axios.post(`${serverURL}/api/org/material/create`, {
                    ...newMaterial,
                    organizationId: orgId,
                });
            }

            if (res.data.success) {
                toast({ title: "Success", description: "Material added successfully" });

                setNewMaterial({
                    title: '',
                    description: '',
                    fileUrl: '',
                    file: null,
                    type: 'PDF',
                    department: getDeptScopedDepartment()
                });

                setOpenMaterialDialog(false);   // ⭐ CLOSE POPUP

                fetchMaterials();
            }

        } catch (e) {
            toast({ title: "Error", description: "Failed to add material" });
        }
    };

    const handleDeleteMaterial = async (id: string) => {
        if (!confirm('Delete this material?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/material/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Material deleted" });
                fetchMaterials();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete material" });
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
            if (res.data.success) {
                let assignmentsData = res.data.assignments;
                if (role === 'dept_admin') {
                    assignmentsData = assignmentsData.filter((a: any) => matchesCurrentDepartment(a.department, a.departmentId));
                }
                setAssignments(assignmentsData);
            }
        } catch (e) {
            console.error("Failed to fetch assignments", e);
        }
    };

    const handleViewSubmissions = (assignment: any) => {
        navigate(`/dashboard/org/assignment/${assignment._id}/submissions`);
    };

    const fetchOrgSettings = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/details/${orgId}`);
            if (res.data.success) {
                setOrgSettings(res.data.organization);
            }
        } catch (e) {
            console.error("Failed to fetch org settings", e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/dashboard/stats?organizationId=${orgId}`);
            if (res.data.success) {
                setStats(res.data);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchStudents = async () => {
        console.log('Fetching students for orgId:', orgId);
        try {
            const res = await axios.get(`${serverURL}/api/org/students?organizationId=${orgId}`);
            console.log('Students response:', res.data);
            if (res.data.success) {
                let studentsData = res.data.students;
                if (role === 'dept_admin') {
                    studentsData = studentsData.filter((s: any) =>
                        (userDeptName && s.department === userDeptName) ||
                        (deptId && (s.departmentId === deptId || s.department === deptId))
                    );
                }
                setStudents(studentsData);
            } else {
                console.error('Failed to fetch students:', res.data.message);
            }
        } catch (e) {
            console.error('Error fetching students:', e);
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/courses?organizationId=${orgId}`);
            if (res.data.success) {
                let coursesData = res.data.courses;
                if (role === 'dept_admin') {
                    coursesData = coursesData.filter((c: any) =>
                        (userDeptName && c.department === userDeptName) ||
                        (deptId && (c.departmentId === deptId || c.department === deptId))
                    );
                }
                setCourses(coursesData);
                void fetchQuizReports(coursesData.map((c: any) => String(c._id)));
            }
        } catch (e) {
            console.error(e);
        }
    }

    const fetchStaffLoginActivity = async () => {
        if (role !== 'org_admin') return;
        if (!orgId) return;
        const requesterId = sessionStorage.getItem('uid') || '';
        if (!requesterId) return;

        setStaffLoginLoading(true);
        try {
            const res = await axios.get(`${serverURL}/api/org/staff/activity?organizationId=${orgId}&requesterId=${requesterId}&limit=200`);
            if (res.data?.success) {
                setStaffLoginLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
            }
        } catch (e) {
            console.error('Failed to fetch staff login activity', e);
        } finally {
            setStaffLoginLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'activity' && role === 'org_admin') {
            fetchStaffLoginActivity();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, orgId, role]);

    useEffect(() => {
        if (activeTab !== 'assignments') return;
        if (!assignments.length) {
            setAssignmentSubmissionStats({});
            return;
        }

        const fetchAssignmentSubmissionStats = async () => {
            setAssignmentStatsLoading(true);
            try {
                const statsEntries = await Promise.all(
                    assignments.map(async (assignment: any) => {
                        try {
                            const res = await axios.get(`${serverURL}/api/org/assignment/${assignment._id}/submissions`);
                            const submissions = Array.isArray(res.data?.submissions) ? res.data.submissions : [];
                            const graded = submissions.filter((submission: any) => submission.status === 'graded').length;
                            const resubmit = submissions.filter((submission: any) => submission.status === 'resubmit_required').length;
                            const pending = submissions.length - graded - resubmit;

                            return [
                                assignment._id,
                                {
                                    total: submissions.length,
                                    graded,
                                    pending,
                                    resubmit,
                                }
                            ] as const;
                        } catch (error) {
                            console.error(`Failed to fetch submissions for assignment ${assignment._id}`, error);
                            return [
                                assignment._id,
                                { total: 0, graded: 0, pending: 0, resubmit: 0 }
                            ] as const;
                        }
                    })
                );

                setAssignmentSubmissionStats(Object.fromEntries(statsEntries));
            } finally {
                setAssignmentStatsLoading(false);
            }
        };

        fetchAssignmentSubmissionStats();
    }, [activeTab, assignments]);

    const fetchQuizReports = async (courseIds?: string[]) => {
        if (!orgId) return;
        setQuizReportsLoading(true);
        try {
            const requesterId = sessionStorage.getItem('uid');
            if (!requesterId) return;
            const res = await axios.get(`${serverURL}/api/org-quiz/reports?organizationId=${orgId}&requesterId=${requesterId}`);
            if (res.data?.success) {
                const reports = Array.isArray(res.data.reports) ? res.data.reports : [];
                const filtered = Array.isArray(courseIds) && courseIds.length > 0
                    ? reports.filter((r: any) => courseIds.includes(String(r.courseId)))
                    : reports;
                const nextMap: Record<string, any> = {};
                filtered.forEach((r: any) => {
                    nextMap[String(r.courseId)] = r;
                });
                setQuizReportsMap(nextMap);
            }
        } catch (e) {
            console.error('Failed to fetch quiz reports', e);
        } finally {
            setQuizReportsLoading(false);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
            if (res.data.success) {
                let noticesData = res.data.notices;
                if (role === 'dept_admin') {
                    noticesData = noticesData.filter((n: any) => matchesCurrentDepartment(n.department, n.departmentId));
                }
                setNotices(noticesData);
            }
        } catch (e) {
            console.error('Failed to fetch notices:', e);
        }
    }

    const handleAddStudent = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/student/add`, { ...newStudent, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Student added successfully" });
                setNewStudent({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
                setOpenStudentDialog(false);   // ⭐ CLOSE POPUP
                fetchStudents(); // Refresh the student list
                fetchStats(); // Refresh stats
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

    const handleCreateAssignment = async () => {
        try {
            const assignmentData = {
                ...newAssignment,
                organizationId: orgId,
            };
            const res = await axios.post(`${serverURL}/api/org/assignment/create`, assignmentData);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Assignment created successfully' });
                setNewAssignment({
                    topic: '',
                    description: '',
                    dueDate: '',
                    department: getDeptScopedDepartment()
                });
                fetchAssignments();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create assignment' });
        }
    };

    const handleUpdateAssignment = async () => {
        try {
            const assignmentData = {
                ...editAssignment,
                organizationId: orgId,
            };
            const res = await axios.put(`${serverURL}/api/org/assignment/${editAssignment._id}`, assignmentData);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Assignment updated successfully' });
                setEditAssignment(null);
                fetchAssignments();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update assignment' });
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/assignment/${id}`);
            if (res.data.success) {
                toast({ title: 'Success', description: 'Assignment deleted successfully' });
                fetchAssignments();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete assignment' });
        }
    };

    const handleCreateCourse = async (courseData) => {
        try {
            const res = await axios.post(`${serverURL}/api/org/course/create`, {
                ...courseData,
                organizationId: orgId,
                createdBy: sessionStorage.getItem('uid')
            });

            if (res.data.success) {
                toast({ title: "Success", description: "Course created successfully" });

                setNewCourse(role === 'dept_admin'
                    ? { ...createEmptyCourse(), department: getDeptScopedDepartment() }
                    : createEmptyCourse());

                setOpenCourseDialog(false);   // ⭐ CLOSE POPUP

                fetchCourses();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to create course" });
        }
    };

    const handleReviewOrgCourse = async (courseId: string, approvalStatus: 'approved' | 'rejected' | 'pending', approvalNote = '') => {
        const reviewerId = sessionStorage.getItem('uid') || '';
        if (!reviewerId) return;
        try {
            const res = await axios.post(`${serverURL}/api/org/course/${courseId}/review`, {
                reviewerId,
                approvalStatus,
                approvalNote
            });
            if (res.data?.success) {
                toast({ title: "Success", description: res.data.message || "Course updated" });
                fetchCourses();
            } else {
                toast({ title: "Error", description: res.data?.message || "Failed to update course" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed" });
        }
    };

    const handlePublishOrgCourse = async (courseId: string, nextPublished: boolean) => {
        const publisherId = sessionStorage.getItem('uid') || '';
        if (!publisherId) return;
        try {
            const res = await axios.post(`${serverURL}/api/org/course/${courseId}/publish`, {
                publisherId,
                isPublished: nextPublished
            });
            if (res.data?.success) {
                toast({ title: "Success", description: res.data.message || "Course updated" });
                fetchCourses();
            } else {
                toast({ title: "Error", description: res.data?.message || "Failed to update course" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed" });
        }
    };

    const handleUpdateCourse = async () => {
        if (!editCourse) return;
        try {
            const res = await axios.put(`${serverURL}/api/org/course/${editCourse._id}`, {
                ...editCourse,
                updatedBy: sessionStorage.getItem('uid')
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Course updated successfully" });
                setEditCourse(null);
                fetchCourses();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to update course" });
        }
    };

    const handleUpdateAICourse = async () => {
        if (!editAICourse) return;
        console.log("Attempting to update AI course:", editAICourse);
        console.log("Course ID:", editAICourse._id);
        console.log("Update URL:", `${serverURL}/api/org/course/${editAICourse._id}`);

        try {
            const res = await axios.put(`${serverURL}/api/org/course/${editAICourse._id}`, {
                mainTopic: editAICourse.mainTopic,
                department: editAICourse.department,
                updatedBy: sessionStorage.getItem('uid')
            });
            console.log("Update response:", res.data);
            if (res.data.success) {
                toast({ title: "Success", description: "AI Course updated successfully" });
                setEditAICourse(null);
                fetchCourses();
            } else {
                toast({ title: "Error", description: res.data.message || "Failed to update AI course" });
            }
        } catch (e: any) {
            console.error("Update AI course error:", e);
            console.error("Error response:", e.response?.data);
            const errorMessage = e.response?.data?.message || e.message || "Failed to update AI course";
            toast({ title: "Error", description: errorMessage });
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/course/${courseId}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Course deleted successfully" });
                fetchCourses();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete course" });
        }
    };

    const addTopic = (isEdit: boolean = false) => {
        const topic = { title: '', subtopics: [], order: isEdit ? editCourse.topics.length : newCourse.topics.length };
        if (isEdit) {
            setEditCourse({ ...editCourse, topics: [...editCourse.topics, topic] });
        } else {
            setNewCourse({ ...newCourse, topics: [...newCourse.topics, topic] });
        }
    };

    const addSubtopic = (topicIndex: number, isEdit: boolean = false) => {
        const subtopic = { title: '', content: '', order: 0 };
        if (isEdit) {
            const updatedTopics = [...editCourse.topics];
            updatedTopics[topicIndex].subtopics.push(subtopic);
            setEditCourse({ ...editCourse, topics: updatedTopics });
        } else {
            const updatedTopics = [...newCourse.topics];
            updatedTopics[topicIndex].subtopics.push(subtopic);
            setNewCourse({ ...newCourse, topics: updatedTopics });
        }
    };

    const addQuiz = (isEdit: boolean = false) => {
        const quiz = createEmptyQuiz();
        if (isEdit) {
            setEditCourse({ ...editCourse, quizzes: [...editCourse.quizzes, { ...quiz }] });
        } else {
            setNewCourse({ ...newCourse, quizzes: [...newCourse.quizzes, { ...quiz }] });
        }
    };

    const departments = Array.from(new Set(students.map((s: any) => s.studentDetails?.department).filter(Boolean)));

    const handleUpdateStudent = async () => {
        if (!editStudent) return;
        try {
            const res = await axios.put(`${serverURL}/api/org/student/${editStudent._id}`, {
                name: editStudent.mName,
                email: editStudent.email,
                department: editStudent.studentDetails?.department,
                section: editStudent.studentDetails?.section,
                rollNo: editStudent.studentDetails?.rollNo,
                studentClass: editStudent.studentDetails?.studentClass,
                academicYear: editStudent.studentDetails?.academicYear,
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Student updated successfully" });
                setEditStudent(null);
                fetchStudents();
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

    const handleUpdatePlacement = async () => {
        if (!placementStudent) return;
        try {
            const res = await axios.put(`${serverURL}/api/org/student/${placementStudent._id}`, {
                placementCompany: placementStudent.studentDetails?.placementCompany,
                placementPosition: placementStudent.studentDetails?.placementPosition,
                isPlacementClosed: placementStudent.studentDetails?.isPlacementClosed,
            });
            if (res.data.success) {
                toast({ title: "Success", description: "Placement details updated" });
                setPlacementStudent(null);
                fetchStudents();
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/student/${studentId}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Student deleted successfully" });
                fetchStudents();
                fetchStats();
            } else {
                toast({ title: "Error", description: res.data.message });
            }
        } catch (e: any) {
            console.error(e);
            toast({ title: "Error", description: e.response?.data?.message || "Request failed" });
        }
    };

    const handleCreateNotice = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/notice/create`, { ...newNotice, organizationId: orgId });
            if (res.data.success) {
                toast({ title: "Success", description: "Notice posted" });
                setNewNotice({
                    title: '',
                    content: '',
                    audience: 'all',
                    department: getDeptScopedDepartment()
                });
                fetchNotices();
            }
        } catch (e) {
            toast({ title: "Error", description: "Request failed" });
        }
    };

    const handleDeleteNotice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        try {
            const res = await axios.delete(`${serverURL}/api/org/notice/${id}`);
            if (res.data.success) {
                toast({ title: "Success", description: "Notice deleted" });
                fetchNotices();
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete notice" });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast({ title: "Error", description: "The Excel file is empty", variant: "destructive" });
                    setIsUploading(false);
                    return;
                }

                // Map Excel columns to our expected format
                // Expected columns: Name, Email, Password, Department, Section, Roll No
                const studentsData = jsonData
                    .map((row: any) => ({
                        name: row.Name || row.name || '',
                        email: row.Email || row.email || '',
                        password: row.Password || row.password || 'Student@123', // Default password if empty
                        department: row.Department || row.department || '',
                        section: row.Section || row.section || '',
                        rollNo: row.RollNo || row['Roll No'] || row.rollno || '',
                        academicYear: row['Academic Year'] || row.AcademicYear || row.academicYear || ''
                    }))
                    .filter(student => student.name.trim() !== '' || student.email.trim() !== '');

                // Validate data
                const invalidRows = studentsData.filter(h => !h.email || !h.name);
                if (invalidRows.length > 0) {
                    toast({
                        title: "Warning",
                        description: `${invalidRows.length} rows are missing Name or Email and will likely fail.`,
                        variant: "destructive"
                    });
                }

                const res = await axios.post(`${serverURL}/api/org/student/bulk-upload`, {
                    students: studentsData,
                    organizationId: orgId
                });

                if (res.data.success) {
                    toast({
                        title: "Success",
                        description: `Successfully added ${res.data.message.split(' ')[1]} students.`
                    });
                    if (res.data.errors && res.data.errors.length > 0) {
                        toast({
                            title: "Note",
                            description: `${res.data.errors.length} rows were skipped (possibly existing emails).`,
                            variant: "destructive"
                        });
                    }
                    setIsBulkUploadOpen(false);
                    fetchStudents();
                    fetchStats();
                } else {
                    toast({ title: "Error", description: res.data.message, variant: "destructive" });
                }
            } catch (error) {
                console.error("Bulk upload error:", error);
                toast({ title: "Error", description: "Failed to process the Excel file", variant: "destructive" });
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const template = [
            { Name: 'John Doe', Email: 'john@example.com', Password: 'Password123', Department: 'CS', Section: 'A', 'Roll No': '101', 'Academic Year': '2024-2025' }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "student_bulk_upload_template.xlsx");
    };
 
    const handleLimitIncreaseRequest = async () => {
        try {
            const res = await axios.post(`${serverURL}/api/org/limit-increase/request`, {
                organizationId: orgId,
                requestedSlot: limitIncreaseData.requestedSlot,
                requestedCustomLimit: limitIncreaseData.requestedCustomLimit
            });
            if (res.data.success) {
                toast({ title: "Request Sent", description: "Your request for limit increase has been sent to admin." });
                setOpenLimitIncreaseDialog(false);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.response?.data?.message || "Failed to send request" });
        }
    };

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const meetingsTodayCount = meetings.filter((meeting: any) => {
        if (!meeting?.date) return false;
        return new Date(meeting.date).toISOString().slice(0, 10) === todayKey;
    }).length;
    const upcomingMeetingsCount = meetings.filter((meeting: any) => {
        if (!meeting?.date) return false;
        const meetingDateTime = new Date(`${meeting.date}T${meeting.time || '00:00'}`);
        return meetingDateTime >= now;
    }).length;
    const aiProjectCount = projects.filter((project: any) => Boolean(project?.isAiGenerated)).length;
    const dueSoonProjectsCount = projects.filter((project: any) => {
        if (!project?.dueDate) return false;
        const dueDate = new Date(project.dueDate);
        return dueDate >= now && dueDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;
    const recentNoticesCount = notices.filter((notice: any) => {
        if (!notice?.createdAt) return false;
        return new Date(notice.createdAt) >= weekAgo;
    }).length;
    const orgWideNoticeCount = notices.filter((notice: any) => !notice?.department).length;
    const assignmentInsights = assignments.map((assignment: any) => {
        const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
        const statsForAssignment = assignmentSubmissionStats[assignment._id] || { total: 0, graded: 0, pending: 0, resubmit: 0 };
        const isOverdue = Boolean(dueDate && dueDate < new Date(new Date().setHours(0, 0, 0, 0)));
        const isDueSoon = Boolean(
            dueDate &&
            dueDate >= now &&
            dueDate.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000
        );
        const needsReview = statsForAssignment.pending > 0 || statsForAssignment.resubmit > 0;

        return {
            assignment,
            stats: statsForAssignment,
            isOverdue,
            isDueSoon,
            needsReview,
        };
    });
    const overdueAssignments = assignmentInsights.filter((entry) => entry.isOverdue);
    const dueSoonAssignments = assignmentInsights.filter((entry) => entry.isDueSoon);
    const reviewAssignments = assignmentInsights.filter((entry) => entry.needsReview);
    const filteredAssignmentInsights =
        assignmentDeskFilter === 'review'
            ? reviewAssignments
            : assignmentDeskFilter === 'dueSoon'
            ? dueSoonAssignments
            : assignmentDeskFilter === 'overdue'
            ? overdueAssignments
            : assignmentInsights;

    const renderAssignmentCard = ({ assignment, stats: statsForAssignment, isOverdue, isDueSoon, needsReview }: any) => (
        <div key={assignment._id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg">{assignment.topic}</h3>
                        <Badge
                            variant={isOverdue ? "destructive" : "secondary"}
                            className={isOverdue ? "" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"}
                        >
                            {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Active"}
                        </Badge>
                        {needsReview && (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                                Review Needed
                            </Badge>
                        )}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: assignment.description }} />
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span>Questions: {assignment.questions?.length || 0}</span>
                        <span>Submissions: {statsForAssignment.total}</span>
                        <span>Pending Review: {statsForAssignment.pending}</span>
                        {statsForAssignment.resubmit > 0 && <span>Resubmit: {statsForAssignment.resubmit}</span>}
                        {getDepartmentLabel(assignment.department) && <span>Dept: {getDepartmentLabel(assignment.department)}</span>}
                    </div>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleViewSubmissions(assignment)}>
                        View Submissions
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditAssignment({
                                ...assignment,
                                dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : ''
                            })}>
                                Edit
                            </Button>
                        </DialogTrigger>
                        {editAssignment && editAssignment._id === assignment._id && (
                            <DialogContent>
                                <DialogHeader><DialogTitle>Edit Assignment</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label>Topic</Label>
                                    <Input value={editAssignment.topic} onChange={(e) => setEditAssignment({ ...editAssignment, topic: e.target.value })} />
                                    <Label>Description</Label>
                                    <RichTextEditor
                                        value={editAssignment.description || ''}
                                        onChange={(content) => setEditAssignment({ ...editAssignment, description: content })}
                                        placeholder="Assignment instructions..."
                                        className="min-h-[150px]"
                                    />
                                    <Label>Due Date</Label>
                                    <Input type="date" value={editAssignment.dueDate} onChange={(e) => setEditAssignment({ ...editAssignment, dueDate: e.target.value })} />
                                    <Label>Department (Optional)</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editAssignment.department || ''}
                                        onChange={(e) => setEditAssignment({ ...editAssignment, department: e.target.value })}
                                        disabled={role === 'dept_admin'}
                                    >
                                        {role !== 'dept_admin' && <option value="">All Students</option>}
                                        {departmentsList.map((d: any) => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button onClick={handleUpdateAssignment}>Update</Button>
                            </DialogContent>
                        )}
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(assignment._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto py-10 space-y-8 animate-fade-in">
            <SEO title="Organization Dashboard" description="Manage your organization, students, and curriculum." />


            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-600/10 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md hover:border-blue-600/20">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Welcome back, {sessionStorage.getItem('mName') || 'Admin'}! <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                    </h2>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {role === 'dept_admin' && userDeptName ? `Managing the ${userDeptName} department's growth and student success.` : "Manage your organization's growth and student success with ease."}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {role === 'dept_admin' && userDeptName ? `${userDeptName} Department Dashboard` : 'Organization Dashboard'}
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage students, assignments, and announcements</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Bulk Upload</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bulk Student Upload</DialogTitle>
                                <DialogDescription>
                                    Columns should be: **Name, Email, Password, Department, Section, Roll No**.
                                </DialogDescription>
                                <div className="mt-2 p-3 bg-muted rounded-lg flex justify-between items-center text-sm">
                                    <span className="font-medium">Remaining Capacity:</span>
                                    <Badge variant={stats.studentLimit - stats.studentCount > 0 ? "secondary" : "destructive"}>
                                        {Math.max(0, stats.studentLimit - stats.studentCount)} Students
                                    </Badge>
                                </div>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="excel-file">Choose Excel File</Label>
                                    <Input
                                        id="excel-file"
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading && <p className="text-sm text-primary animate-pulse">Processing upload...</p>}
                                </div>
                                <div className="p-4 bg-muted rounded-lg text-xs space-y-2">
                                    <p className="font-semibold">Instructions:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Download the template to see the correct format.</li>
                                        <li>Email must be unique for each student.</li>
                                        <li>If password is blank, "Student@123" will be used.</li>
                                    </ul>
                                </div>
                                <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                                    Download Template
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* <Button>Settings</Button> */}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

                <AdminStatCard
                    title="Total Students"
                    value={role === 'dept_admin' ? students.length : stats.studentCount}
                    icon={Users}
                    description="+20% from last month"
                    className="border-l-4 border-l-emerald-500"
                />
                <AdminStatCard
                    title="Active Assignments"
                    value={role === 'dept_admin' ? assignments.length : stats.assignmentCount}
                    icon={FileText}
                    description="5 due this week"
                    className="border-l-4 border-l-blue-500"
                />
                <AdminStatCard
                    title="Students Placed"
                    value={role === 'dept_admin' ? students.filter((s: any) => s.studentDetails?.isPlacementClosed).length : (stats.placedCount || 0)}
                    icon={Briefcase}
                    description="Career success"
                    className="border-l-4 border-l-indigo-500"
                />
                {role !== 'dept_admin' && (
                    <AdminStatCard
                        title="Submissions"
                        value={stats.submissionCount}
                        icon={BarChart}
                        description="Pending grading"
                        className="border-l-4 border-l-amber-500"
                    />
                )}
            </div>

            <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
                {/* <TabsList className="flex flex-wrap h-auto w-full gap-1 p-1 bg-muted rounded-xl mb-6">
                    {role !== 'dept_admin' && (
                        <>
                            <TabsTrigger value="departments" className="flex-1 min-w-[120px]">Departments</TabsTrigger>
                            
                        </>
                    )}
                    {role === 'org_admin' && (
                        <>
                            <TabsTrigger value="staff" className="flex-1 min-w-[120px]">Staff</TabsTrigger>
                            <TabsTrigger value="approvals" className="flex-1 min-w-[120px]">Approvals</TabsTrigger>
                            <TabsTrigger value="activity" className="flex-1 min-w-[120px]">Activity</TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="students" className="flex-1 min-w-[120px]">Students</TabsTrigger>
                    <TabsTrigger value="courses" className="flex-1 min-w-[120px]">Courses</TabsTrigger>
                    <TabsTrigger value="assignments" className="flex-1 min-w-[120px]">Assignments</TabsTrigger>
                    <TabsTrigger value="meetings" className="flex-1 min-w-[120px]">Meetings</TabsTrigger>
                    <TabsTrigger value="projects" className="flex-1 min-w-[120px]">Projects/Research</TabsTrigger>
                    <TabsTrigger value="materials" className="flex-1 min-w-[120px]">Materials</TabsTrigger>
                    <TabsTrigger value="notices" className="flex-1 min-w-[120px]">Noticeboard</TabsTrigger>
                    <TabsTrigger value="career" className="flex-1 min-w-[120px]"><Briefcase className="w-3.5 h-3.5 mr-1" />Career & Placement</TabsTrigger>

                </TabsList> */}

                {/* DEPARTMENTS TAB */}
                <TabsContent value="departments" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Departments Management */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Departments</CardTitle>
                                    <CardDescription>Create and manage organizational departments.</CardDescription>
                                </div>
                                <Dialog open={openDeptDialog} onOpenChange={setOpenDeptDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenDeptDialog(true)}>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" /> Add Dept
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Department</DialogTitle>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Department Name</Label>
                                                <Input
                                                    value={newDept.name}
                                                    onChange={(e) =>
                                                        setNewDept({ ...newDept, name: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={newDept.description}
                                                    onChange={(e) =>
                                                        setNewDept({ ...newDept, description: e.target.value })
                                                    }
                                                />
                                            </div>

                                            <Button onClick={handleCreateDepartment}>
                                                Create Department
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {departmentsList.length > 0 ? departmentsList.map((dept: any) => (
                                        <div key={dept._id} className="p-3 border rounded-lg flex justify-between items-center bg-muted/20">
                                            <div>
                                                <p className="font-semibold text-sm">{dept.name}</p>
                                                <p className="text-xs text-muted-foreground">{dept.description}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteDepartment(dept._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-muted-foreground py-4">No departments created yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dept Admins Management */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Department Admins</CardTitle>
                                    <CardDescription>Assign admins to specific departments.</CardDescription>
                                </div>
                                <Dialog open={openDeptAdminDialog} onOpenChange={setOpenDeptAdminDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenDeptAdminDialog(true)}>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" /> Add Admin
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Department Admin</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Full Name</Label>
                                                <Input value={newDeptAdmin.name} onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, name: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Email</Label>
                                                <Input value={newDeptAdmin.email} onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, email: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Password</Label>
                                                <Input type="password" value={newDeptAdmin.password} onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, password: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Department</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newDeptAdmin.departmentId}
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, departmentId: e.target.value })}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentsList.map((d: any) => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Course Creation Limit</Label>
                                                <Input 
                                                    type="number" 
                                                    value={newDeptAdmin.courseLimit} 
                                                    onChange={(e) => setNewDeptAdmin({ ...newDeptAdmin, courseLimit: parseInt(e.target.value) || 0 })} 
                                                    placeholder="Max courses this admin can create"
                                                />
                                            </div>
                                            <Button onClick={handleAddDeptAdmin}>Add Admin</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {deptAdmins.length > 0 ? deptAdmins.map((admin: any) => (
                                        <div key={admin._id} className="p-3 border rounded-lg flex justify-between items-center bg-muted/20">
                                            <div>
                                                <p className="font-semibold text-sm">{admin.mName}</p>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">{admin.department?.name || 'No Dept'}</span>
                                                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                                                </div>
                                                <div className="flex gap-4 mt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Courses Created</span>
                                                        <span className="text-xs font-bold text-blue-600">{admin.coursesCreatedCount || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Courses Left</span>
                                                        <span className={`text-xs font-bold ${((admin.courseLimit || 0) - (admin.coursesCreatedCount || 0)) <= 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                                                            {Math.max(0, (admin.courseLimit || 0) - (admin.coursesCreatedCount || 0))}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Limit</span>
                                                        <span className="text-xs font-bold">{admin.courseLimit || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteDeptAdmin(admin._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-muted-foreground py-4">No department admins assigned yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* APPROVALS TAB */}
                {role === 'org_admin' && (
                    <TabsContent value="approvals" className="space-y-4">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-blue-500" /> Pending Approval Requests
                                </CardTitle>
                                <CardDescription>Review and approve courses submitted by department admins or other staff members.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 space-y-4">
                                {courses.filter((c: any) => c.approvalStatus === 'pending').length > 0 ? (
                                    <div className="grid gap-4">
                                        {courses.filter((c: any) => c.approvalStatus === 'pending').map((course: any) => (
                                            <div key={course._id} className="group p-6 border rounded-2xl bg-card hover:shadow-md transition-all duration-300 border-blue-100 hover:border-blue-200">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-xl text-foreground group-hover:text-blue-600 transition-colors capitalize">
                                                                {course.title || course.mainTopic}
                                                            </h3>
                                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                                {departmentsList.find(d => d._id === course.department || d.name === course.department)?.name || course.department || 'General'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-muted-foreground line-clamp-2 text-sm italic">"{course.description || 'No description provided'}"</p>
                                                        <div className="flex flex-wrap gap-4 mt-3 text-xs font-semibold text-muted-foreground items-center">
                                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                                                <span>{course.topics?.length || 0} Lessons</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                <FileQuestion className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span>{course.quizzes?.length || 0} Quizzes</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span>Submitted: {new Date(course.updatedAt || course.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="flex-1 md:flex-none h-10 px-4 rounded-xl border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            onClick={() => setPreviewCourse({ ...course })}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" /> Preview
                                                        </Button>
                                                        <Button 
                                                            className="flex-1 md:flex-none h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"
                                                            size="sm"
                                                            onClick={() => handleReviewOrgCourse(course._id, 'approved', 'Course approved for students.')}
                                                        >
                                                            <Check className="w-4 h-4 mr-2" /> Approve
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            className="flex-1 md:flex-none h-10 px-4 rounded-xl text-destructive hover:bg-red-50 hover:text-red-600"
                                                            onClick={async () => {
                                                                const result = await Swal.fire({
                                                                    title: 'Reject this course?',
                                                                    input: 'textarea',
                                                                    inputLabel: 'Feedback for the creator',
                                                                    inputPlaceholder: 'Explain what needs to be changed before approval...',
                                                                    showCancelButton: true,
                                                                    confirmButtonText: 'Reject Course',
                                                                    confirmButtonColor: '#dc2626',
                                                                    cancelButtonText: 'Cancel',
                                                                    customClass: {
                                                                        popup: 'rounded-3xl',
                                                                        confirmButton: 'rounded-xl',
                                                                        cancelButton: 'rounded-xl'
                                                                    }
                                                                });

                                                                if (result.isConfirmed) {
                                                                    await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
                                                                }
                                                            }}
                                                        >
                                                            <X className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl animate-in fade-in zoom-in duration-500">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">All Caught Up!</h3>
                                        <p className="text-muted-foreground text-center max-w-xs mt-2">
                                            There are no courses waiting for your approval at this time.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* STUDENTS TAB */}
                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Manage Students
                                {role !== 'dept_admin' && (
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary" className="font-semibold">
                                            {stats.studentCount} / {stats.studentLimit} Students Used
                                        </Badge>
                                        <Dialog open={openLimitIncreaseDialog} onOpenChange={setOpenLimitIncreaseDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">Request Increase</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Request Student Limit Increase</DialogTitle>
                                                    <DialogDescription>
                                                        Current Limit: {stats.studentLimit} students.
                                                        Submit a request to increase your student capacity.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label>Requested Slot</Label>
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            value={limitIncreaseData.requestedSlot}
                                                            onChange={(e) => setLimitIncreaseData({ ...limitIncreaseData, requestedSlot: parseInt(e.target.value) })}
                                                        >
                                                            <option value={1}>Slot 1 (50 Students)</option>
                                                            <option value={2}>Slot 2 (100 Students)</option>
                                                            <option value={3}>Slot 3 (150 Students)</option>
                                                            <option value={4}>Slot 4 (200 Students)</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Custom Limit (Optional - overrides slot)</Label>
                                                        <Input
                                                            type="number"
                                                            value={limitIncreaseData.requestedCustomLimit}
                                                            onChange={(e) => setLimitIncreaseData({ ...limitIncreaseData, requestedCustomLimit: parseInt(e.target.value) })}
                                                            placeholder="0 for none"
                                                        />
                                                    </div>
                                                    <Button onClick={handleLimitIncreaseRequest}>Submit Request</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </CardTitle>
                            <CardDescription>Add, view, and manage student accounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <Input
                                    placeholder="Search students..."
                                    className="max-w-sm"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                />
                                <Dialog open={openStudentDialog} onOpenChange={setOpenStudentDialog}>
                                    <DialogTrigger asChild onClick={() => setOpenStudentDialog(true)}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" /> Add Student
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="flex justify-between items-center">
                                                Add New Student
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {stats.studentCount} / {stats.studentLimit} used
                                                </span>
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Name</Label>
                                                <Input className="col-span-3" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Email</Label>
                                                <Input className="col-span-3" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Password</Label>
                                                <Input className="col-span-3" type="password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Department</Label>
                                                <select
                                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={newStudent.department}
                                                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departmentsList.map((d: any) => (
                                                        <option key={d._id} value={d._id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Class</Label>
                                                <Input className="col-span-3" value={newStudent.studentClass} onChange={(e) => setNewStudent({ ...newStudent, studentClass: e.target.value })} placeholder="e.g. 10th" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Section</Label>
                                                <Input className="col-span-3" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label className="text-right">Academic Year</Label>
                                                <Input className="col-span-3" value={newStudent.academicYear} onChange={(e) => setNewStudent({ ...newStudent, academicYear: e.target.value })} placeholder="e.g. 2023-2024" />
                                            </div>
                                        </div>
                                        <Button onClick={handleAddStudent}>Save Student</Button>
                                    </DialogContent>
                                </Dialog>
                            </div>


                            {/* Student List */}
                            <div className="space-y-2">
                                {students.length > 0 ? (
                                    students.filter((s: any) =>
                                        (s.mName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                                        (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                                    ).map((student: any) => (
                                        <div key={student._id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    {student.mName?.substring(0, 2).toUpperCase() || 'ST'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{student.mName || student.email}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.studentDetails?.studentClass && ` • Class ${student.studentDetails.studentClass}`}
                                                        {student.studentDetails?.section && ` • Section ${student.studentDetails.section}`}
                                                        {student.studentDetails?.rollNo && ` • Roll ${student.studentDetails.rollNo}`}
                                                        {student.studentDetails?.academicYear && ` • Year ${student.studentDetails.academicYear}`}
                                                    </p>
                                                    {(student.studentDetails?.placementCompany || student.studentDetails?.isPlacementClosed) && (
                                                        <p className="text-xs font-semibold text-emerald-600 mt-1">
                                                            {student.studentDetails?.isPlacementClosed ? 'Placed' : 'Placement Info'}: {student.studentDetails?.placementPosition ? student.studentDetails?.placementPosition + ' @' : ''} {student.studentDetails?.placementCompany}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Created: {new Date(student.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditStudent(student)}>Edit</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Student</DialogTitle>
                                                        </DialogHeader>
                                                        {editStudent && (
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Name</Label>
                                                                    <Input className="col-span-3" value={editStudent.mName} onChange={(e) => setEditStudent({ ...editStudent, mName: e.target.value })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Email</Label>
                                                                    <Input className="col-span-3" value={editStudent.email} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Department</Label>
                                                                    <select
                                                                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        value={editStudent.studentDetails?.department || ''}
                                                                        onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, department: e.target.value } })}
                                                                    >
                                                                        <option value="">Select Department</option>
                                                                        {departmentsList.map((d: any) => (
                                                                            <option key={d._id} value={d._id}>{d.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Class</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.studentClass || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, studentClass: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Section</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.section || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, section: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Roll No</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.rollNo || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, rollNo: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Academic Year</Label>
                                                                    <Input className="col-span-3" value={editStudent.studentDetails?.academicYear || ''} onChange={(e) => setEditStudent({ ...editStudent, studentDetails: { ...editStudent.studentDetails, academicYear: e.target.value } })} placeholder="e.g. 2023-2024" />
                                                                </div>
                                                                <Button onClick={handleUpdateStudent}>Update Student</Button>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setPlacementStudent(student)}>
                                                            <Briefcase className="w-4 h-4 mr-2" /> Placement
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Update Placement Details</DialogTitle>
                                                        </DialogHeader>
                                                        {placementStudent && (
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Company</Label>
                                                                    <Input className="col-span-3" value={placementStudent.studentDetails?.placementCompany || ''} onChange={(e) => setPlacementStudent({ ...placementStudent, studentDetails: { ...placementStudent.studentDetails, placementCompany: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Position</Label>
                                                                    <Input className="col-span-3" value={placementStudent.studentDetails?.placementPosition || ''} onChange={(e) => setPlacementStudent({ ...placementStudent, studentDetails: { ...placementStudent.studentDetails, placementPosition: e.target.value } })} />
                                                                </div>
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label className="text-right">Status</Label>
                                                                    <div className="col-span-3 flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 mr-2"
                                                                            checked={placementStudent.studentDetails?.isPlacementClosed || false}
                                                                            onChange={(e) => setPlacementStudent({ ...placementStudent, studentDetails: { ...placementStudent.studentDetails, isPlacementClosed: e.target.checked } })}
                                                                        />
                                                                        <Label>Placement Closed</Label>
                                                                    </div>
                                                                </div>
                                                                <Button onClick={handleUpdatePlacement}>Save Placement</Button>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student._id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No students added yet. Click "Add Student" to get started.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* COURSES TAB */}
                <TabsContent value="courses" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Courses</CardTitle>
                            <CardDescription>Create and assign courses to your students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert className="border-primary/20 bg-primary/5">
                                <AlertTitle>Recommended organization flow</AlertTitle>
                                <AlertDescription>
                                    Draft the course, assign a department, review it internally, then publish it to the student portal.
                                    Department admins stay locked to their own department, while organization admins can publish across departments.
                                </AlertDescription>
                            </Alert>
                            <div className="flex justify-between gap-2">
                                <Input
                                    placeholder="Search courses..."
                                    className="max-w-sm"
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    {role === 'dept_admin' && (
                                        <Dialog open={openDeptCourseLimitDialog} onOpenChange={setOpenDeptCourseLimitDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline">
                                                    <Plus className="w-4 h-4 mr-2" /> Request Limit Increase
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Request Course Limit Increase</DialogTitle>
                                                    <DialogDescription>
                                                        Submit a request to your organization's admin to increase your course creation capacity.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label>Requested Additional Courses</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={deptCourseLimitData.requestedCourseLimit}
                                                            onChange={(e) => setDeptCourseLimitData({ ...deptCourseLimitData, requestedCourseLimit: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                    <Button onClick={handleDeptCourseLimitRequest}>Submit Request</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {(orgSettings?.allowAICreation !== false) && (
                                        <Button variant="outline" onClick={() => window.location.href = '/dashboard/generate-course'}>
                                            <Sparkles className="w-4 h-4 mr-2" /> AI Generate
                                        </Button>
                                    )}
                                    {(orgSettings?.allowManualCreation !== false) && (
                                        <Dialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>
                                            <DialogTrigger asChild onClick={() => {
                                                setNewCourse(role === 'dept_admin'
                                                    ? { ...createEmptyCourse(), department: getDeptScopedDepartment() }
                                                    : createEmptyCourse());
                                                setOpenCourseDialog(true);
                                            }}>
                                                <Button>
                                                    <Plus className="w-4 h-4 mr-2" /> Create Course
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Create New Course</DialogTitle>
                                                </DialogHeader>

                                                <CourseForm
                                                    course={newCourse}
                                                    setCourse={setNewCourse}
                                                    onSave={() => handleCreateCourse(newCourse)}
                                                    departments={departmentsList}
                                                    role={role}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </div>

                            {/* Course List */}
                            <div className="space-y-4">
                                {courses.length > 0 ? (
                                    courses.filter((c: any) =>
                                        (c.title || c.mainTopic || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
                                        (c.description || '').toLowerCase().includes(courseSearch.toLowerCase())
                                    ).map((course: any) => {
                                        const title = course.title || course.mainTopic;
                                        const description = course.description || (course.content ? "AI Generated Course" : "");
                                        let topicCount = 0;
                                        let quizCount = 0;
                                        // Both OrgCourse and AI Course now support approval workflow
                                        const approvalStatus = course.approvalStatus || (course.isPublished === false ? 'pending' : 'approved');
                                        const published = course.isPublished !== undefined ? Boolean(course.isPublished) : (course.content ? false : true); // AI courses default to unpublished

                                        if (course.topics) {
                                            topicCount = course.topics.length;
                                            quizCount = course.quizzes?.length || 0;
                                        } else if (course.content) {
                                            try {
                                                const content = JSON.parse(course.content);
                                                topicCount = content.course_topics?.length || 0;
                                                quizCount = content.quizzes?.length || 0;
                                            } catch (e) {
                                                console.error("Error parsing course content", e);
                                            }
                                        }

                                        return (
                                            <div key={course._id} className="p-4 border rounded-lg bg-card">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg capitalize">{title}</h3>
                                                        <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: description }} />
                                                        <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
                                                            <span>{topicCount} Topics</span>
                                                            {quizCount > 0 && <span>{quizCount} Quizzes</span>}
                                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                {course.department ? `Dept: ${departmentsList.find(d => d._id === course.department || d.name === course.department)?.name || course.department}` : (course.content ? 'AI Generated' : 'All students')}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                                            {approvalStatus === 'pending' && (
                                                                <Badge variant="outline" className="gap-1">
                                                                    <Clock className="w-3.5 h-3.5" /> Pending approval
                                                                </Badge>
                                                            )}
                                                            {approvalStatus === 'approved' && (
                                                                <Badge className="bg-emerald-600 text-white border-0 gap-1">
                                                                    <Check className="w-3.5 h-3.5" /> Approved
                                                                </Badge>
                                                            )}
                                                            {approvalStatus === 'rejected' && (
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <X className="w-3.5 h-3.5" /> Rejected
                                                                </Badge>
                                                            )}
                                                            <Badge variant={published ? "secondary" : "outline"} className={published ? "bg-blue-500/10 text-blue-700 border-blue-200" : ""}>
                                                                {published ? 'Published' : 'Unpublished'}
                                                            </Badge>
                                                        </div>
                                                        {quizCount > 0 && quizReportsMap[String(course._id)] && (
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                {quizReportsMap[String(course._id)]?.quizSettings?.examMode && (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <Shield className="w-3.5 h-3.5" /> Secure
                                                                    </Badge>
                                                                )}
                                                                <Badge variant="outline">Attempts: {quizReportsMap[String(course._id)]?.attemptCount || 0}</Badge>
                                                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                                                    Passed: {quizReportsMap[String(course._id)]?.passedCount || 0}
                                                                </Badge>
                                                                {(quizReportsMap[String(course._id)]?.flaggedCount || 0) > 0 && (
                                                                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1">
                                                                        <AlertTriangle className="w-3.5 h-3.5" /> Flagged: {quizReportsMap[String(course._id)]?.flaggedCount || 0}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setPreviewCourse({ ...course })}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        {role === 'org_admin' && (approvalStatus === 'pending' || approvalStatus === 'rejected') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleReviewOrgCourse(course._id, 'approved', '')}
                                                            >
                                                                <Check className="w-4 h-4 mr-1" /> Approve
                                                            </Button>
                                                        )}
                                                        {role === 'org_admin' && approvalStatus !== 'rejected' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={async () => {
                                                                    const result = await Swal.fire({
                                                                        title: 'Reject this course?',
                                                                        input: 'textarea',
                                                                        inputLabel: 'Reason (optional)',
                                                                        inputPlaceholder: 'Write a short note for the staff member...',
                                                                        showCancelButton: true,
                                                                        confirmButtonText: 'Reject',
                                                                        confirmButtonColor: '#dc2626'
                                                                    });

                                                                    if (result.isConfirmed) {
                                                                        await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
                                                                    }
                                                                }}
                                                            >
                                                                <X className="w-4 h-4 mr-1" /> Reject
                                                            </Button>
                                                        )}
                                                        {role === 'org_admin' && approvalStatus === 'approved' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={async () => {
                                                                    const nextPublished = !published;
                                                                    const result = await Swal.fire({
                                                                        title: nextPublished ? 'Publish this course?' : 'Unpublish this course?',
                                                                        text: nextPublished
                                                                            ? 'Students will be able to see and open this course in the student portal.'
                                                                            : 'Students will no longer see this course in the student portal.',
                                                                        showCancelButton: true,
                                                                        confirmButtonText: nextPublished ? 'Publish' : 'Unpublish',
                                                                        confirmButtonColor: nextPublished ? '#16a34a' : '#dc2626'
                                                                    });

                                                                    if (result.isConfirmed) {
                                                                        await handlePublishOrgCourse(course._id, nextPublished);
                                                                    }
                                                                }}
                                                            >
                                                                {published ? 'Unpublish' : 'Publish'}
                                                            </Button>
                                                        )}
                                                        {quizCount > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Quiz report"
                                                                onClick={() => {
                                                                    const report = quizReportsMap[String(course._id)];
                                                                    const normalized = normalizeCourseForEdit(course);
                                                                    setSelectedQuizReport(report || {
                                                                        courseId: String(course._id),
                                                                        title,
                                                                        questionCount: quizCount,
                                                                        quizSettings: normalized.quizSettings,
                                                                        attemptCount: 0,
                                                                        passedCount: 0,
                                                                        flaggedCount: 0,
                                                                        attempts: []
                                                                    });
                                                                    setOpenQuizReportDialog(true);
                                                                }}
                                                            >
                                                                <BarChart className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" onClick={async () => {
                                                            const initialDescription = "Generating assignment description...";
                                                            
                                                            setNewAssignment({
                                                                topic: title,
                                                                description: initialDescription,
                                                                dueDate: '',
                                                                department: course.department || ''
                                                            });
                                                            setOpenAssignmentDialog(true);

                                                            try {
                                                                const res = await axios.post(`${serverURL}/api/prompt`, {
                                                                    prompt: `Write a professional 1-2 sentence assignment description for a course titled "${title}". The description should encourage the student to complete the assignment to test their understanding. Return strictly the text.`,
                                                                    systemInstruction: "You are an educational assistant. Return only the 1-2 sentence assignment description text. No quotes, no conversational filler."
                                                                });

                                                                if (res.data.success && res.data.generatedText) {
                                                                    setNewAssignment(prev => ({
                                                                        ...prev,
                                                                        description: res.data.generatedText
                                                                    }));
                                                                } else {
                                                                    setNewAssignment(prev => ({
                                                                        ...prev,
                                                                        description: description
                                                                    }));
                                                                }
                                                            } catch (e) {
                                                                console.error("Failed to generate assignment description:", e);
                                                                setNewAssignment(prev => ({
                                                                    ...prev,
                                                                    description: description
                                                                }));
                                                            }
                                                        }}>
                                                            Create Assignment
                                                        </Button>
                                                        {course.topics ? (
                                                            <Button variant="ghost" size="sm" onClick={() => setEditCourse(normalizeCourseForEdit(course))}>Edit</Button>
                                                        ) : course.content ? (
                                                            <Button variant="ghost" size="sm" onClick={() => setEditAICourse({ ...course })}>Edit</Button>
                                                        ) : null}
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course._id)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No courses created yet. Create your first course or use AI to generate one.</p>
                                    </div>
                                )}
                            </div>

                            <Dialog
                                open={openQuizReportDialog}
                                onOpenChange={(open) => {
                                    setOpenQuizReportDialog(open);
                                    if (!open) {
                                        setSelectedQuizReport(null);
                                        setExpandedQuizAttemptId('');
                                    }
                                }}
                            >
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Quiz Report</DialogTitle>
                                        <DialogDescription>
                                            Attempts, scores, cooldowns, and malpractice flags for this course.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {quizReportsLoading && (
                                        <div className="text-sm text-muted-foreground">Loading reports...</div>
                                    )}

                                    {!quizReportsLoading && selectedQuizReport && (() => {
                                        const settings = {
                                            ...defaultQuizSettings,
                                            ...(selectedQuizReport.quizSettings || {}),
                                            proctoring: {
                                                ...defaultQuizSettings.proctoring,
                                                ...(selectedQuizReport.quizSettings?.proctoring || {})
                                            }
                                        };
                                        const attempts = Array.isArray(selectedQuizReport.attempts) ? selectedQuizReport.attempts : [];

                                        return (
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{selectedQuizReport.title || 'Course'}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {selectedQuizReport.questionCount || 0} questions in bank, difficulty: {settings.difficultyMode}, pass mark: {settings.passPercentage}%.
                                                        </p>
                                                    </div>
                                                    {settings.examMode ? (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Shield className="w-4 h-4" /> Secure exam
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">Standard quiz</Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="p-3 rounded-lg border bg-muted/20">
                                                        <div className="text-xs text-muted-foreground">Attempt policy</div>
                                                        <div className="font-semibold text-sm">{settings.attemptLimit} attempts, cooldown {settings.cooldownMinutes} min</div>
                                                    </div>
                                                    <div className="p-3 rounded-lg border bg-muted/20">
                                                        <div className="text-xs text-muted-foreground">Summary</div>
                                                        <div className="font-semibold text-sm">
                                                            Attempts {selectedQuizReport.attemptCount || 0}, passed {selectedQuizReport.passedCount || 0}, flagged {selectedQuizReport.flaggedCount || 0}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-lg border bg-muted/20">
                                                        <div className="text-xs text-muted-foreground">Shuffle</div>
                                                        <div className="font-semibold text-sm">
                                                            Questions {settings.shuffleQuestions ? 'on' : 'off'}, options {settings.shuffleOptions ? 'on' : 'off'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border rounded-lg overflow-hidden">
                                                    <div className="grid grid-cols-12 gap-2 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                                                        <div className="col-span-3">Student</div>
                                                        <div className="col-span-1">Try</div>
                                                        <div className="col-span-2">Score</div>
                                                        <div className="col-span-2">Result</div>
                                                        <div className="col-span-2">Flags</div>
                                                        <div className="col-span-2">Submitted</div>
                                                    </div>
                                                    {attempts.length === 0 ? (
                                                        <div className="p-4 text-sm text-muted-foreground">No attempts yet.</div>
                                                    ) : (
                                                        <div className="divide-y">
                                                            {attempts.map((a: any) => {
                                                                const submitted = a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '-';
                                                                const eventSummary = a.eventSummary || {};
                                                                const eventBadges = Object.entries(eventSummary).slice(0, 3);
                                                                const isExpanded = expandedQuizAttemptId === String(a.attemptId);
                                                                return (
                                                                    <div key={a.attemptId} className="border-t first:border-t-0">
                                                                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center">
                                                                            <div className="col-span-3">
                                                                                <div className="font-medium truncate">{a.studentName || 'Student'}</div>
                                                                                <div className="text-xs text-muted-foreground truncate">{a.studentEmail || ''}</div>
                                                                            </div>
                                                                            <div className="col-span-1 text-muted-foreground">{a.attemptNumber || 1}</div>
                                                                            <div className="col-span-2">{a.score || 0}/{a.totalQuestions || 0} ({a.percentage || 0}%)</div>
                                                                            <div className="col-span-2">
                                                                                {a.passed ? (
                                                                                    <Badge className="bg-emerald-600 text-white border-0">Passed</Badge>
                                                                                ) : (
                                                                                    <Badge variant="outline">Failed</Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="col-span-2 flex items-center gap-2">
                                                                                {a.malpracticeFlag ? (
                                                                                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1">
                                                                                        <AlertTriangle className="w-3.5 h-3.5" /> Malpractice
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <span className="text-xs text-muted-foreground">None</span>
                                                                                )}
                                                                                <span className="text-xs text-muted-foreground">{a.securityEventCount || 0} events</span>
                                                                            </div>
                                                                            <div className="col-span-2 text-xs text-muted-foreground">
                                                                                <div>{submitted}</div>
                                                                                {eventBadges.length > 0 && (
                                                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                                                        {eventBadges.map(([eventType, count]) => (
                                                                                            <Badge key={`${a.attemptId}-${eventType}`} variant="outline" className="text-[10px]">
                                                                                                {eventType}: {String(count)}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                                {(a.securityEvents?.length || 0) > 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="mt-2 text-[11px] font-semibold text-primary"
                                                                                        onClick={() => setExpandedQuizAttemptId(isExpanded ? '' : String(a.attemptId))}
                                                                                    >
                                                                                        {isExpanded ? 'Hide details' : 'View details'}
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {isExpanded && (a.securityEvents?.length || 0) > 0 && (
                                                                            <div className="border-t bg-muted/20 px-3 py-3">
                                                                                <div className="space-y-2">
                                                                                    {a.securityEvents.map((event: any, index: number) => (
                                                                                        <div key={`${a.attemptId}-event-${index}`} className="rounded-lg border bg-background px-3 py-2">
                                                                                            <div className="flex items-center justify-between gap-2">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <Badge variant="outline">{event.type}</Badge>
                                                                                                    <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'}>
                                                                                                        {event.severity}
                                                                                                    </Badge>
                                                                                                </div>
                                                                                                <span className="text-[11px] text-muted-foreground">
                                                                                                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : '-'}
                                                                                                </span>
                                                                                            </div>
                                                                                            {event.details && (
                                                                                                <p className="mt-2 text-xs text-muted-foreground">{event.details}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STAFF TAB */}
                {role === 'org_admin' && (
                    <TabsContent value="staff" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Staff Directory</CardTitle>
                                <CardDescription>Maintain department admins and review their access, load, and activity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {deptAdmins.length > 0 ? (
                                        deptAdmins.map((admin: any) => {
                                            const departmentLabel = admin.department?.name || admin.department?.title || admin.department || 'No department';
                                            const lastLogin = admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'No login activity yet';
                                            const coursesLeft = Math.max(0, (admin.courseLimit || 0) - (admin.coursesCreatedCount || 0));

                                            return (
                                                <div key={admin._id} className="rounded-xl border bg-card p-4 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-base truncate">{admin.mName || 'Staff Member'}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{admin.email || 'No email'}</p>
                                                        </div>
                                                        <Badge variant="secondary">Dept Admin</Badge>
                                                    </div>
                                                    <div className="mt-4 space-y-3 text-sm">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">Department</span>
                                                            <span className="font-medium text-right">{departmentLabel}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">Courses created</span>
                                                            <span className="font-medium">{admin.coursesCreatedCount || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">Courses left</span>
                                                            <span className={`font-medium ${coursesLeft <= 0 ? 'text-destructive' : ''}`}>{coursesLeft}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">Course limit</span>
                                                            <span className="font-medium">{admin.courseLimit || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-muted-foreground">Last login</span>
                                                            <span className="font-medium text-right">{lastLogin}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={async () => {
                                                                const result = await Swal.fire({
                                                                    title: 'Request course limit change',
                                                                    input: 'number',
                                                                    inputLabel: `Current limit: ${admin.courseLimit || 0}`,
                                                                    inputAttributes: { min: '0', step: '1' },
                                                                    inputValue: String(admin.courseLimit || 0),
                                                                    showCancelButton: true,
                                                                    confirmButtonText: 'Send Request'
                                                                });

                                                                if (!result.isConfirmed) return;
                                                                const requestedCourseLimit = parseInt(String(result.value || ''), 10);
                                                                if (!Number.isFinite(requestedCourseLimit) || requestedCourseLimit < 0) {
                                                                    toast({ title: "Error", description: "Please enter a valid limit", variant: "destructive" });
                                                                    return;
                                                                }

                                                                try {
                                                                    const requesterId = sessionStorage.getItem('uid') || sessionStorage.getItem('orgId') || '';
                                                                    const res = await axios.post(`${serverURL}/api/org/staff/course-limit/request`, {
                                                                        organizationId: orgId,
                                                                        requesterId,
                                                                        staffId: admin._id,
                                                                        requestedCourseLimit
                                                                    });
                                                                    if (res.data?.success) {
                                                                        toast({ title: "Request Sent", description: res.data.message || "Request submitted" });
                                                                    } else {
                                                                        toast({ title: "Error", description: res.data?.message || "Failed to submit request", variant: "destructive" });
                                                                    }
                                                                } catch (e: any) {
                                                                    toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed", variant: "destructive" });
                                                                }
                                                            }}
                                                        >
                                                            Request Limit Change
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                            No department admins found for this organization.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* APPROVALS TAB */}
                {role === 'org_admin' && (
                    <TabsContent value="approvals" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ArrowUpCircle className="w-5 h-5 text-blue-500" /> Department Course Limit Requests
                                </CardTitle>
                                <CardDescription>Review and approve course limit increase requests from department admins.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(() => {
                                    const pendingLimitRequests = deptLimitRequests.filter((r: any) => r.status === 'pending');
                                    return (
                                        <div className="space-y-3">
                                            {pendingLimitRequests.length === 0 ? (
                                                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                                    No course limit requests pending.
                                                </div>
                                            ) : (
                                                pendingLimitRequests.map((request: any) => (
                                                    <div key={request._id} className="rounded-xl border bg-card p-4 shadow-sm">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <h3 className="font-semibold">{request.deptAdminId?.name || 'Department Admin'}</h3>
                                                                <p className="mt-1 text-sm text-muted-foreground">Requested Limit Increase: <span className="font-medium text-foreground">{request.requestedCourseLimit}</span> courses</p>
                                                                <p className="text-xs text-muted-foreground">Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none"
                                                                    size="sm"
                                                                    onClick={() => handleProcessDeptCourseLimitRequest(request._id, 'approved')}
                                                                >
                                                                    <Check className="w-4 h-4 mr-1" /> Approve
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="bg-red-50 text-red-600 hover:bg-red-100 border-none"
                                                                    size="sm"
                                                                    onClick={async () => {
                                                                        const result = await Swal.fire({
                                                                            title: 'Reject Request?',
                                                                            input: 'text',
                                                                            inputLabel: 'Reason (optional)',
                                                                            showCancelButton: true,
                                                                            confirmButtonText: 'Reject',
                                                                            confirmButtonColor: '#dc2626'
                                                                        });
                                                                        if (result.isConfirmed) {
                                                                            await handleProcessDeptCourseLimitRequest(request._id, 'rejected', result.value || '');
                                                                        }
                                                                    }}
                                                                >
                                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Course Approvals</CardTitle>
                                <CardDescription>Approve or reject staff-created courses before publishing to the student portal.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(() => {
                                    const pendingCourses = courses.filter((c: any) => {
                                        const isOrgCourse = Boolean(c?.title && !c?.content);
                                        if (!isOrgCourse) return false;
                                        const approval = c?.approvalStatus || 'pending';
                                        return approval === 'pending';
                                    });

                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm text-muted-foreground">
                                                    Pending: <span className="font-semibold text-foreground">{pendingCourses.length}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={fetchCourses}>
                                                    Refresh
                                                </Button>
                                            </div>

                                            {pendingCourses.length === 0 ? (
                                                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                                    No courses waiting for approval.
                                                </div>
                                            ) : (
                                                pendingCourses.map((course: any) => {
                                                    const title = course.title || 'Untitled';
                                                    const dept = course.department ? `Dept: ${getDepartmentLabel(course.department) || course.department}` : 'All students';

                                                    return (
                                                        <div key={course._id} className="rounded-xl border bg-card p-4 shadow-sm">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="font-semibold truncate capitalize">{title}</h3>
                                                                        <Badge variant="outline" className="gap-1">
                                                                            <Clock className="w-3.5 h-3.5" /> Pending
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="mt-1 text-xs text-muted-foreground">{dept}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Button variant="ghost" size="sm" title="Preview" onClick={() => setPreviewCourse({ ...course })}>
                                                                        <Eye className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleReviewOrgCourse(course._id, 'approved', '')}
                                                                    >
                                                                        <Check className="w-4 h-4 mr-1" /> Approve
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={async () => {
                                                                            const result = await Swal.fire({
                                                                                title: 'Reject this course?',
                                                                                input: 'textarea',
                                                                                inputLabel: 'Reason (optional)',
                                                                                inputPlaceholder: 'Write a short note for the staff member...',
                                                                                showCancelButton: true,
                                                                                confirmButtonText: 'Reject',
                                                                                confirmButtonColor: '#dc2626'
                                                                            });

                                                                            if (result.isConfirmed) {
                                                                                await handleReviewOrgCourse(course._id, 'rejected', String(result.value || ''));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <X className="w-4 h-4 mr-1" /> Reject
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* ACTIVITY TAB */}
                {role === 'org_admin' && (
                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Staff Login Activity</CardTitle>
                                    <CardDescription>Recent successful sign-ins across your organization.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={fetchStaffLoginActivity} disabled={staffLoginLoading}>
                                    {staffLoginLoading ? 'Loading…' : 'Refresh'}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {staffLoginLogs.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                        {staffLoginLoading ? 'Loading activity…' : 'No activity yet.'}
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-12 gap-2 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                                            <div className="col-span-4">Staff</div>
                                            <div className="col-span-2">Role</div>
                                            <div className="col-span-3">When</div>
                                            <div className="col-span-3">IP</div>
                                        </div>
                                        <div className="divide-y">
                                            {staffLoginLogs.map((log: any) => (
                                                <div key={log._id} className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center">
                                                    <div className="col-span-4 min-w-0">
                                                        <div className="font-medium truncate">{log.name || 'Staff Member'}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{log.email || ''}</div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Badge variant="secondary">{log.role || 'user'}</Badge>
                                                    </div>
                                                    <div className="col-span-3 text-xs text-muted-foreground">
                                                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                                                    </div>
                                                    <div className="col-span-3 text-xs text-muted-foreground truncate" title={log.ipAddress || ''}>
                                                        {log.ipAddress || '-'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* ASSIGNMENTS TAB */}
                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Desk</CardTitle>
                            <CardDescription>Create assignments and monitor overdue, review-needed, and due-soon work.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Assignments</p>
                                    <p className="mt-2 text-2xl font-bold">{assignments.length}</p>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue</p>
                                    <p className="mt-2 text-2xl font-bold">{overdueAssignments.length}</p>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Due In 3 Days</p>
                                    <p className="mt-2 text-2xl font-bold">{dueSoonAssignments.length}</p>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Needs Review</p>
                                    <p className="mt-2 text-2xl font-bold">{reviewAssignments.length}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => setOpenAssignmentDialog(true)}><Plus className="w-4 h-4 mr-2" /> New Assignment</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant={assignmentDeskFilter === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setAssignmentDeskFilter('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    type="button"
                                    variant={assignmentDeskFilter === 'review' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setAssignmentDeskFilter('review')}
                                >
                                    Review Needed
                                </Button>
                                <Button
                                    type="button"
                                    variant={assignmentDeskFilter === 'dueSoon' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setAssignmentDeskFilter('dueSoon')}
                                >
                                    Due Soon
                                </Button>
                                <Button
                                    type="button"
                                    variant={assignmentDeskFilter === 'overdue' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setAssignmentDeskFilter('overdue')}
                                >
                                    Overdue
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {assignmentStatsLoading && (
                                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                        Loading submission insights for assignments...
                                    </div>
                                )}
                                {assignments.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                {assignmentDeskFilter === 'review'
                                                    ? 'Review Needed'
                                                    : assignmentDeskFilter === 'dueSoon'
                                                    ? 'Due Soon'
                                                    : assignmentDeskFilter === 'overdue'
                                                    ? 'Overdue'
                                                    : 'All Assignments'}
                                            </h3>
                                            <span className="text-xs text-muted-foreground">
                                                {assignmentDeskFilter === 'review'
                                                    ? 'Submissions waiting for grading or resubmission follow-up'
                                                    : assignmentDeskFilter === 'dueSoon'
                                                    ? 'Assignments closing within the next 3 days'
                                                    : assignmentDeskFilter === 'overdue'
                                                    ? 'Assignments that need extension or closeout review'
                                                    : 'Full assignment register for this workspace'}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {filteredAssignmentInsights.length > 0 ? (
                                                filteredAssignmentInsights.map(renderAssignmentCard)
                                            ) : (
                                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                                    No assignments match this filter.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        No assignments active.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MEETINGS TAB */}
                <TabsContent value="meetings" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Session Desk</CardTitle>
                                <CardDescription>Plan live classes, mentoring slots, and virtual department sessions.</CardDescription>
                            </div>
                            <Dialog open={openMeetingDialog} onOpenChange={setOpenMeetingDialog}>
                                <DialogTrigger asChild onClick={() => setOpenMeetingDialog(true)}>
                                    <Button><Plus className="w-4 h-4 mr-2" /> Plan Session</Button>
                                </DialogTrigger>
                                <DialogContent
  className="z-[9999]"
  onOpenAutoFocus={(e) => e.preventDefault()}
>
                                    <DialogHeader>
                                        <DialogTitle>Schedule New Meeting</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Meeting Title</Label>
                                            <Input value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} placeholder="e.g., Weekly Sync" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Platform</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMeeting.platform}
                                                onChange={(e) => setNewMeeting({ ...newMeeting, platform: e.target.value as any })}
                                            >
                                                <option value="google-meet">Google Meet</option>
                                                <option value="zoom">Zoom</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Meeting Link</Label>
                                            <Input value={newMeeting.link} onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })} placeholder="https://meet.google.com/..." />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Date</Label>
                                                <Input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Time</Label>
                                                <Input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Department (Optional)</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMeeting.department}
                                                onChange={(e) => setNewMeeting({ ...newMeeting, department: e.target.value })}
                                                disabled={role === 'dept_admin'}
                                            >
                                                {role !== 'dept_admin' && <option value="">All Students</option>}
                                                {departmentsList.map((d: any) => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button onClick={handleCreateMeeting}>Schedule Meeting</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <Video className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Sessions</p>
                                            <p className="text-2xl font-bold">{meetings.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled Today</p>
                                            <p className="text-2xl font-bold">{meetingsTodayCount}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Upcoming Queue</p>
                                            <p className="text-2xl font-bold">{upcomingMeetingsCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meetings.length > 0 ? meetings.map((m: any) => (
                                    <div key={m._id} className="p-4 border rounded-lg flex justify-between items-start bg-card hover:shadow-md transition-all">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Video className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{m.title}</h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.date).toLocaleDateString()} at {m.time}</span>
                                                    <span className="capitalize">{m.platform.replace('-', ' ')}</span>
                                                    {getDepartmentLabel(m.department) && <span className="text-primary font-medium">Dept: {getDepartmentLabel(m.department)}</span>}
                                                </div>
                                                <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 flex items-center gap-1">
                                                    {m.link.substring(0, 40)}... <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDeleteMeeting(m._id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No meetings scheduled yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PROJECTS TAB */}
   <TabsContent value="projects" className="space-y-4">
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Projects & Labs Desk</CardTitle>
                <CardDescription>Run practical work, guided research, and applied skill-building projects.</CardDescription>
            </div>
            {/* <Dialog open={openProjectDialog} onOpenChange={setOpenProjectDialog}>
                <DialogTrigger asChild onClick={() => setOpenProjectDialog(true)}> */}
                    <Dialog open={openProjectDialog} onOpenChange={(open) => {
    setOpenProjectDialog(open);
    if (!open) {
        resetProjectForm(); // Reset form when dialog closes
    }
}}>
    <DialogTrigger asChild onClick={() => {
        resetProjectForm(); // Reset form when opening
        setOpenProjectDialog(true);
    }}>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
    </DialogTrigger>
                   
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Add New Project / Practical</DialogTitle>
                        <DialogDescription>
                            Create a structured project with clear phases, steps, and requirements
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-8 py-6">
                        {/* AI Generation Section */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800/30">
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-500/10 p-3 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">AI Content Generator</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Enter a topic or keywords and let AI generate a complete project structure with phases, steps, and requirements.
                                    </p>
                                    <div className="flex gap-3">
                                        <Input 
                                            placeholder="e.g., IoT based Smart Waste Management System" 
                                            value={projectAiTopic} 
                                            onChange={(e) => setProjectAiTopic(e.target.value)}
                                            className="bg-white dark:bg-gray-900 flex-1"
                                        />
                                        <Button 
                                            type="button" 
                                            onClick={handleGenerateProjectContent}
                                            disabled={isGeneratingProject}
                                            className="px-6 bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            {isGeneratingProject ? "Generating..." : "Generate"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-primary/10 p-2 rounded-lg">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </span>
                                    Basic Information
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Essential details about your project
                                </p>
                            </div>
                            
                            <div className="grid gap-4 pl-2">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-semibold">Project Title</Label>
                                    <Input 
                                        value={newProject.title} 
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} 
                                        placeholder="e.g., Building a Complete E-Learning Platform with PHP & MySQL"
                                        className="h-11"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-semibold">Project Type</Label>
                                        <select
                                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={newProject.type}
                                            onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                                        >
                                            <option value="Project">Project</option>
                                            <option value="Practical">Practical</option>
                                            <option value="Research">Research</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-semibold">Due Date</Label>
                                        <Input 
                                            type="date" 
                                            value={newProject.dueDate} 
                                            onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })} 
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Overview Section */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-blue-500/10 p-2 rounded-lg">
                                        <Eye className="w-5 h-5 text-blue-500" />
                                    </span>
                                    Project Overview
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Describe the project goals, objectives, and expected outcomes
                                </p>
                            </div>
                            
                            <div className="pl-2">
                                <RichTextEditor
                                    value={newProject.description || ''}
                                    onChange={(content) => setNewProject({ ...newProject, description: content })}
                                    placeholder={`Write a comprehensive project overview including:

• Project goals and objectives
• Problem statement
• Target audience
• Expected outcomes
• Technologies to be used`}
                                    className="min-h-[180px]"
                                />
                            </div>
                        </div>

                        {/* Detailed Guidance with Hierarchical Structure */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-emerald-500/10 p-2 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                    </span>
                                    Project Guidance & Implementation Steps
                                </h3>
                            </div>

                            {/* Main Guidance Editor */}
                            <div className="space-y-3 mt-4">
                                <Label className="text-base font-semibold flex items-center justify-between">
                                    <span>Guidance Content <span className="text-destructive">*</span></span>
                                    <span className="text-xs font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                        Supports H1, H2, bold, lists, and paragraphs
                                    </span>
                                </Label>
                                
                                <div className="border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <RichTextEditor
                                        value={newProject.guidance || ''}
                                        onChange={(content) => setNewProject({ ...newProject, guidance: content })}
                                        placeholder={`Phase 1: Setup & Planning
Set up your development environment and plan the database structure. This phase ensures you have all the necessary tools and a solid foundation before starting development.

Environment Setup
Install and configure a local web server environment (e.g., XAMPP, WAMP, or MAMP) which includes Apache, PHP, and MySQL.

Database Design
Plan and create your database schema. You'll typically need at least two tables:

• users table with columns: id, username, email, password, created_at, updated_at
• user_profiles table for additional user information

Phase 2: Core Backend Development
Build the PHP backend with database connectivity and user authentication system.

Database Connection
Create a PHP script (config/db.php) to establish a connection to your MySQL database using PDO or MySQLi.

User Authentication Module

Registration:
1. Create a registration form with fields: name, email, password, confirm password
2. Validate input data (email format, password strength, required fields)
3. Hash passwords using password_hash() before storing
4. Check for duplicate email addresses

Login:
1. Create a login form for email and password
2. Verify credentials against database using password_verify()
3. Start a session and store user data upon successful login
4. Implement logout functionality`}
                                        className="min-h-[500px] max-h-[600px] overflow-y-auto"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reference Subtopics */}
                        <div className="space-y-3">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="bg-purple-500/10 p-1.5 rounded-lg">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                    </span>
                                    Reference Subtopics / Tags
                                </h3>
                            </div>
                            
                            <div className="flex gap-2">
                                <Input 
                                    id="subtopic-input" 
                                    placeholder="e.g., PHP, MySQL, Authentication, Database Design" 
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                setNewProject({ ...newProject, subtopics: [...newProject.subtopics, val] });
                                                e.currentTarget.value = '';
                                            }
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => {
                                        const el = document.getElementById('subtopic-input') as HTMLInputElement;
                                        if (el.value.trim()) {
                                            setNewProject({ ...newProject, subtopics: [...newProject.subtopics, el.value.trim()] });
                                            el.value = '';
                                        }
                                    }}
                                >
                                    Add Tag
                                </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                                {newProject.subtopics.map((st, i) => (
                                    <Badge key={i} variant="secondary" className="flex items-center gap-1 py-2 px-3 text-sm">
                                        {st}
                                        <X className="w-3 h-3 cursor-pointer hover:text-destructive ml-1" onClick={() => setNewProject({ ...newProject, subtopics: newProject.subtopics.filter((_, idx) => idx !== i) })} />
                                    </Badge>
                                ))}
                                {newProject.subtopics.length === 0 && (
                                    <p className="text-xs text-muted-foreground">Add tags to help categorize this project</p>
                                )}
                            </div>
                        </div>

                        {/* Department Assignment */}
                        <div className="space-y-3">
                            <div className="border-b pb-2">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="bg-amber-500/10 p-1.5 rounded-lg">
                                        <Users className="w-4 h-4 text-amber-500" />
                                    </span>
                                    Assignment Settings
                                </h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Department (Optional)</Label>
                                    <select
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newProject.department}
                                        onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                                        disabled={role === 'dept_admin'}
                                    >
                                        {role !== 'dept_admin' && <option value="">All Students</option>}
                                        {departmentsList.map((d: any) => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                          
                            </div>
                        </div>

                        <Button 
                            onClick={handleCreateProject} 
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/20"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Publish Project
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </CardHeader>
        
        <CardContent>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Projects</p>
                            <p className="text-2xl font-bold">{projects.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Assisted</p>
                            <p className="text-2xl font-bold">{aiProjectCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Due In 7 Days</p>
                            <p className="text-2xl font-bold">{dueSoonProjectsCount}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Projects Grid Display with View and Delete Icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length > 0 ? (
                    projects.map((project: any) => (
                        <Card key={project._id} className="group relative overflow-hidden border border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                            {/* Action Buttons - Always visible on hover */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                                    onClick={() => {
                                        setPreviewProject(project);
                                    }}
                                >
                                    <Eye className="h-4 w-4 text-primary" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="destructive" 
                                    className="h-8 w-8 shadow-md"
                                    onClick={() => handleDeleteProject(project._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Type Badge - Always visible */}
                            <div className="absolute top-3 left-3">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-semibold text-xs">
                                    {project.type || 'Project'}
                                </Badge>
                                {project.isAiGenerated && (
                                    <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-600 border-purple-200 text-[10px]">
                                        <Sparkles className="w-3 h-3 mr-1" /> AI
                                    </Badge>
                                )}
                            </div>

                            <CardHeader className="pt-12 pb-3">
                                <CardTitle className="text-lg font-bold line-clamp-2 min-h-[3.5rem]">
                                    {project.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-xs">
                                    {project.dueDate && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Due: {new Date(project.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Description Preview */}
                                {project.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-3 prose prose-sm dark:prose-invert"
                                         dangerouslySetInnerHTML={{ 
                                             __html: project.description.length > 150 
                                                 ? project.description.substring(0, 150) + '...' 
                                                 : project.description 
                                         }} 
                                    />
                                )}

                                {/* Guidance Preview */}
                                {project.guidance && (
                                    <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-muted">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" />
                                            Guidance Preview:
                                        </p>
                                        <div className="text-xs line-clamp-3 prose prose-sm dark:prose-invert max-w-none"
                                             dangerouslySetInnerHTML={{ 
                                                 __html: project.guidance.length > 120 
                                                     ? project.guidance.substring(0, 120) + '...' 
                                                     : project.guidance 
                                             }} />
                                    </div>
                                )}

                                {/* Subtopics/Tags */}
                                {project.subtopics && project.subtopics.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {project.subtopics.slice(0, 3).map((tag: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] bg-muted/30">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {project.subtopics.length > 3 && (
                                            <Badge variant="outline" className="text-[10px]">
                                                +{project.subtopics.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Department Info */}
                                <div className="flex justify-between items-center pt-2 border-t text-xs">
                                    <span className="text-muted-foreground">
                                        Dept: {getDepartmentLabel(project.department) || 'All'}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Created: {new Date(project.createdAt || project.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Briefcase className="w-8 h-8 text-primary opacity-60" />
                            </div>
                            <h3 className="text-lg font-semibold">No Projects Added Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Get started by creating your first project. Click the "Add Project" button to create a structured project with guidance and steps.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-2"
                                onClick={() => setOpenProjectDialog(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Project
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>

    {/* Project Preview Dialog */}
    <Dialog open={!!previewProject} onOpenChange={(open) => !open && setPreviewProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                    {previewProject?.title}
                    {/* {previewProject?.isAiGenerated && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                            <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                        </Badge>
                    )} */}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {previewProject?.type || 'Project'}
                    </Badge>
                    <span>•</span>
                    <span>Dept: {getDepartmentLabel(previewProject?.department) || 'All'}</span>
                    {previewProject?.dueDate && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {new Date(previewProject.dueDate).toLocaleDateString()}
                            </span>
                        </>
                    )}
                </DialogDescription>
            </DialogHeader>
            
            {previewProject && (
                <div className="space-y-8 py-4">
                    {/* Description Section */}
                    {previewProject?.description && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-blue-500/10 p-1.5 rounded-lg">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                </span>
                                Project Overview
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none p-5 bg-muted/20 rounded-xl border"
                                 dangerouslySetInnerHTML={{ __html: previewProject.description }} />
                        </div>
                    )}
                    
                    {/* Guidance Section - Fully formatted */}
                    {previewProject?.guidance && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-emerald-500/10 p-1.5 rounded-lg">
                                    <Briefcase className="w-4 h-4 text-emerald-500" />
                                </span>
                                Project Guidance & Implementation Steps
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none p-5 bg-muted/20 rounded-xl border"
                                 dangerouslySetInnerHTML={{ __html: previewProject.guidance }} />
                        </div>
                    )}
                    
                    {/* Subtopics Section */}
                    {previewProject?.subtopics?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-purple-500/10 p-1.5 rounded-lg">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                </span>
                                Reference Subtopics
                            </h3>
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl border">
                                {previewProject.subtopics.map((st: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="py-1.5 px-3">
                                        {st}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
    </Dialog>
</TabsContent>

                {/* MATERIALS TAB */}
                <TabsContent value="materials" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Study Materials & Notes</CardTitle>
                                <CardDescription>Share documents, PDF notes, and useful links with students.</CardDescription>
                            </div>
                            <Dialog open={openMaterialDialog} onOpenChange={setOpenMaterialDialog}>
                                <DialogTrigger asChild onClick={() => setOpenMaterialDialog(true)}>
                                    <Button><Plus className="w-4 h-4 mr-2" /> Add Material</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Study Material</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Material Title</Label>
                                            <Input value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} placeholder="e.g., Python Course Notes" />
                                        </div>
                                        {/* TYPE BASED FIELD */}
                                        <div className="grid gap-2">
                                            <Label>
                                                {newMaterial.type === 'PDF' ? 'Upload PDF File' : 'Link / URL'}
                                            </Label>

                                            {newMaterial.type === 'PDF' ? (
                                                <Input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(e: any) =>
                                                        setNewMaterial({ ...newMaterial, file: e.target.files[0] })
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    value={newMaterial.fileUrl}
                                                    onChange={(e) =>
                                                        setNewMaterial({ ...newMaterial, fileUrl: e.target.value })
                                                    }
                                                    placeholder="https://..."
                                                />
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Type</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMaterial.type}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                            >
                                                <option value="PDF">PDF Document</option>
                                                <option value="Link">External Link</option>
                                                <option value="Slide">Slides/PPT</option>
                                                <option value="Video">Video Resource</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Department (Optional)</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMaterial.department}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, department: e.target.value })}
                                                disabled={role === 'dept_admin'}
                                            >
                                                {role !== 'dept_admin' && <option value="">All Students</option>}
                                                {departmentsList.map((d: any) => (
                                                    <option key={d._id} value={d._id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button onClick={handleCreateMaterial}>Add Material</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {materials.length > 0 ? materials.map((m: any) => (
                                    <div key={m._id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{m.title}</p>
                                                <p className="text-[10px] text-muted-foreground">{m.type} • {m.department ? (departmentsList.find(d => d._id === m.department || d.name === m.department)?.name || m.department) : 'All'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-primary transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMaterial(m._id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        No materials added yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOTICES TAB */}
                <TabsContent value="notices" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Announcement Desk</CardTitle>
                            <CardDescription>Broadcast updates, exam alerts, and operational notices to learners.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-sky-100 p-2 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Notices</p>
                                            <p className="text-2xl font-bold">{notices.length}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Posted This Week</p>
                                            <p className="text-2xl font-bold">{recentNoticesCount}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">All Learners</p>
                                            <p className="text-2xl font-bold">{orgWideNoticeCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Announcement Title" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Message</Label>
                                    <RichTextEditor
                                        value={newNotice.content || ''}
                                        onChange={(content) => setNewNotice({ ...newNotice, content: content })}
                                        placeholder="Write your message here..."
                                        className="min-h-[200px]"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Department (Optional)</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newNotice.department || ''}
                                        onChange={(e) => setNewNotice({ ...newNotice, department: e.target.value })}
                                        disabled={role === 'dept_admin'}
                                    >
                                        {role !== 'dept_admin' && <option value="">All Students</option>}
                                        {departmentsList.map((d: any) => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button onClick={handleCreateNotice}><Bell className="w-4 h-4 mr-2" /> Post Notice</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-medium">Recent Notices</h3>
                        {notices.length === 0 ? (
                            <p className="text-muted-foreground">No notices found.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {notices.map((notice: any) => (
                                    <Card key={notice._id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base truncate pr-2" title={notice.title}>{notice.title}</CardTitle>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 flex-shrink-0" onClick={() => handleDeleteNotice(notice._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {new Date(notice.createdAt).toLocaleDateString()}
                                                {getDepartmentLabel(notice.department) && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-[10px]">
                                                        {getDepartmentLabel(notice.department)}
                                                    </span>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div
                                                className="text-sm text-muted-foreground line-clamp-3 prose prose-sm dark:prose-invert"
                                                dangerouslySetInnerHTML={{ __html: notice.content }}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* CAREER TAB */}
                <TabsContent value="career" className="space-y-6">
                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                Career & Placement Module
                            </CardTitle>
                            <CardDescription>
                                Track student placement readiness scores, verify student projects, and view issued certificates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Students Tracked</h4>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{role === 'dept_admin' ? students.length : (stats.studentCount || 0)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 dark:bg-violet-900/10 dark:border-violet-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Students Placed</h4>
                                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                                        {role === 'dept_admin' ? students.filter((s: any) => s.studentDetails?.isPlacementClosed).length : (stats.placedCount || 0)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Verified Projects</h4>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{projects.length || 0}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                                    <h4 className="text-sm font-semibold mb-1">Avg. Readiness Score</h4>
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">0%</p>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button size="lg" onClick={() => navigate('/dashboard/org/career')} className="px-8 rounded-full shadow-lg shadow-blue-500/20">
                                    Open Full Career Dashboard <ExternalLink className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Assignment Dialog - Moved outside loop for global access */}
            <Dialog open={openAssignmentDialog} onOpenChange={setOpenAssignmentDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create Assignment/ Assessment</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label>Topic</Label>
                        <Input value={newAssignment.topic} onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })} />
                        <Label>Description (Auto-generated – editable after creation)</Label>                        
                        <RichTextEditor
                            value={newAssignment.description || ''}
                            onChange={(content) => setNewAssignment({ ...newAssignment, description: content })}
                            placeholder="Assignment instructions..."
                            className="min-h-[150px]"
                        />
                        <Label>Due Date</Label>
                        <Input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} />
                        <Label>Department (Optional)</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newAssignment.department}
                            onChange={(e) => setNewAssignment({ ...newAssignment, department: e.target.value })}
                            disabled={role === 'dept_admin'}
                        >
                            {role !== 'dept_admin' && <option value="">All Students</option>}
                            {departmentsList.map((d: any) => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <Button onClick={handleCreateAssignment}>Create</Button>
                </DialogContent>
            </Dialog>

            {/* Edit Course Dialog - Moved outside loop for stability */}
            <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Course: {editCourse?.title}</DialogTitle>
                    </DialogHeader>
                    {editCourse && (
                        <CourseForm
                            course={editCourse}
                            setCourse={setEditCourse}
                            onSave={handleUpdateCourse}
                            isEdit
                            departments={departmentsList}
                            role={role}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Course Preview Dialog */}
            <Dialog open={!!previewCourse} onOpenChange={(open) => !open && setPreviewCourse(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{previewCourse?.title || previewCourse?.mainTopic || 'Course Preview'}</DialogTitle>
                        <DialogDescription>
                            {previewCourse?.department ? `Assigned to: ${previewCourse.department}` : 'Assigned to all students'}
                        </DialogDescription>
                    </DialogHeader>
                    {previewCourse && (() => {
                        let parsedContent = null;
                        if (previewCourse.content) {
                            try {
                                parsedContent = JSON.parse(previewCourse.content);
                            } catch (e) {
                                console.error('Error parsing course content', e);
                            }
                        }

                        const description = previewCourse.description || parsedContent?.course_description || '';
                        const topics = previewCourse.topics || parsedContent?.course_topics || [];
                        const quizzes = previewCourse.quizzes || parsedContent?.quizzes || [];

                        return (
                            <div className="py-4 space-y-6">
                                {description && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Description</h4>
                                        <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg"
                                            dangerouslySetInnerHTML={{ __html: description }} />
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold mb-3">Course Content</h4>
                                    <div className="space-y-4">
                                        {topics.length > 0 ? topics.map((topic: any, idx: number) => (
                                            <div key={idx} className="border rounded-lg overflow-hidden">
                                                <div className="bg-muted/50 p-3 font-medium flex gap-3">
                                                    <span className="text-xs bg-muted px-2 py-1 rounded font-bold">{idx + 1}</span>
                                                    {topic.title || topic.topic}
                                                </div>
                                                <div className="p-4 space-y-3 bg-card">
                                                    {topic.subtopics && topic.subtopics.length > 0 ? (
                                                        topic.subtopics.map((sub: any, sIdx: number) => (
                                                            <div key={sIdx} className="pl-4 border-l-2 border-primary/20">
                                                                <h5 className="font-medium text-sm mb-1">{sub.title || sub.subtopic}</h5>
                                                                {sub.videoUrl && (
                                                                    <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 flex items-center gap-1 mb-2">
                                                                        <Video className="w-3 h-3" /> External Video Link
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground pl-4">No subtopics defined.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-4 border border-dashed rounded-lg text-sm text-muted-foreground text-center">
                                                No topics available for this course.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {quizzes.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Quizzes</h4>
                                        <div className="space-y-3">
                                            {quizzes.map((quiz: any, qIdx: number) => (
                                                <div key={qIdx} className="p-4 border rounded-lg bg-card text-sm">
                                                    <p className="font-medium mb-2">{qIdx + 1}. {quiz.question}</p>
                                                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                                        {quiz.options && quiz.options.map((opt: string, oIdx: number) => (
                                                            <li key={oIdx} className={opt === quiz.answer ? "text-primary font-medium" : ""}>
                                                                {opt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Edit AI Course Dialog */}
            <Dialog open={!!editAICourse} onOpenChange={(open) => !open && setEditAICourse(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit AI-Generated Course</DialogTitle>
                        <DialogDescription>Update the course title and department assignment</DialogDescription>
                    </DialogHeader>
                    {editAICourse && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mainTopic">Course Title</Label>
                                <Input
                                    id="mainTopic"
                                    value={editAICourse.mainTopic || ''}
                                    onChange={(e) => setEditAICourse({ ...editAICourse, mainTopic: e.target.value })}
                                    placeholder="Enter course title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department (Optional)</Label>
                                <select
                                    id="department"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editAICourse.department || ''}
                                    onChange={(e) => setEditAICourse({ ...editAICourse, department: e.target.value })}
                                    disabled={role === 'dept_admin'}
                                >
                                    {role !== 'dept_admin' && <option value="">All Students</option>}
                                    {departmentsList.map((d: any) => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Assign to a specific department or leave empty for all students
                                </p>
                            </div>
                            <Button onClick={handleUpdateAICourse} className="w-full">
                                Update Course
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default OrgDashboard;
