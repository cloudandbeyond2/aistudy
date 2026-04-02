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

const CareerTab = () => {
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
        
           <>
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
           </>
            );
};

export default CareerTab;