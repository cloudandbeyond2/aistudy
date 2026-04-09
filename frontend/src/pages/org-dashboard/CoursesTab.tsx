// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   Users, FileText, Bell, Plus, Upload, Search, Trash2, DollarSign, CheckCircle, RotateCcw, 
//   BarChart, Sparkles, ChevronDown, ChevronUp, Check, X, Clock, Video, Briefcase, Download, 
//   ExternalLink, Eye, TrendingUp, Award, Shield, Camera, Mic, AlertTriangle, BookOpen, FileQuestion, 
//   Calendar, CheckCircle2, ArrowUpCircle, Layers, GraduationCap, BookMarked, FolderOpen, Zap, 
//   Target, LineChart, Grid3x3, List, MoreHorizontal, Pencil, Copy, Archive, Link2, MessageSquare, 
//   Star, StarOff, Globe, LayoutGrid, Library, Rocket, Trophy, Heart
// } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { useToast } from '@/hooks/use-toast';
// import axios from 'axios';
// import { serverURL } from '@/constants';
// import RichTextEditor from '@/components/RichTextEditor';
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import Swal from 'sweetalert2';
// import { motion, AnimatePresence } from 'framer-motion';

// // ========== Helper Functions ==========

// const defaultQuizSettings = {
//     examMode: true,
//     quizMode: 'secure',
//     attemptLimit: 2,
//     cooldownMinutes: 60,
//     passPercentage: 50,
//     questionCount: 10,
//     difficultyMode: 'mixed',
//     shuffleQuestions: true,
//     shuffleOptions: true,
//     reviewMode: 'after_submit_with_answers',
//     positiveMarkPerCorrect: 1,
//     negativeMarkingEnabled: false,
//     negativeMarkPerWrong: 0.25,
//     sectionPatternEnabled: false,
//     sections: {
//         easy: 0,
//         medium: 0,
//         difficult: 0
//     },
//     proctoring: {
//         requireCamera: true,
//         requireMicrophone: true,
//         detectFullscreenExit: true,
//         detectTabSwitch: true,
//         detectCopyPaste: true,
//         detectContextMenu: true,
//         detectNoise: true
//     }
// };

// const createEmptyQuiz = () => ({
//     question: '',
//     options: ['', '', '', ''],
//     answer: '',
//     explanation: '',
//     difficulty: 'medium'
// });

// const createEmptyCourse = () => ({
//     title: '',
//     description: '',
//     department: '',
//     topics: [],
//     quizzes: [],
//     quizSettings: { ...defaultQuizSettings, proctoring: { ...defaultQuizSettings.proctoring } }
// });

// const normalizeCourseForEdit = (course: any) => {
//     const quizzes = Array.isArray(course?.quizzes)
//         ? course.quizzes.map((q: any) => ({
//             ...q,
//             options: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
//             difficulty: q?.difficulty || 'medium'
//         }))
//         : [];

//     const quizSettings = {
//         ...defaultQuizSettings,
//         ...(course?.quizSettings || {}),
//         sections: {
//             ...defaultQuizSettings.sections,
//             ...(course?.quizSettings?.sections || {})
//         },
//         proctoring: {
//             ...defaultQuizSettings.proctoring,
//             ...(course?.quizSettings?.proctoring || {})
//         }
//     };

//     return {
//         ...course,
//         quizzes,
//         quizSettings
//     };
// };

// // ========== CourseForm Component ==========

// const CourseForm = ({ course, setCourse, onSave, isEdit = false, departments = [], role }: any) => {
//   if (!course) return null;
//   const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
//   const quizSettings = {
//     ...defaultQuizSettings,
//     ...(course.quizSettings || {}),
//     sections: {
//       ...defaultQuizSettings.sections,
//       ...(course.quizSettings?.sections || {})
//     },
//     proctoring: {
//       ...defaultQuizSettings.proctoring,
//       ...(course.quizSettings?.proctoring || {})
//     }
//   };
//   const lockedDepartmentLabel =
//     departments.find((d: any) => d._id === course.department || d.name === course.department)?.name ||
//     course.department ||
//     'Assigned department';

//   const updateTopic = (index: number, field: string, value: any) => {
//     const updatedTopics = [...course.topics];
//     updatedTopics[index] = { ...updatedTopics[index], [field]: value };
//     setCourse({ ...course, topics: updatedTopics });
//   };

//   const removeTopic = (index: number) => {
//     const updatedTopics = course.topics.filter((_: any, i: number) => i !== index);
//     setCourse({ ...course, topics: updatedTopics });
//   };

//   const updateSubtopic = (topicIndex: number, subIndex: number, field: string, value: any) => {
//     const updatedTopics = [...course.topics];
//     let finalValue = value;

//     if (field === 'videoUrl' && value) {
//       const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//       const match = value.match(regExp);
//       if (match && match[2].length === 11) {
//         finalValue = match[2];
//       }
//     }

//     updatedTopics[topicIndex].subtopics[subIndex] = { ...updatedTopics[topicIndex].subtopics[subIndex], [field]: finalValue };
//     setCourse({ ...course, topics: updatedTopics });
//   };

//   const removeSubtopic = (topicIndex: number, subIndex: number) => {
//     const updatedTopics = [...course.topics];
//     updatedTopics[topicIndex].subtopics = updatedTopics[topicIndex].subtopics.filter((_: any, i: number) => i !== subIndex);
//     setCourse({ ...course, topics: updatedTopics });
//   };

//   const updateQuiz = (index: number, field: string, value: any) => {
//     const updatedQuizzes = [...course.quizzes];
//     if (field === 'option') {
//       updatedQuizzes[index].options[value.optIndex] = value.text;
//     } else {
//       updatedQuizzes[index] = { ...updatedQuizzes[index], [field]: value };
//     }
//     setCourse({ ...course, quizzes: updatedQuizzes });
//   };

//   const removeQuiz = (index: number) => {
//     const updatedQuizzes = course.quizzes.filter((_: any, i: number) => i !== index);
//     setCourse({ ...course, quizzes: updatedQuizzes });
//   };

//   const updateQuizSetting = (field: string, value: any) => {
//     setCourse({
//       ...course,
//       quizSettings: {
//         ...quizSettings,
//         [field]: value
//       }
//     });
//   };

//   const updateProctoringSetting = (field: string, value: boolean) => {
//     setCourse({
//       ...course,
//       quizSettings: {
//         ...quizSettings,
//         proctoring: {
//           ...quizSettings.proctoring,
//           [field]: value
//         }
//       }
//     });
//   };

//   const updateSectionSetting = (field: string, value: number) => {
//     setCourse({
//       ...course,
//       quizSettings: {
//         ...quizSettings,
//         sections: {
//           ...quizSettings.sections,
//           [field]: value
//         }
//       }
//     });
//   };

//   return (
//     <div className="space-y-8 py-4 px-1 max-w-4xl mx-auto">
//       {/* Basic Information */}
//       <div className="space-y-4">
//         <div className="border-b pb-2">
//           <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Basic Information</h3>
//           <p className="text-sm text-muted-foreground">Essential details about your course.</p>
//         </div>
//         <div className="grid gap-6 p-5 border rounded-xl bg-card shadow-sm">
//           <div className="grid gap-3">
//             <Label className="text-sm font-medium">Course Title <span className="text-destructive">*</span></Label>
//             <Input className="h-11 text-base bg-muted/50 focus:bg-background transition-colors" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} placeholder="e.g., Complete Python Developer in 2024" />
//           </div>
//           <div className="grid gap-3">
//             <Label className="text-sm font-medium">Course Overview</Label>
//             <RichTextEditor
//               value={course.description || ''}
//               onChange={(content) => setCourse({ ...course, description: content })}
//               placeholder="Write a compelling description..."
//               className="min-h-[160px] border-muted/60"
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="grid gap-3">
//               <Label className="text-sm font-medium">Assign to Department</Label>
//               {role === 'dept_admin' ? (
//                 <div className="rounded-xl border bg-muted/40 px-4 py-3">
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="min-w-0">
//                       <p className="text-sm font-medium">Locked department</p>
//                       <p className="text-xs text-muted-foreground">
//                         Department admins can only publish within their assigned department.
//                       </p>
//                     </div>
//                     <Badge variant="secondary" className="shrink-0">
//                       {lockedDepartmentLabel}
//                     </Badge>
//                   </div>
//                 </div>
//               ) : (
//                 <select
//                   className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                   value={course.department}
//                   onChange={(e) => setCourse({ ...course, department: e.target.value })}
//                 >
//                   <option value="">All Students (Default)</option>
//                   {departments.map((d: any) => (
//                     <option key={d._id} value={d.name}>{d.name}</option>
//                   ))}
//                 </select>
//               )}
//             </div>
//             <div className="grid gap-3">
//               <Label className="text-sm font-medium">Course Type</Label>
//               <select
//                 className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                 value={course.type || 'video & text course'}
//                 onChange={(e) => setCourse({ ...course, type: e.target.value })}
//               >
//                 <option value="video & text course">Video & Text Course</option>
//                 <option value="image & text course">Image & Text Course</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Curriculum */}
//       <div className="space-y-4">
//         <div className="border-b pb-2 flex justify-between items-end">
//           <div>
//             <h3 className="text-lg font-semibold flex items-center gap-2"><Video className="w-5 h-5 text-blue-500" /> Curriculum Setup</h3>
//             <p className="text-sm text-muted-foreground">Structure your course into lessons and topics.</p>
//           </div>
//           <Button type="button" size="sm" onClick={() => {
//             const topic = { title: '', subtopics: [], order: course.topics.length };
//             setCourse({ ...course, topics: [...course.topics, topic] });
//             setExpandedTopic(course.topics.length);
//           }}>
//             <Plus className="w-4 h-4 mr-2" /> Add Lesson
//           </Button>
//         </div>

//         <div className="space-y-4">
//           {course.topics.length === 0 && (
//             <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
//               <Video className="w-8 h-8 mx-auto mb-2 opacity-20" />
//               <p>No lessons added yet.</p>
//             </div>
//           )}
//           {course.topics.map((topic: any, tIdx: number) => (
//             <div key={tIdx} className="border rounded-xl bg-card shadow-sm overflow-hidden transition-all duration-200">
//               <div
//                 className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${expandedTopic === tIdx ? 'bg-primary/5 border-b' : 'hover:bg-muted/50'}`}
//                 onClick={() => setExpandedTopic(expandedTopic === tIdx ? null : tIdx)}
//               >
//                 <div className="flex items-center gap-3 flex-1">
//                   <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
//                     {tIdx + 1}
//                   </div>
//                   <Input
//                     className="h-9 max-w-md bg-transparent border-transparent hover:border-input focus:bg-background focus:border-input font-semibold text-base transition-all"
//                     value={topic.title}
//                     onChange={(e) => updateTopic(tIdx, 'title', e.target.value)}
//                     placeholder="Lesson Title"
//                     onClick={(e) => e.stopPropagation()}
//                   />
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Badge variant="secondary" className="mr-2">{topic.subtopics.length} items</Badge>
//                   <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setExpandedTopic(expandedTopic === tIdx ? null : tIdx); }}>
//                     {expandedTopic === tIdx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                   </Button>
//                   <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); removeTopic(tIdx); }}><Trash2 className="w-4 h-4" /></Button>
//                 </div>
//               </div>

//               {expandedTopic === tIdx && (
//                 <div className="p-5 space-y-6 bg-muted/10">
//                   {topic.subtopics.length === 0 && (
//                     <p className="text-sm text-center text-muted-foreground py-2 tracking-wide uppercase font-medium">No contents in this lesson</p>
//                   )}
//                   {topic.subtopics.map((sub: any, sIdx: number) => (
//                     <div key={sIdx} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:bottom-auto last:before:h-2">
//                       <div className="absolute left-1.5 top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10"></div>
//                       <div className="bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-colors space-y-4">
//                         <div className="flex justify-between items-start gap-4">
//                           <div className="flex-1 space-y-1">
//                             <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subtopic Title</Label>
//                             <Input
//                               className="font-medium h-9 focus-visible:ring-1"
//                               value={sub.title}
//                               onChange={(e) => updateSubtopic(tIdx, sIdx, 'title', e.target.value)}
//                               placeholder="What will students learn?"
//                             />
//                           </div>
//                           <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 mt-5" onClick={() => removeSubtopic(tIdx, sIdx)}><Trash2 className="w-4 h-4" /></Button>
//                         </div>
//                         <div className="space-y-1">
//                           <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Video Link (Optional)</Label>
//                           <div className="flex items-center relative">
//                             <Video className="w-4 h-4 absolute left-3" style={{ color: '#ff0000' }} />
//                             <Input
//                               className="h-9 pl-9"
//                               value={sub.videoUrl || ''}
//                               onChange={(e) => updateSubtopic(tIdx, sIdx, 'videoUrl', e.target.value)}
//                               placeholder="YouTube Video URL"
//                             />
//                           </div>
//                         </div>
//                         <div className="space-y-1">
//                           <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Learning Material</Label>
//                           <RichTextEditor
//                             value={sub.content || ''}
//                             onChange={(content) => updateSubtopic(tIdx, sIdx, 'content', content)}
//                             placeholder="Add comprehensive text, code blocks, or images here..."
//                             className="min-h-[200px]"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => {
//                     const updated = [...course.topics];
//                     updated[tIdx].subtopics.push({ title: '', content: '', videoUrl: '', order: 0 });
//                     setCourse({ ...course, topics: updated });
//                   }}>
//                     <Plus className="w-4 h-4 mr-2 text-primary" /> Add Subtopic Item
//                   </Button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-4 pt-4 border-t">
//         <div className="border-b pb-2">
//           <h3 className="text-lg font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-amber-500" /> Quiz Exam Mode</h3>
//           <p className="text-sm text-muted-foreground">Configure GATE-style exam rules, attempts, cooldown, and malpractice monitoring.</p>
//         </div>

//         <div className="grid gap-4 p-5 border rounded-xl bg-card shadow-sm">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Quiz Mode</Label>
//               <select
//                 className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//                 value={quizSettings.quizMode}
//                 onChange={(e) => {
//                   const nextMode = e.target.value;
//                   setCourse({
//                     ...course,
//                     quizSettings: {
//                       ...quizSettings,
//                       quizMode: nextMode,
//                       examMode: nextMode === 'secure'
//                     }
//                   });
//                 }}
//               >
//                 <option value="practice">Practice Mode</option>
//                 <option value="assessment">Assessment Mode</option>
//                 <option value="secure">Secure Exam Mode</option>
//               </select>
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Difficulty Mode</Label>
//               <select
//                 className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//                 value={quizSettings.difficultyMode}
//                 onChange={(e) => updateQuizSetting('difficultyMode', e.target.value)}
//               >
//                 <option value="mixed">Mixed</option>
//                 <option value="easy">Easy</option>
//                 <option value="medium">Medium</option>
//                 <option value="difficult">Difficult</option>
//               </select>
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Attempt Limit</Label>
//               <Input
//                 type="number"
//                 min={1}
//                 max={5}
//                 value={quizSettings.attemptLimit}
//                 onChange={(e) => updateQuizSetting('attemptLimit', Number(e.target.value) || 1)}
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Cooldown After Failed Attempt (Minutes)</Label>
//               <Input
//                 type="number"
//                 min={0}
//                 max={1440}
//                 value={quizSettings.cooldownMinutes}
//                 onChange={(e) => updateQuizSetting('cooldownMinutes', Number(e.target.value) || 0)}
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Pass Percentage</Label>
//               <Input
//                 type="number"
//                 min={1}
//                 max={100}
//                 value={quizSettings.passPercentage}
//                 onChange={(e) => updateQuizSetting('passPercentage', Number(e.target.value) || 50)}
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Questions Per Attempt</Label>
//               <Input
//                 type="number"
//                 min={1}
//                 max={100}
//                 value={quizSettings.questionCount}
//                 onChange={(e) => updateQuizSetting('questionCount', Number(e.target.value) || 1)}
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Review Mode</Label>
//               <select
//                 className="flex h-11 w-full rounded-md border border-input bg-muted/50 focus:bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//                 value={quizSettings.reviewMode}
//                 onChange={(e) => updateQuizSetting('reviewMode', e.target.value)}
//               >
//                 <option value="after_submit_with_answers">Show answers after submit</option>
//                 <option value="after_submit_without_answers">Show summary without answers</option>
//                 <option value="score_only">Score only</option>
//               </select>
//             </div>
//             <div className="grid gap-2">
//               <Label className="text-sm font-medium">Positive Mark Per Correct Answer</Label>
//               <Input
//                 type="number"
//                 min={0.25}
//                 step={0.25}
//                 value={quizSettings.positiveMarkPerCorrect}
//                 onChange={(e) => updateQuizSetting('positiveMarkPerCorrect', Number(e.target.value) || 1)}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
//               <span className="text-sm font-medium">Shuffle questions per attempt</span>
//               <input type="checkbox" checked={quizSettings.shuffleQuestions} onChange={(e) => updateQuizSetting('shuffleQuestions', e.target.checked)} />
//             </label>
//             <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
//               <span className="text-sm font-medium">Shuffle options per attempt</span>
//               <input type="checkbox" checked={quizSettings.shuffleOptions} onChange={(e) => updateQuizSetting('shuffleOptions', e.target.checked)} />
//             </label>
//             <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
//               <span className="text-sm font-medium">Enable negative marking</span>
//               <input type="checkbox" checked={quizSettings.negativeMarkingEnabled} onChange={(e) => updateQuizSetting('negativeMarkingEnabled', e.target.checked)} />
//             </label>
//             <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
//               <span className="text-sm font-medium">Enable section pattern</span>
//               <input type="checkbox" checked={quizSettings.sectionPatternEnabled} onChange={(e) => updateQuizSetting('sectionPatternEnabled', e.target.checked)} />
//             </label>
//           </div>

//           {quizSettings.negativeMarkingEnabled && (
//             <div className="grid gap-2 md:max-w-xs">
//               <Label className="text-sm font-medium">Negative Mark Per Wrong Answer</Label>
//               <Input
//                 type="number"
//                 min={0}
//                 step={0.25}
//                 value={quizSettings.negativeMarkPerWrong}
//                 onChange={(e) => updateQuizSetting('negativeMarkPerWrong', Number(e.target.value) || 0)}
//               />
//             </div>
//           )}

//           {quizSettings.sectionPatternEnabled && (
//             <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
//               <div className="mb-3">
//                 <h4 className="text-sm font-semibold">Section Pattern</h4>
//                 <p className="text-xs text-muted-foreground">
//                   Configure how many questions should be picked from each difficulty bucket.
//                 </p>
//               </div>
//               <div className="grid gap-4 md:grid-cols-3">
//                 <div className="grid gap-2">
//                   <Label className="text-sm font-medium">Easy</Label>
//                   <Input type="number" min={0} value={quizSettings.sections.easy} onChange={(e) => updateSectionSetting('easy', Number(e.target.value) || 0)} />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label className="text-sm font-medium">Medium</Label>
//                   <Input type="number" min={0} value={quizSettings.sections.medium} onChange={(e) => updateSectionSetting('medium', Number(e.target.value) || 0)} />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label className="text-sm font-medium">Difficult</Label>
//                   <Input type="number" min={0} value={quizSettings.sections.difficult} onChange={(e) => updateSectionSetting('difficult', Number(e.target.value) || 0)} />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
//             <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
//               <AlertTriangle className="w-4 h-4" />
//               Malpractice Monitoring
//             </div>
//             <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
//                 <span className="flex items-center gap-2 text-sm font-medium"><Camera className="w-4 h-4 text-primary" /> Require camera access</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.requireCamera} onChange={(e) => updateProctoringSetting('requireCamera', e.target.checked)} />
//               </label>
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
//                 <span className="flex items-center gap-2 text-sm font-medium"><Mic className="w-4 h-4 text-primary" /> Require microphone access</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.requireMicrophone} onChange={(e) => updateProctoringSetting('requireMicrophone', e.target.checked)} />
//               </label>
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
//                 <span className="text-sm font-medium">Detect tab switches</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.detectTabSwitch} onChange={(e) => updateProctoringSetting('detectTabSwitch', e.target.checked)} />
//               </label>
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
//                 <span className="text-sm font-medium">Detect fullscreen exit</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.detectFullscreenExit} onChange={(e) => updateProctoringSetting('detectFullscreenExit', e.target.checked)} />
//               </label>
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
//                 <span className="text-sm font-medium">Detect copy/paste</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.detectCopyPaste} onChange={(e) => updateProctoringSetting('detectCopyPaste', e.target.checked)} />
//               </label>
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background">
//                 <span className="text-sm font-medium">Detect context menu</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.detectContextMenu} onChange={(e) => updateProctoringSetting('detectContextMenu', e.target.checked)} />
//               </label>
//               <label className="flex items-center justify-between rounded-xl border px-4 py-3 bg-background md:col-span-2">
//                 <span className="text-sm font-medium">Detect external noise spikes</span>
//                 <input type="checkbox" checked={quizSettings.proctoring.detectNoise} onChange={(e) => updateProctoringSetting('detectNoise', e.target.checked)} />
//               </label>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quizzes */}
//       <div className="space-y-4 pt-4 border-t">
//         <div className="border-b pb-2 flex justify-between items-end">
//           <div>
//             <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Assessment Quizzes</h3>
//             <p className="text-sm text-muted-foreground">Add multiple choice questions to test knowledge.</p>
//           </div>
//           <Button type="button" size="sm" variant="secondary" onClick={() => {
//             const quiz = createEmptyQuiz();
//             setCourse({ ...course, quizzes: [...course.quizzes, quiz] });
//           }}>
//             <Plus className="w-4 h-4 mr-2" /> Add Question
//           </Button>
//         </div>

//         <div className="grid gap-4">
//           {course.quizzes.length === 0 && (
//             <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
//               <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
//               <p>No quiz questions added yet.</p>
//             </div>
//           )}
//           {course.quizzes.map((quiz: any, qIdx: number) => (
//             <div key={qIdx} className="p-5 border rounded-xl shadow-sm bg-card hover:border-emerald-500/30 transition-colors">
//               <div className="flex justify-between items-start gap-4 mb-4">
//                 <div className="flex-1 space-y-1.5">
//                   <Label className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
//                     <span className="bg-muted px-2 py-0.5 rounded text-xs text-foreground">Q{qIdx + 1}</span>
//                     Question Text
//                   </Label>
//                   <Textarea
//                     className="font-medium text-base resize-y min-h-[80px] focus-visible:ring-emerald-500/50"
//                     value={quiz.question}
//                     onChange={(e) => updateQuiz(qIdx, 'question', e.target.value)}
//                     placeholder="What is..."
//                   />
//                 </div>
//                 <div className="w-36 space-y-1.5">
//                   <Label className="text-xs text-muted-foreground font-semibold uppercase">Difficulty</Label>
//                   <select
//                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//                     value={quiz.difficulty || 'medium'}
//                     onChange={(e) => updateQuiz(qIdx, 'difficulty', e.target.value)}
//                   >
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="difficult">Difficult</option>
//                   </select>
//                 </div>
//                 <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeQuiz(qIdx)}>
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
//                 {quiz.options.map((opt: string, oIdx: number) => {
//                   const isCorrect = quiz.answer === opt && opt !== '';
//                   return (
//                     <div key={oIdx} className={`flex items-center gap-2 p-2 px-3 border rounded-lg transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-transparent hover:border-input'}`}>
//                       <Button
//                         size="icon"
//                         variant={isCorrect ? 'default' : 'outline'}
//                         className={`h-7 w-7 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
//                         onClick={() => updateQuiz(qIdx, 'answer', opt)}
//                         disabled={!opt.trim()}
//                         title="Mark as correct answer"
//                       >
//                         <Check className={`w-3.5 h-3.5 ${isCorrect ? 'text-white' : 'opacity-30'}`} />
//                       </Button>
//                       <Input
//                         className={`h-9 border-none shadow-none focus-visible:ring-0 ${isCorrect ? 'bg-transparent text-emerald-900 font-medium' : 'bg-transparent'}`}
//                         value={opt}
//                         onChange={(e) => updateQuiz(qIdx, 'option', { optIndex: oIdx, text: e.target.value })}
//                         placeholder={`Option ${oIdx + 1}`}
//                       />
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-dashed">
//                 <Label className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Explanation (Optional)</Label>
//                 <Input
//                   value={quiz.explanation}
//                   onChange={(e) => updateQuiz(qIdx, 'explanation', e.target.value)}
//                   placeholder="Explain why the answer is correct..."
//                   className="h-9 bg-background/50 border-transparent focus:border-input focus:bg-background"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="pt-6 border-t pb-8">
//         <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" size="lg" onClick={onSave}>
//           {isEdit ? 'Save Changes' : 'Publish Course'} <ExternalLink className="w-5 h-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// // ========== CoursesTab Component ==========

// const CoursesTab = () => {
//   const [openCourseDialog, setOpenCourseDialog] = useState(false);
//   const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const role = sessionStorage.getItem('role');
//   const deptId = sessionStorage.getItem('deptId');
//   const activeTab = searchParams.get('tab') || (role === 'dept_admin' ? 'courses' : 'students');
//   const { toast } = useToast();
//   const [stats, setStats] = useState<{ studentCount: number; studentLimit: number; assignmentCount: number; submissionCount: number; placedCount: number }>({ studentCount: 0, studentLimit: 50, assignmentCount: 0, submissionCount: 0, placedCount: 0 });
//   const [students, setStudents] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [assignmentSubmissionStats, setAssignmentSubmissionStats] = useState<Record<string, { total: number; graded: number; pending: number; resubmit: number }>>({});
//   const [assignmentStatsLoading, setAssignmentStatsLoading] = useState(false);
//   const [assignmentDeskFilter, setAssignmentDeskFilter] = useState<'all' | 'review' | 'dueSoon' | 'overdue'>('all');
//   const [notices, setNotices] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [userDeptName, setUserDeptName] = useState('');
//   const [userDeptId, setUserDeptId] = useState(deptId || '');
//   const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
//   const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

//   const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
//   const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
//   const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all', department: '' });
//   const [newCourse, setNewCourse] = useState<any>(createEmptyCourse());
//   const [editCourse, setEditCourse] = useState<any>(null);
//   const [editAICourse, setEditAICourse] = useState<any>(null);
//   const [previewCourse, setPreviewCourse] = useState<any>(null);
//   const [orgSettings, setOrgSettings] = useState<any>(null);
//   const [courseSearch, setCourseSearch] = useState('');
//   const [quizReportsMap, setQuizReportsMap] = useState<Record<string, any>>({});
//   const [quizReportsLoading, setQuizReportsLoading] = useState(false);
//   const [selectedQuizReport, setSelectedQuizReport] = useState<any>(null);
//   const [openQuizReportDialog, setOpenQuizReportDialog] = useState(false);
//   const [expandedQuizAttemptId, setExpandedQuizAttemptId] = useState('');
//   const [openDeptCourseLimitDialog, setOpenDeptCourseLimitDialog] = useState(false);
//   const [deptCourseLimitData, setDeptCourseLimitData] = useState({ requestedCourseLimit: 5 });
//   const [deptLimitRequests, setDeptLimitRequests] = useState<any[]>([]);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

//   // Stats for dashboard
//   const [statsCard, setStatsCard] = useState({
//     totalCourses: 0,
//     publishedCourses: 0,
//     pendingApproval: 0,
//     totalQuizzes: 0,
//     totalStudents: 0
//   });

//   // New features state
//   const [meetings, setMeetings] = useState<any[]>([]);
//   const [projects, setProjects] = useState<any[]>([]);
//   const [materials, setMaterials] = useState<any[]>([]);

//   const [newMeeting, setNewMeeting] = useState({ title: '', link: '', platform: 'google-meet', date: '', time: '', department: getDeptScopedDepartment() });
//   const [newProject, setNewProject] = useState({ title: '', description: '', type: 'Project', department: '', dueDate: '', guidance: '', subtopics: [] as string[], isAiGenerated: false });

//   // Departments & Dept Admins
//   const [departmentsList, setDepartmentsList] = useState<any[]>([]);
//   const [deptAdmins, setDeptAdmins] = useState<any[]>([]);

//   // Staff activity (org_admin only)
//   const [staffLoginLogs, setStaffLoginLogs] = useState<any[]>([]);
//   const [staffLoginLoading, setStaffLoginLoading] = useState(false);
//   const [newMaterial, setNewMaterial] = useState({
//     title: '',
//     description: '',
//     fileUrl: '',
//     file: null,
//     type: 'PDF',
//     department: ''
//   });

//   const getDepartmentValue = (value: any) => {
//     if (!value) return '';
//     if (typeof value === 'string') return value;
//     if (typeof value === 'object') return value._id || value.name || '';
//     return '';
//   };
  
//   const matchesCurrentDepartment = (value: any, departmentId?: any) => {
//     const normalizedValue = getDepartmentValue(value);
//     const normalizedDepartmentId = getDepartmentValue(departmentId);
//     return Boolean(
//       (userDeptName && normalizedValue === userDeptName) ||
//       (deptId && normalizedValue === deptId) ||
//       (deptId && normalizedDepartmentId === deptId)
//     );
//   };

//   // Update stats when courses change
//   useEffect(() => {
//     if (courses.length) {
//       setStatsCard({
//         totalCourses: courses.length,
//         publishedCourses: courses.filter((c: any) => c.isPublished).length,
//         pendingApproval: courses.filter((c: any) => c.approvalStatus === 'pending').length,
//         totalQuizzes: courses.reduce((acc: number, c: any) => {
//           if (c.quizzes) return acc + c.quizzes.length;
//           if (c.content) {
//             try {
//               const parsed = JSON.parse(c.content);
//               return acc + (parsed.quizzes?.length || 0);
//             } catch { return acc; }
//           }
//           return acc;
//         }, 0),
//         totalStudents: students.length
//       });
//     }
//   }, [courses, students]);

//   useEffect(() => {
//     if (!orgId) {
//       console.warn('No organization ID found. Please log out and log back in.');
//       return;
//     }
//     fetchStats();
//     fetchStudents();
//     fetchCourses();
//     fetchAssignments();
//     fetchMeetings();
//     fetchProjects();
//     fetchMaterials();
//     fetchOrgDepartments();
//     fetchOrgDeptAdmins();
//     fetchNotices();
//     fetchDeptLimitRequests();
//   }, [orgId]);

//   useEffect(() => {
//     if (role === 'dept_admin' && (userDeptName || deptId)) {
//       fetchStats();
//       fetchStudents();
//       fetchCourses();
//       fetchAssignments();
//       fetchMeetings();
//       fetchProjects();
//       fetchMaterials();
//       fetchNotices();
//       fetchDeptLimitRequests();
//     }
//   }, [userDeptName, deptId, role]);

//   useEffect(() => {
//     if (role === 'dept_admin' && deptId && departmentsList.length > 0 && !userDeptName) {
//       const myDept = departmentsList.find((d: any) => d._id === deptId);
//       if (myDept) {
//         setUserDeptName(myDept.name);
//         setUserDeptId(myDept._id);
//       }
//     }
//   }, [departmentsList, deptId, role, userDeptName]);

//   useEffect(() => {
//     if (role === 'dept_admin' && (userDeptId || deptId)) {
//       const targetId = getDeptScopedDepartment();
//       setNewAssignment(prev => ({ ...prev, department: targetId }));
//       setNewMeeting(prev => ({ ...prev, department: targetId }));
//       setNewProject(prev => ({ ...prev, department: targetId }));
//       setNewMaterial(prev => ({ ...prev, department: targetId }));
//       setNewNotice(prev => ({ ...prev, department: targetId }));
//       setNewCourse(prev => ({ ...prev, department: targetId }));
//       setNewStudent(prev => ({ ...prev, department: targetId }));
//     }
//   }, [userDeptId, deptId, role]);

//   const fetchOrgDepartments = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`);
//       if (res.data.success) setDepartmentsList(res.data.departments);
//     } catch (e) {
//       console.error("Failed to fetch departments", e);
//     }
//   };

//   const fetchOrgDeptAdmins = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/dept-admins?organizationId=${orgId}`);
//       if (res.data.success) setDeptAdmins(res.data.admins);
//     } catch (e) {
//       console.error("Failed to fetch dept admins", e);
//     }
//   };

//   const fetchMeetings = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/meetings?organizationId=${orgId}`);
//       if (res.data.success) {
//         let meetingsData = res.data.meetings;
//         if (role === 'dept_admin') {
//           meetingsData = meetingsData.filter((m: any) => matchesCurrentDepartment(m.department, m.departmentId));
//         }
//         setMeetings(meetingsData);
//       }
//     } catch (e) {
//       console.error("Failed to fetch meetings", e);
//     }
//   };

//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}`);
//       if (res.data.success) {
//         let projectsData = res.data.projects;
//         if (role === 'dept_admin') {
//           projectsData = projectsData.filter((p: any) => matchesCurrentDepartment(p.department, p.departmentId));
//         }
//         setProjects(projectsData);
//       }
//     } catch (e) {
//       console.error("Failed to fetch projects", e);
//     }
//   };

//   const fetchMaterials = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/materials?organizationId=${orgId}`);
//       if (res.data.success) {
//         let materialsData = res.data.materials;
//         if (role === 'dept_admin') {
//           materialsData = materialsData.filter((m: any) => matchesCurrentDepartment(m.department, m.departmentId));
//         }
//         setMaterials(materialsData);
//       }
//     } catch (e) {
//       console.error("Failed to fetch materials", e);
//     }
//   };

//   const fetchDeptLimitRequests = async () => {
//     try {
//       const endpoint = role === 'dept_admin' 
//         ? `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}&deptAdminId=${sessionStorage.getItem('uid')}`
//         : `${serverURL}/api/org/dept-admin/course-limit/requests?organizationId=${orgId}`;
//       const res = await axios.get(endpoint);
//       if (res.data.success) {
//         setDeptLimitRequests(res.data.requests);
//       }
//     } catch (e) {
//       console.error("Failed to fetch dept limit requests", e);
//     }
//   };

//   const handleDeptCourseLimitRequest = async () => {
//     if (!deptCourseLimitData.requestedCourseLimit || deptCourseLimitData.requestedCourseLimit < 1) {
//       toast({ title: "Error", description: "Please enter a valid number of courses", variant: "destructive" });
//       return;
//     }

//     try {
//       const res = await axios.post(`${serverURL}/api/org/dept-admin/course-limit/request`, {
//         organizationId: orgId,
//         deptAdminId: sessionStorage.getItem('uid'),
//         requestedCourseLimit: deptCourseLimitData.requestedCourseLimit
//       });
      
//       if (res.data.success) {
//         toast({ title: "Request Sent", description: "Your course limit increase request has been sent to the organization admin." });
//         setOpenDeptCourseLimitDialog(false);
//         fetchDeptLimitRequests();
//       } else {
//         toast({ title: "Error", description: res.data.message || "Failed to submit request", variant: "destructive" });
//       }
//     } catch (e: any) {
//       toast({ title: "Error", description: e.response?.data?.message || e.message || "Failed to submit request", variant: "destructive" });
//     }
//   };

//   const fetchAssignments = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
//       if (res.data.success) {
//         let assignmentsData = res.data.assignments;
//         if (role === 'dept_admin') {
//           assignmentsData = assignmentsData.filter((a: any) => matchesCurrentDepartment(a.department, a.departmentId));
//         }
//         setAssignments(assignmentsData);
//       }
//     } catch (e) {
//       console.error("Failed to fetch assignments", e);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/dashboard/stats?organizationId=${orgId}`);
//       if (res.data.success) {
//         setStats(res.data);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   const fetchStudents = async () => {
//     console.log('Fetching students for orgId:', orgId);
//     try {
//       const res = await axios.get(`${serverURL}/api/org/students?organizationId=${orgId}`);
//       console.log('Students response:', res.data);
//       if (res.data.success) {
//         let studentsData = res.data.students;
//         if (role === 'dept_admin') {
//           studentsData = studentsData.filter((s: any) =>
//             (userDeptName && s.department === userDeptName) ||
//             (deptId && (s.departmentId === deptId || s.department === deptId))
//           );
//         }
//         setStudents(studentsData);
//       } else {
//         console.error('Failed to fetch students:', res.data.message);
//       }
//     } catch (e) {
//       console.error('Error fetching students:', e);
//     }
//   }

//   const fetchCourses = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/courses?organizationId=${orgId}`);
//       if (res.data.success) {
//         let coursesData = res.data.courses;
//         if (role === 'dept_admin') {
//           coursesData = coursesData.filter((c: any) =>
//             (userDeptName && c.department === userDeptName) ||
//             (deptId && (c.departmentId === deptId || c.department === deptId))
//           );
//         }
//         setCourses(coursesData);
//         void fetchQuizReports(coursesData.map((c: any) => String(c._id)));
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   const fetchStaffLoginActivity = async () => {
//     if (role !== 'org_admin') return;
//     if (!orgId) return;
//     const requesterId = sessionStorage.getItem('uid') || '';
//     if (!requesterId) return;

//     setStaffLoginLoading(true);
//     try {
//       const res = await axios.get(`${serverURL}/api/org/staff/activity?organizationId=${orgId}&requesterId=${requesterId}&limit=200`);
//       if (res.data?.success) {
//         setStaffLoginLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
//       }
//     } catch (e) {
//       console.error('Failed to fetch staff login activity', e);
//     } finally {
//       setStaffLoginLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === 'activity' && role === 'org_admin') {
//       fetchStaffLoginActivity();
//     }
//   }, [activeTab, orgId, role]);

//   useEffect(() => {
//     if (activeTab !== 'assignments') return;
//     if (!assignments.length) {
//       setAssignmentSubmissionStats({});
//       return;
//     }

//     const fetchAssignmentSubmissionStats = async () => {
//       setAssignmentStatsLoading(true);
//       try {
//         const statsEntries = await Promise.all(
//           assignments.map(async (assignment: any) => {
//             try {
//               const res = await axios.get(`${serverURL}/api/org/assignment/${assignment._id}/submissions`);
//               const submissions = Array.isArray(res.data?.submissions) ? res.data.submissions : [];
//               const graded = submissions.filter((submission: any) => submission.status === 'graded').length;
//               const resubmit = submissions.filter((submission: any) => submission.status === 'resubmit_required').length;
//               const pending = submissions.length - graded - resubmit;

//               return [
//                 assignment._id,
//                 {
//                   total: submissions.length,
//                   graded,
//                   pending,
//                   resubmit,
//                 }
//               ] as const;
//             } catch (error) {
//               console.error(`Failed to fetch submissions for assignment ${assignment._id}`, error);
//               return [
//                 assignment._id,
//                 { total: 0, graded: 0, pending: 0, resubmit: 0 }
//               ] as const;
//             }
//           })
//         );

//         setAssignmentSubmissionStats(Object.fromEntries(statsEntries));
//       } finally {
//         setAssignmentStatsLoading(false);
//       }
//     };

//     fetchAssignmentSubmissionStats();
//   }, [activeTab, assignments]);

//   const fetchQuizReports = async (courseIds?: string[]) => {
//     if (!orgId) return;
//     setQuizReportsLoading(true);
//     try {
//       const requesterId = sessionStorage.getItem('uid');
//       if (!requesterId) return;
//       const res = await axios.get(`${serverURL}/api/org-quiz/reports?organizationId=${orgId}&requesterId=${requesterId}`);
//       if (res.data?.success) {
//         const reports = Array.isArray(res.data.reports) ? res.data.reports : [];
//         const filtered = Array.isArray(courseIds) && courseIds.length > 0
//           ? reports.filter((r: any) => courseIds.includes(String(r.courseId)))
//           : reports;
//         const nextMap: Record<string, any> = {};
//         filtered.forEach((r: any) => {
//           nextMap[String(r.courseId)] = r;
//         });
//         setQuizReportsMap(nextMap);
//       }
//     } catch (e) {
//       console.error('Failed to fetch quiz reports', e);
//     } finally {
//       setQuizReportsLoading(false);
//     }
//   };

//   const fetchNotices = async () => {
//     try {
//       const res = await axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`);
//       if (res.data.success) {
//         let noticesData = res.data.notices;
//         if (role === 'dept_admin') {
//           noticesData = noticesData.filter((n: any) => matchesCurrentDepartment(n.department, n.departmentId));
//         }
//         setNotices(noticesData);
//       }
//     } catch (e) {
//       console.error('Failed to fetch notices:', e);
//     }
//   }

//   const handleCreateAssignment = async () => {
//     try {
//       const assignmentData = {
//         ...newAssignment,
//         organizationId: orgId,
//       };
//       const res = await axios.post(`${serverURL}/api/org/assignment/create`, assignmentData);
//       if (res.data.success) {
//         toast({ title: 'Success', description: 'Assignment created successfully' });
//         setNewAssignment({
//           topic: '',
//           description: '',
//           dueDate: '',
//           department: getDeptScopedDepartment()
//         });
//         fetchAssignments();
//         setOpenAssignmentDialog(false);
//       }
//     } catch (error) {
//       toast({ variant: 'destructive', title: 'Error', description: 'Failed to create assignment' });
//     }
//   };

//   const handleCreateCourse = async (courseData) => {
//     try {
//       const res = await axios.post(`${serverURL}/api/org/course/create`, {
//         ...courseData,
//         organizationId: orgId,
//         createdBy: sessionStorage.getItem('uid')
//       });

//       if (res.data.success) {
//         toast({ title: "Success", description: "Course created successfully" });
//         setNewCourse(role === 'dept_admin'
//           ? { ...createEmptyCourse(), department: getDeptScopedDepartment() }
//           : createEmptyCourse());
//         setOpenCourseDialog(false);
//         fetchCourses();
//       }
//     } catch (e) {
//       toast({ title: "Error", description: "Failed to create course" });
//     }
//   };

//   const handleReviewOrgCourse = async (courseId: string, approvalStatus: 'approved' | 'rejected' | 'pending', approvalNote = '') => {
//     const reviewerId = sessionStorage.getItem('uid') || '';
//     if (!reviewerId) return;
//     try {
//       const res = await axios.post(`${serverURL}/api/org/course/${courseId}/review`, {
//         reviewerId,
//         approvalStatus,
//         approvalNote
//       });
//       if (res.data?.success) {
//         toast({ title: "Success", description: res.data.message || "Course updated" });
//         fetchCourses();
//       } else {
//         toast({ title: "Error", description: res.data?.message || "Failed to update course" });
//       }
//     } catch (e: any) {
//       toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed" });
//     }
//   };

//   const handlePublishOrgCourse = async (courseId: string, nextPublished: boolean) => {
//     const publisherId = sessionStorage.getItem('uid') || '';
//     if (!publisherId) return;
//     try {
//       const res = await axios.post(`${serverURL}/api/org/course/${courseId}/publish`, {
//         publisherId,
//         isPublished: nextPublished
//       });
//       if (res.data?.success) {
//         toast({ title: "Success", description: res.data.message || "Course updated" });
//         fetchCourses();
//       } else {
//         toast({ title: "Error", description: res.data?.message || "Failed to update course" });
//       }
//     } catch (e: any) {
//       toast({ title: "Error", description: e.response?.data?.message || e.message || "Request failed" });
//     }
//   };

//   const handleUpdateCourse = async () => {
//     if (!editCourse) return;
//     try {
//       const res = await axios.put(`${serverURL}/api/org/course/${editCourse._id}`, {
//         ...editCourse,
//         updatedBy: sessionStorage.getItem('uid')
//       });
//       if (res.data.success) {
//         toast({ title: "Success", description: "Course updated successfully" });
//         setEditCourse(null);
//         fetchCourses();
//       }
//     } catch (e) {
//       toast({ title: "Error", description: "Failed to update course" });
//     }
//   };

//   const handleUpdateAICourse = async () => {
//     if (!editAICourse) return;
//     try {
//       const res = await axios.put(`${serverURL}/api/org/course/${editAICourse._id}`, {
//         mainTopic: editAICourse.mainTopic,
//         department: editAICourse.department,
//         updatedBy: sessionStorage.getItem('uid')
//       });
//       if (res.data.success) {
//         toast({ title: "Success", description: "AI Course updated successfully" });
//         setEditAICourse(null);
//         fetchCourses();
//       } else {
//         toast({ title: "Error", description: res.data.message || "Failed to update AI course" });
//       }
//     } catch (e: any) {
//       const errorMessage = e.response?.data?.message || e.message || "Failed to update AI course";
//       toast({ title: "Error", description: errorMessage });
//     }
//   };

//   const handleDeleteCourse = async (courseId: string) => {
//     if (!window.confirm("Are you sure you want to delete this course?")) return;
//     try {
//       const res = await axios.delete(`${serverURL}/api/org/course/${courseId}`);
//       if (res.data.success) {
//         toast({ title: "Success", description: "Course deleted successfully" });
//         fetchCourses();
//       }
//     } catch (e) {
//       toast({ title: "Error", description: "Failed to delete course" });
//     }
//   };

//   const now = new Date();
//   const assignmentInsights = assignments.map((assignment: any) => {
//     const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
//     const statsForAssignment = assignmentSubmissionStats[assignment._id] || { total: 0, graded: 0, pending: 0, resubmit: 0 };
//     const isOverdue = Boolean(dueDate && dueDate < new Date(new Date().setHours(0, 0, 0, 0)));
//     const isDueSoon = Boolean(
//       dueDate &&
//       dueDate >= now &&
//       dueDate.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000
//     );
//     const needsReview = statsForAssignment.pending > 0 || statsForAssignment.resubmit > 0;

//     return {
//       assignment,
//       stats: statsForAssignment,
//       isOverdue,
//       isDueSoon,
//       needsReview,
//     };
//   });
//   const overdueAssignments = assignmentInsights.filter((entry) => entry.isOverdue);
//   const dueSoonAssignments = assignmentInsights.filter((entry) => entry.isDueSoon);
//   const reviewAssignments = assignmentInsights.filter((entry) => entry.needsReview);
//   const filteredAssignmentInsights =
//     assignmentDeskFilter === 'review'
//       ? reviewAssignments
//       : assignmentDeskFilter === 'dueSoon'
//       ? dueSoonAssignments
//       : assignmentDeskFilter === 'overdue'
//       ? overdueAssignments
//       : assignmentInsights;

//   return (
//     <div className="space-y-6 p-6 max-w-7xl mx-auto">
//       {/* Hero Section */}
//       <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 border">
//         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
//         <div className="relative z-10">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 bg-primary/10 rounded-xl">
//               <BookOpen className="w-8 h-8 text-primary" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
//                 Course Management
//               </h1>
//               <p className="text-muted-foreground mt-1">
//                 Create, organize, and publish courses. Track performance and manage student assessments.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
//           <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
//                   <p className="text-3xl font-bold mt-2">{statsCard.totalCourses}</p>
//                   <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
//                 </div>
//                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
//                   <Library className="h-6 w-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
//           <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Published</p>
//                   <p className="text-3xl font-bold mt-2">{statsCard.publishedCourses}</p>
//                   <p className="text-xs text-emerald-600 mt-1">✓ Live courses</p>
//                 </div>
//                 <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
//                   <CheckCircle className="h-6 w-6 text-emerald-500" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
//           <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
//                   <p className="text-3xl font-bold mt-2">{statsCard.pendingApproval}</p>
//                   <p className="text-xs text-amber-600 mt-1">Awaiting review</p>
//                 </div>
//                 <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
//                   <Clock className="h-6 w-6 text-amber-500" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
//           <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
//                   <p className="text-3xl font-bold mt-2">{statsCard.totalQuizzes}</p>
//                   <p className="text-xs text-purple-600 mt-1">Assessment items</p>
//                 </div>
//                 <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
//                   <FileQuestion className="h-6 w-6 text-purple-500" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>

//       {/* Action Bar */}
//       <Card>
//         <CardContent className="p-6">
//           <div className="flex flex-col sm:flex-row justify-between gap-4">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search courses by title or description..."
//                 className="pl-10"
//                 value={courseSearch}
//                 onChange={(e) => setCourseSearch(e.target.value)}
//               />
//             </div>
            
//             <div className="flex gap-2">
//               {/* View Toggle */}
//               <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
//                 <Button
//                   variant={viewMode === 'grid' ? 'default' : 'ghost'}
//                   size="sm"
//                   className="h-8 px-3"
//                   onClick={() => setViewMode('grid')}
//                 >
//                   <Grid3x3 className="h-4 w-4 mr-1" />
//                   Grid
//                 </Button>
//                 <Button
//                   variant={viewMode === 'list' ? 'default' : 'ghost'}
//                   size="sm"
//                   className="h-8 px-3"
//                   onClick={() => setViewMode('list')}
//                 >
//                   <List className="h-4 w-4 mr-1" />
//                   List
//                 </Button>
//               </div>
              
//               {role === 'dept_admin' && (
//                 <Dialog open={openDeptCourseLimitDialog} onOpenChange={setOpenDeptCourseLimitDialog}>
//                   <DialogTrigger asChild>
//                     <Button variant="outline">
//                       <TrendingUp className="w-4 h-4 mr-2" /> Request Increase
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>Request Course Limit Increase</DialogTitle>
//                       <DialogDescription>
//                         Submit a request to increase your course creation capacity.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid gap-2">
//                         <Label>Additional Courses Needed</Label>
//                         <Input
//                           type="number"
//                           min="1"
//                           value={deptCourseLimitData.requestedCourseLimit}
//                           onChange={(e) => setDeptCourseLimitData({ ...deptCourseLimitData, requestedCourseLimit: parseInt(e.target.value) || 1 })}
//                         />
//                       </div>
//                       <Button onClick={handleDeptCourseLimitRequest}>Submit Request</Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               )}

//               {(orgSettings?.allowAICreation !== false) && (
//                 <Button variant="outline" onClick={() => window.location.href = '/dashboard/generate-course'}>
//                   <Sparkles className="w-4 h-4 mr-2" /> AI Generate
//                 </Button>
//               )}
              
//               {(orgSettings?.allowManualCreation !== false) && (
//                 <Dialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>
//                   <DialogTrigger asChild onClick={() => {
//                     setNewCourse(role === 'dept_admin'
//                       ? { ...createEmptyCourse(), department: getDeptScopedDepartment() }
//                       : createEmptyCourse());
//                     setOpenCourseDialog(true);
//                   }}>
//                     <Button>
//                       <Plus className="w-4 h-4 mr-2" /> Create Course
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                       <DialogTitle>Create New Course</DialogTitle>
//                     </DialogHeader>
//                     <CourseForm
//                       course={newCourse}
//                       setCourse={setNewCourse}
//                       onSave={() => handleCreateCourse(newCourse)}
//                       departments={departmentsList}
//                       role={role}
//                     />
//                   </DialogContent>
//                 </Dialog>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Course List - Grid/List View */}
//       <AnimatePresence mode="wait">
//         {courses.filter((c: any) =>
//           (c.title || c.mainTopic || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
//           (c.description || '').toLowerCase().includes(courseSearch.toLowerCase())
//         ).length > 0 ? (
//           <motion.div
//             key={viewMode}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.3 }}
//             className={viewMode === 'grid' 
//               ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
//               : "space-y-4"
//             }
//           >
//             {courses.filter((c: any) =>
//               (c.title || c.mainTopic || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
//               (c.description || '').toLowerCase().includes(courseSearch.toLowerCase())
//             ).map((course: any) => {
//               const title = course.title || course.mainTopic;
//               const description = course.description || (course.content ? "AI Generated Course" : "");
//               let topicCount = 0;
//               let quizCount = 0;
//               const approvalStatus = course.approvalStatus || (course.isPublished === false ? 'pending' : 'approved');
//               const published = course.isPublished !== undefined ? Boolean(course.isPublished) : (course.content ? false : true);

//               if (course.topics) {
//                 topicCount = course.topics.length;
//                 quizCount = course.quizzes?.length || 0;
//               } else if (course.content) {
//                 try {
//                   const content = JSON.parse(course.content);
//                   topicCount = content.course_topics?.length || 0;
//                   quizCount = content.quizzes?.length || 0;
//                 } catch (e) {
//                   console.error("Error parsing course content", e);
//                 }
//               }

//               const getStatusColor = () => {
//                 if (approvalStatus === 'approved' && published) return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
//                 if (approvalStatus === 'approved' && !published) return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
//                 if (approvalStatus === 'pending') return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
//                 if (approvalStatus === 'rejected') return 'border-red-500 bg-red-50 dark:bg-red-950/20';
//                 return 'border-gray-200';
//               };

//               const CourseCard = () => (
//                 <motion.div
//                   whileHover={{ y: -4 }}
//                   transition={{ duration: 0.2 }}
//                   className={`group relative rounded-xl border-2 ${getStatusColor()} bg-card hover:shadow-xl transition-all duration-300 overflow-hidden`}
//                 >
//                   {/* Status Ribbon */}
//                   {approvalStatus === 'pending' && (
//                     <div className="absolute top-3 right-3 z-10">
//                       <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
//                         <Clock className="w-3 h-3 mr-1" /> Pending
//                       </Badge>
//                     </div>
//                   )}
//                   {approvalStatus === 'approved' && !published && (
//                     <div className="absolute top-3 right-3 z-10">
//                       <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
//                         <Eye className="w-3 h-3 mr-1" /> Draft
//                       </Badge>
//                     </div>
//                   )}
//                   {published && (
//                     <div className="absolute top-3 right-3 z-10">
//                       <Badge className="bg-emerald-500 text-white">
//                         <CheckCircle className="w-3 h-3 mr-1" /> Published
//                       </Badge>
//                     </div>
//                   )}

//                   <CardContent className="p-6">
//                     {/* Course Icon */}
//                     <div className="mb-4">
//                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
//                         {course.content ? (
//                           <Sparkles className="w-6 h-6 text-primary" />
//                         ) : (
//                           <BookMarked className="w-6 h-6 text-primary" />
//                         )}
//                       </div>
//                     </div>

//                     {/* Title & Description */}
//                     <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
//                       {title}
//                     </h3>
//                     <div 
//                       className="text-sm text-muted-foreground line-clamp-2 mb-4"
//                       dangerouslySetInnerHTML={{ __html: description }}
//                     />

//                     {/* Stats */}
//                     <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
//                       <div className="flex items-center gap-1">
//                         <Layers className="w-3.5 h-3.5" />
//                         <span>{topicCount} Topics</span>
//                       </div>
//                       {quizCount > 0 && (
//                         <div className="flex items-center gap-1">
//                           <FileQuestion className="w-3.5 h-3.5" />
//                           <span>{quizCount} Quizzes</span>
//                         </div>
//                       )}
//                       <div className="flex items-center gap-1">
//                         <Users className="w-3.5 h-3.5" />
//                         <span>{course.department ? 'Dept' : 'All'}</span>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center justify-between gap-2">
//                       <div className="flex items-center gap-1">
//                         <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setPreviewCourse({ ...course })}>
//                           <Eye className="w-4 h-4" />
//                           <span className="ml-1 text-xs">Preview</span>
//                         </Button>
//                         {quizCount > 0 && (
//                           <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => {
//                             const report = quizReportsMap[String(course._id)];
//                             const normalized = normalizeCourseForEdit(course);
//                             setSelectedQuizReport(report || {
//                               courseId: String(course._id),
//                               title,
//                               questionCount: quizCount,
//                               quizSettings: normalized.quizSettings,
//                               attemptCount: 0,
//                               passedCount: 0,
//                               flaggedCount: 0,
//                               attempts: []
//                             });
//                             setOpenQuizReportDialog(true);
//                           }}>
//                             <BarChart className="w-4 h-4" />
//                             <span className="ml-1 text-xs">Analytics</span>
//                           </Button>
//                         )}
//                       </div>
                      
//                       <div className="flex items-center gap-1">
//                         {role === 'org_admin' && approvalStatus === 'pending' && (
//                           <Button
//                             size="sm"
//                             className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white"
//                             onClick={() => handleReviewOrgCourse(course._id, 'approved', '')}
//                           >
//                             <Check className="w-4 h-4 mr-1" /> Approve
//                           </Button>
//                         )}
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-8 px-2"
//                           onClick={async () => {
//                             const initialDescription = "Generating assignment description...";
//                             setNewAssignment({
//                               topic: title,
//                               description: initialDescription,
//                               dueDate: '',
//                               department: course.department || ''
//                             });
//                             setOpenAssignmentDialog(true);

//                             try {
//                               const res = await axios.post(`${serverURL}/api/prompt`, {
//                                 prompt: `Write a professional 1-2 sentence assignment description for a course titled "${title}".`,
//                                 systemInstruction: "You are an educational assistant. Return only the 1-2 sentence assignment description text."
//                               });
//                               if (res.data.success && res.data.generatedText) {
//                                 setNewAssignment(prev => ({ ...prev, description: res.data.generatedText }));
//                               }
//                             } catch (e) {
//                               console.error("Failed to generate assignment description:", e);
//                             }
//                           }}
//                         >
//                           <FileText className="w-4 h-4" />
//                         </Button>
//                         {(course.topics || course.content) && (
//                           <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => 
//                             course.topics ? setEditCourse(normalizeCourseForEdit(course)) : setEditAICourse({ ...course })
//                           }>
//                             <Pencil className="w-4 h-4" />
//                           </Button>
//                         )}
//                         <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => handleDeleteCourse(course._id)}>
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </motion.div>
//               );

//               const CourseListItem = () => (
//                 <motion.div
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   className={`p-4 border rounded-lg hover:shadow-md transition-all bg-card`}
//                 >
//                   <div className="flex items-center justify-between gap-4">
//                     <div className="flex items-center gap-4 flex-1 min-w-0">
//                       <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
//                         {course.content ? (
//                           <Sparkles className="w-5 h-5 text-primary" />
//                         ) : (
//                           <BookMarked className="w-5 h-5 text-primary" />
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <h3 className="font-semibold truncate">{title}</h3>
//                           {approvalStatus === 'pending' && (
//                             <Badge variant="outline" className="text-amber-600 border-amber-200">
//                               <Clock className="w-3 h-3 mr-1" /> Pending
//                             </Badge>
//                           )}
//                           {published && (
//                             <Badge className="bg-emerald-500 text-white text-xs">
//                               Published
//                             </Badge>
//                           )}
//                         </div>
//                         <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
//                           <span>{topicCount} Topics</span>
//                           {quizCount > 0 && <span>{quizCount} Quizzes</span>}
//                           <span>{course.department ? `Dept: ${course.department}` : 'All students'}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 shrink-0">
//                       <Button variant="ghost" size="sm" onClick={() => setPreviewCourse({ ...course })}>
//                         <Eye className="w-4 h-4" />
//                       </Button>
//                       {quizCount > 0 && (
//                         <Button variant="ghost" size="sm" onClick={() => {
//                           const report = quizReportsMap[String(course._id)];
//                           const normalized = normalizeCourseForEdit(course);
//                           setSelectedQuizReport(report || {
//                             courseId: String(course._id),
//                             title,
//                             questionCount: quizCount,
//                             quizSettings: normalized.quizSettings,
//                             attemptCount: 0,
//                             passedCount: 0,
//                             flaggedCount: 0,
//                             attempts: []
//                           });
//                           setOpenQuizReportDialog(true);
//                         }}>
//                           <BarChart className="w-4 h-4" />
//                         </Button>
//                       )}
//                       <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course._id)}>
//                         <Trash2 className="w-4 h-4 text-destructive" />
//                       </Button>
//                     </div>
//                   </div>
//                 </motion.div>
//               );

//               return viewMode === 'grid' ? <CourseCard key={course._id} /> : <CourseListItem key={course._id} />;
//             })}
//           </motion.div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10"
//           >
//             <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
//               <FolderOpen className="w-10 h-10 text-primary/40" />
//             </div>
//             <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
//             <p className="text-muted-foreground mb-4 max-w-md mx-auto">
//               Get started by creating your first course or using AI to generate one.
//             </p>
//             <div className="flex gap-2 justify-center">
//               {(orgSettings?.allowAICreation !== false) && (
//                 <Button variant="outline" onClick={() => window.location.href = '/dashboard/generate-course'}>
//                   <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
//                 </Button>
//               )}
//               {(orgSettings?.allowManualCreation !== false) && (
//                 <Button onClick={() => setOpenCourseDialog(true)}>
//                   <Plus className="w-4 h-4 mr-2" /> Create Course
//                 </Button>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Create Assignment Dialog */}
//       <Dialog open={openAssignmentDialog} onOpenChange={setOpenAssignmentDialog}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Create Assignment / Assessment</DialogTitle>
//             <DialogDescription>
//               Create a new assignment for students to complete.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label>Topic / Title</Label>
//               <Input 
//                 value={newAssignment.topic} 
//                 onChange={(e) => setNewAssignment({ ...newAssignment, topic: e.target.value })} 
//                 placeholder="Assignment title"
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label>Description</Label>
//               <RichTextEditor
//                 value={newAssignment.description || ''}
//                 onChange={(content) => setNewAssignment({ ...newAssignment, description: content })}
//                 placeholder="Assignment instructions..."
//                 className="min-h-[150px]"
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label>Due Date</Label>
//               <Input 
//                 type="date" 
//                 value={newAssignment.dueDate} 
//                 onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} 
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label>Department (Optional)</Label>
//               <select
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
//                 value={newAssignment.department}
//                 onChange={(e) => setNewAssignment({ ...newAssignment, department: e.target.value })}
//                 disabled={role === 'dept_admin'}
//               >
//                 {role !== 'dept_admin' && <option value="">All Students</option>}
//                 {departmentsList.map((d: any) => (
//                   <option key={d._id} value={d._id}>{d.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <Button onClick={handleCreateAssignment}>Create Assignment</Button>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Course Dialog */}
//       <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Edit Course: {editCourse?.title}</DialogTitle>
//           </DialogHeader>
//           {editCourse && (
//             <CourseForm
//               course={editCourse}
//               setCourse={setEditCourse}
//               onSave={handleUpdateCourse}
//               isEdit
//               departments={departmentsList}
//               role={role}
//             />
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Course Preview Dialog */}
//       <Dialog open={!!previewCourse} onOpenChange={(open) => !open && setPreviewCourse(null)}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{previewCourse?.title || previewCourse?.mainTopic || 'Course Preview'}</DialogTitle>
//             <DialogDescription>
//               {previewCourse?.department ? `Assigned to: ${previewCourse.department}` : 'Assigned to all students'}
//             </DialogDescription>
//           </DialogHeader>
//           {previewCourse && (() => {
//             let parsedContent = null;
//             if (previewCourse.content) {
//               try {
//                 parsedContent = JSON.parse(previewCourse.content);
//               } catch (e) {
//                 console.error('Error parsing course content', e);
//               }
//             }

//             const description = previewCourse.description || parsedContent?.course_description || '';
//             const topics = previewCourse.topics || parsedContent?.course_topics || [];
//             const quizzes = previewCourse.quizzes || parsedContent?.quizzes || [];

//             return (
//               <div className="py-4 space-y-6">
//                 {description && (
//                   <div>
//                     <h4 className="font-semibold mb-2">Description</h4>
//                     <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg"
//                       dangerouslySetInnerHTML={{ __html: description }} />
//                   </div>
//                 )}

//                 <div>
//                   <h4 className="font-semibold mb-3">Course Content</h4>
//                   <div className="space-y-4">
//                     {topics.length > 0 ? topics.map((topic: any, idx: number) => (
//                       <div key={idx} className="border rounded-lg overflow-hidden">
//                         <div className="bg-muted/50 p-3 font-medium flex gap-3">
//                           <span className="text-xs bg-muted px-2 py-1 rounded font-bold">{idx + 1}</span>
//                           {topic.title || topic.topic}
//                         </div>
//                         <div className="p-4 space-y-3 bg-card">
//                           {topic.subtopics && topic.subtopics.length > 0 ? (
//                             topic.subtopics.map((sub: any, sIdx: number) => (
//                               <div key={sIdx} className="pl-4 border-l-2 border-primary/20">
//                                 <h5 className="font-medium text-sm mb-1">{sub.title || sub.subtopic}</h5>
//                                 {sub.videoUrl && (
//                                   <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 flex items-center gap-1 mb-2">
//                                     <Video className="w-3 h-3" /> External Video Link
//                                   </a>
//                                 )}
//                               </div>
//                             ))
//                           ) : (
//                             <p className="text-xs text-muted-foreground pl-4">No subtopics defined.</p>
//                           )}
//                         </div>
//                       </div>
//                     )) : (
//                       <div className="p-4 border border-dashed rounded-lg text-sm text-muted-foreground text-center">
//                         No topics available for this course.
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {quizzes.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold mb-3">Quizzes</h4>
//                     <div className="space-y-3">
//                       {quizzes.map((quiz: any, qIdx: number) => (
//                         <div key={qIdx} className="p-4 border rounded-lg bg-card text-sm">
//                           <p className="font-medium mb-2">{qIdx + 1}. {quiz.question}</p>
//                           <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
//                             {quiz.options && quiz.options.map((opt: string, oIdx: number) => (
//                               <li key={oIdx} className={opt === quiz.answer ? "text-primary font-medium" : ""}>
//                                 {opt}
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })()}
//         </DialogContent>
//       </Dialog>

//       {/* Edit AI Course Dialog */}
//       <Dialog open={!!editAICourse} onOpenChange={(open) => !open && setEditAICourse(null)}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit AI-Generated Course</DialogTitle>
//             <DialogDescription>Update the course title and department assignment</DialogDescription>
//           </DialogHeader>
//           {editAICourse && (
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="mainTopic">Course Title</Label>
//                 <Input
//                   id="mainTopic"
//                   value={editAICourse.mainTopic || ''}
//                   onChange={(e) => setEditAICourse({ ...editAICourse, mainTopic: e.target.value })}
//                   placeholder="Enter course title"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="department">Department (Optional)</Label>
//                 <select
//                   id="department"
//                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
//                   value={editAICourse.department || ''}
//                   onChange={(e) => setEditAICourse({ ...editAICourse, department: e.target.value })}
//                   disabled={role === 'dept_admin'}
//                 >
//                   {role !== 'dept_admin' && <option value="">All Students</option>}
//                   {departmentsList.map((d: any) => (
//                     <option key={d._id} value={d.name}>{d.name}</option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-muted-foreground">
//                   Assign to a specific department or leave empty for all students
//                 </p>
//               </div>
//               <Button onClick={handleUpdateAICourse} className="w-full">
//                 Update Course
//               </Button>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Quiz Report Dialog */}
//       <Dialog
//         open={openQuizReportDialog}
//         onOpenChange={(open) => {
//           setOpenQuizReportDialog(open);
//           if (!open) {
//             setSelectedQuizReport(null);
//             setExpandedQuizAttemptId('');
//           }
//         }}
//       >
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Quiz Report</DialogTitle>
//             <DialogDescription>
//               Attempts, scores, cooldowns, and malpractice flags for this course.
//             </DialogDescription>
//           </DialogHeader>

//           {quizReportsLoading && (
//             <div className="text-sm text-muted-foreground">Loading reports...</div>
//           )}

//           {!quizReportsLoading && selectedQuizReport && (() => {
//             const settings = {
//               ...defaultQuizSettings,
//               ...(selectedQuizReport.quizSettings || {}),
//               proctoring: {
//                 ...defaultQuizSettings.proctoring,
//                 ...(selectedQuizReport.quizSettings?.proctoring || {})
//               }
//             };
//             const attempts = Array.isArray(selectedQuizReport.attempts) ? selectedQuizReport.attempts : [];

//             return (
//               <div className="space-y-4">
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <h3 className="text-lg font-semibold">{selectedQuizReport.title || 'Course'}</h3>
//                     <p className="text-sm text-muted-foreground">
//                       {selectedQuizReport.questionCount || 0} questions in bank, difficulty: {settings.difficultyMode}, pass mark: {settings.passPercentage}%.
//                     </p>
//                   </div>
//                   {settings.examMode ? (
//                     <Badge variant="secondary" className="gap-1">
//                       <Shield className="w-4 h-4" /> Secure exam
//                     </Badge>
//                   ) : (
//                     <Badge variant="outline">Standard quiz</Badge>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                   <div className="p-3 rounded-lg border bg-muted/20">
//                     <div className="text-xs text-muted-foreground">Attempt policy</div>
//                     <div className="font-semibold text-sm">{settings.attemptLimit} attempts, cooldown {settings.cooldownMinutes} min</div>
//                   </div>
//                   <div className="p-3 rounded-lg border bg-muted/20">
//                     <div className="text-xs text-muted-foreground">Summary</div>
//                     <div className="font-semibold text-sm">
//                       Attempts {selectedQuizReport.attemptCount || 0}, passed {selectedQuizReport.passedCount || 0}, flagged {selectedQuizReport.flaggedCount || 0}
//                     </div>
//                   </div>
//                   <div className="p-3 rounded-lg border bg-muted/20">
//                     <div className="text-xs text-muted-foreground">Shuffle</div>
//                     <div className="font-semibold text-sm">
//                       Questions {settings.shuffleQuestions ? 'on' : 'off'}, options {settings.shuffleOptions ? 'on' : 'off'}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border rounded-lg overflow-hidden">
//                   <div className="grid grid-cols-12 gap-2 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
//                     <div className="col-span-3">Student</div>
//                     <div className="col-span-1">Try</div>
//                     <div className="col-span-2">Score</div>
//                     <div className="col-span-2">Result</div>
//                     <div className="col-span-2">Flags</div>
//                     <div className="col-span-2">Submitted</div>
//                   </div>
//                   {attempts.length === 0 ? (
//                     <div className="p-4 text-sm text-muted-foreground">No attempts yet.</div>
//                   ) : (
//                     <div className="divide-y">
//                       {attempts.map((a: any) => {
//                         const submitted = a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '-';
//                         const eventSummary = a.eventSummary || {};
//                         const eventBadges = Object.entries(eventSummary).slice(0, 3);
//                         const isExpanded = expandedQuizAttemptId === String(a.attemptId);
//                         return (
//                           <div key={a.attemptId} className="border-t first:border-t-0">
//                             <div className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center">
//                               <div className="col-span-3">
//                                 <div className="font-medium truncate">{a.studentName || 'Student'}</div>
//                                 <div className="text-xs text-muted-foreground truncate">{a.studentEmail || ''}</div>
//                               </div>
//                               <div className="col-span-1 text-muted-foreground">{a.attemptNumber || 1}</div>
//                               <div className="col-span-2">{a.score || 0}/{a.totalQuestions || 0} ({a.percentage || 0}%)</div>
//                               <div className="col-span-2">
//                                 {a.passed ? (
//                                   <Badge className="bg-emerald-600 text-white border-0">Passed</Badge>
//                                 ) : (
//                                   <Badge variant="outline">Failed</Badge>
//                                 )}
//                               </div>
//                               <div className="col-span-2 flex items-center gap-2">
//                                 {a.malpracticeFlag ? (
//                                   <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1">
//                                     <AlertTriangle className="w-3.5 h-3.5" /> Malpractice
//                                   </Badge>
//                                 ) : (
//                                   <span className="text-xs text-muted-foreground">None</span>
//                                 )}
//                                 <span className="text-xs text-muted-foreground">{a.securityEventCount || 0} events</span>
//                               </div>
//                               <div className="col-span-2 text-xs text-muted-foreground">
//                                 <div>{submitted}</div>
//                                 {eventBadges.length > 0 && (
//                                   <div className="mt-1 flex flex-wrap gap-1">
//                                     {eventBadges.map(([eventType, count]) => (
//                                       <Badge key={`${a.attemptId}-${eventType}`} variant="outline" className="text-[10px]">
//                                         {eventType}: {String(count)}
//                                       </Badge>
//                                     ))}
//                                   </div>
//                                 )}
//                                 {(a.securityEvents?.length || 0) > 0 && (
//                                   <button
//                                     type="button"
//                                     className="mt-2 text-[11px] font-semibold text-primary"
//                                     onClick={() => setExpandedQuizAttemptId(isExpanded ? '' : String(a.attemptId))}
//                                   >
//                                     {isExpanded ? 'Hide details' : 'View details'}
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                             {isExpanded && (a.securityEvents?.length || 0) > 0 && (
//                               <div className="border-t bg-muted/20 px-3 py-3">
//                                 <div className="space-y-2">
//                                   {a.securityEvents.map((event: any, index: number) => (
//                                     <div key={`${a.attemptId}-event-${index}`} className="rounded-lg border bg-background px-3 py-2">
//                                       <div className="flex items-center justify-between gap-2">
//                                         <div className="flex items-center gap-2">
//                                           <Badge variant="outline">{event.type}</Badge>
//                                           <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'}>
//                                             {event.severity}
//                                           </Badge>
//                                         </div>
//                                         <span className="text-[11px] text-muted-foreground">
//                                           {event.timestamp ? new Date(event.timestamp).toLocaleString() : '-'}
//                                         </span>
//                                       </div>
//                                       {event.details && (
//                                         <p className="mt-2 text-xs text-muted-foreground">{event.details}</p>
//                                       )}
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })()}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default CoursesTab;


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
import RichTextEditor from '@/components/RichTextEditor';
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
        <div className="mx-auto max-w-4xl space-y-8 px-0 py-4 sm:px-1">
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
                <div className="flex flex-col gap-3 border-b pb-2 sm:flex-row sm:items-end sm:justify-between">
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
                                className={`flex cursor-pointer flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${expandedTopic === tIdx ? 'bg-primary/5 border-b' : 'hover:bg-muted/50'}`}
                                onClick={() => setExpandedTopic(expandedTopic === tIdx ? null : tIdx)}
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                        {tIdx + 1}
                                    </div>
                                    <Input
                                        className="h-9 w-full bg-transparent border-transparent font-semibold text-base transition-all hover:border-input focus:border-input focus:bg-background sm:max-w-md"
                                        value={topic.title}
                                        onChange={(e) => updateTopic(tIdx, 'title', e.target.value)}
                                        placeholder="Lesson Title"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-1">
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
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                <div className="flex flex-col gap-3 border-b pb-2 sm:flex-row sm:items-end sm:justify-between">
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
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                                <div className="w-full space-y-1.5 sm:w-36">
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

const CoursesTab = () => {
    const [openCourseDialog, setOpenCourseDialog] = useState(false);
    const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
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
    const [userDeptName, setUserDeptName] = useState('');
    const [userDeptId, setUserDeptId] = useState(deptId || '');
    const getDeptScopedDepartment = () => (role === 'dept_admin' ? (userDeptId || deptId || '') : '');
    const orgId = sessionStorage.getItem('orgId') || sessionStorage.getItem('uid');

    const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', department: '', section: '', studentClass: '', rollNo: '', academicYear: '' });
    const [newAssignment, setNewAssignment] = useState({ topic: '', description: '', dueDate: '', department: '' });
    const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all', department: '' });
    const [newCourse, setNewCourse] = useState<any>(createEmptyCourse());
    const [editCourse, setEditCourse] = useState<any>(null);
    const [editAICourse, setEditAICourse] = useState<any>(null);
    const [previewCourse, setPreviewCourse] = useState<any>(null);
    const [orgSettings, setOrgSettings] = useState<any>(null);
    const [courseSearch, setCourseSearch] = useState('');
    const [quizReportsMap, setQuizReportsMap] = useState<Record<string, any>>({});
    const [quizReportsLoading, setQuizReportsLoading] = useState(false);
    const [selectedQuizReport, setSelectedQuizReport] = useState<any>(null);
    const [openQuizReportDialog, setOpenQuizReportDialog] = useState(false);
    const [expandedQuizAttemptId, setExpandedQuizAttemptId] = useState('');
    const [openDeptCourseLimitDialog, setOpenDeptCourseLimitDialog] = useState(false);
    const [deptCourseLimitData, setDeptCourseLimitData] = useState({ requestedCourseLimit: 5 });
    const [deptLimitRequests, setDeptLimitRequests] = useState<any[]>([]);

    // New features state
    const [meetings, setMeetings] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);



    const [newMeeting, setNewMeeting] = useState({ title: '', link: '', platform: 'google-meet', date: '', time: '', department: getDeptScopedDepartment() });
    const [newProject, setNewProject] = useState({ title: '', description: '', type: 'Project', department: '', dueDate: '', guidance: '', subtopics: [] as string[], isAiGenerated: false });

    // Departments & Dept Admins
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);
    const [deptAdmins, setDeptAdmins] = useState<any[]>([]);

    // Staff activity (org_admin only)
    const [staffLoginLogs, setStaffLoginLogs] = useState<any[]>([]);
    const [staffLoginLoading, setStaffLoginLoading] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        fileUrl: '',
        file: null,
        type: 'PDF',
        department: ''
    });


    const getDepartmentValue = (value: any) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.name || '';
        return '';
    };
    const getDepartmentLabel = (value: any) => {
        const normalizedValue = getDepartmentValue(value);
        if (!normalizedValue || normalizedValue === 'all') return '';
        return departmentsList.find((d: any) => d._id === normalizedValue || d.name === normalizedValue)?.name || normalizedValue;
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
        // console.log('Fetching students for orgId:', orgId);
        try {
            const res = await axios.get(`${serverURL}/api/org/students?organizationId=${orgId}`);
            // console.log('Students response:', res.data);
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


 
 
    const now = new Date();
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

    const visibleCourses = courses.filter((course: any) => {
        const approvalStatus = course.approvalStatus || (course.isPublished === false ? 'draft' : 'approved');
        if (role === 'org_admin') {
            return approvalStatus !== 'draft';
        }
        return true;
    });

   

    return (
        
               <>
                   {/* COURSES TAB */}
                               <div className="space-y-4 pt-0 md:pt-0 lg:pt-[60px]">
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
                                           <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                               <Input
                                                   placeholder="Search courses..."
                                                   className="w-full md:max-w-sm md:flex-1 lg:max-w-sm"
                                                   value={courseSearch}
                                                   onChange={(e) => setCourseSearch(e.target.value)}
                                               />
                                               <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end md:gap-2.5">
                                                   {role === 'dept_admin' && (
                                                       <Dialog open={openDeptCourseLimitDialog} onOpenChange={setOpenDeptCourseLimitDialog}>
                                                           <DialogTrigger asChild>
                                                               <Button variant="outline" className="w-full sm:w-auto">
                                                                   <Plus className="w-4 h-4 mr-2" /> Request Limit Increase
                                                               </Button>
                                                           </DialogTrigger>
                                                           <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg">
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
                                                       <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.href = '/dashboard/generate-course'}>
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
                                                               <Button className="w-full sm:w-auto">
                                                                   <Plus className="w-4 h-4 mr-2" /> Create Course
                                                               </Button>
                                                           </DialogTrigger>
               
                                                           <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-4xl">
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
                                               {visibleCourses.length > 0 ? (
                                                   visibleCourses.filter((c: any) =>
                                                       (c.title || c.mainTopic || '').toLowerCase().includes(courseSearch.toLowerCase()) ||
                                                       (c.description || '').toLowerCase().includes(courseSearch.toLowerCase())
                                                   ).map((course: any) => {
                                                       const title = course.title || course.mainTopic;
                                                       const description = course.description || (course.content ? "AI Generated Course" : "");
                                                       let topicCount = 0;
                                                       let quizCount = 0;
                                                       // Both OrgCourse and AI Course now support approval workflow
                                                       const approvalStatus = course.approvalStatus || (course.isPublished === false ? 'draft' : 'approved');
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
               
                                                       const courseCardClassName =
                                                           approvalStatus === 'rejected'
                                                               ? 'rounded-lg border border-red-200 bg-red-50 p-4'
                                                               : published
                                                               ? 'rounded-lg border border-emerald-200 bg-emerald-50 p-4'
                                                               : 'rounded-lg border bg-card p-4';

                                                       return (
                                                           <div key={course._id} className={courseCardClassName}>
                                                               <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                                   <div className="min-w-0 flex-1">
                                                                       <h3 className="font-semibold text-lg capitalize">{title}</h3>
                                                                       <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: description }} />
                                                                       <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
                                                                           <span>{topicCount} Topics</span>
                                                                           {quizCount > 0 && <span>{quizCount} Quizzes</span>}
                                                                           <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                               {course.department ? `Dept: ${departmentsList.find(d => d._id === course.department || d.name === course.department)?.name || course.department}` : (course.content ? 'AI Generated' : 'All students')}
                                                                           </span>
                                                                       </div>
                                                                       <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                           {approvalStatus === 'draft' && (
                                                                               <Badge variant="secondary" className="gap-1">
                                                                                   Draft
                                                                               </Badge>
                                                                           )}
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
                                                                   <div className="flex flex-wrap gap-2 md:max-w-[15rem] md:justify-end lg:max-w-none">
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
                                                                               className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
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
                                                                               className={published ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"}
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
                                                                       <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm" onClick={async () => {
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
                                               <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-4xl">
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
                                                               <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
               
                                                               <div className="overflow-x-auto rounded-lg border">
                                                                   <div className="min-w-[720px]">
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
                                                           </div>
                                                       );
                                                   })()}
                                               </DialogContent>
                                           </Dialog>
                                       </CardContent>
                                   </Card>
                               </div>
               
 {/* Create Assignment Dialog - Moved outside loop for global access */}
            <Dialog open={openAssignmentDialog} onOpenChange={setOpenAssignmentDialog}>
                <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg">
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
                    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateAssignment}>Create</Button>
                </DialogContent>
            </Dialog>


                <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
                               <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-4xl">
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
                               <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-4xl">
                                   <DialogHeader>
                                       <DialogTitle>{previewCourse?.title || previewCourse?.mainTopic || 'Course Preview'}</DialogTitle>
                                       <DialogDescription>
                                           {getDepartmentLabel(previewCourse?.department) ? `Assigned to: ${getDepartmentLabel(previewCourse?.department)}` : 'Assigned to all students'}
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
                                                           <div key={idx} className="overflow-hidden rounded-lg border">
                                                               <div className="flex flex-col gap-2 bg-muted/50 p-3 font-medium sm:flex-row sm:items-center">
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
                               <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl">
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
               </>
            );
};

export default CoursesTab;
