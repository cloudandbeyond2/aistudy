import {
  BookOpen,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Lightbulb,
  User,
  type LucideIcon,
} from 'lucide-react';

export const COURSE_PRESENTATION_IDS = [
  'textbook_notes',
  'lecturer_notes',
  'exam_pattern',
  'student_friendly',
  'professional_format',
  'business_format',
  'learn_format',
] as const;

export type CoursePresentationId = (typeof COURSE_PRESENTATION_IDS)[number];

export interface CoursePresentationMeta {
  id: CoursePresentationId;
  label: string;
  shortLabel: string;
  summary: string;
  promptInstruction: string;
  icon: LucideIcon;
  surfaceClass: string;
  badgeClass: string;
}

export const COURSE_PRESENTATIONS: CoursePresentationMeta[] = [
  {
    id: 'textbook_notes',
    label: 'Textbook Notes',
    shortLabel: 'Textbook',
    summary: 'Definition-first lessons with structured explanations, examples, and recap points.',
    promptInstruction:
      'Write in a textbook-notes style. Start with core concepts, define important terms clearly, build the explanation in a structured sequence, and end with short recap points.',
    icon: BookOpen,
    surfaceClass: 'border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/30',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-200',
  },
  {
    id: 'lecturer_notes',
    label: 'Lecturer Notes',
    shortLabel: 'Lecturer',
    summary: 'Lecture-ready material with teaching flow, emphasis points, and classroom examples.',
    promptInstruction:
      'Write like lecturer notes. Keep the lesson teachable, include concept emphasis, spoken-style explanation cues, and examples a trainer or faculty member could present in class.',
    icon: GraduationCap,
    surfaceClass: 'border-violet-200 bg-violet-50/80 dark:border-violet-900/50 dark:bg-violet-950/30',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-200',
  },
  {
    id: 'exam_pattern',
    label: 'Exam Pattern',
    shortLabel: 'Exam',
    summary: 'Revision-focused content with high-yield points, likely questions, and answer framing.',
    promptInstruction:
      'Write in an exam-oriented style. Highlight key points, likely short-answer and long-answer angles, revision cues, and concise takeaways students can review quickly before assessment.',
    icon: ClipboardCheck,
    surfaceClass: 'border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-200',
  },
  {
    id: 'student_friendly',
    label: 'Student Format',
    shortLabel: 'Student',
    summary: 'Simple, approachable lessons with plain language and relatable examples.',
    promptInstruction:
      'Write in a student-friendly format. Use simple language, shorter paragraphs, approachable examples, and explain difficult ideas without sounding overly formal.',
    icon: User,
    surfaceClass: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200',
  },
  {
    id: 'professional_format',
    label: 'Professional Format',
    shortLabel: 'Professional',
    summary: 'Polished, workplace-ready content with frameworks, application, and decision context.',
    promptInstruction:
      'Write in a professional format. Use a polished tone, include practical workplace framing, real-world application, decision factors, and structured examples suitable for professionals.',
    icon: Briefcase,
    surfaceClass: 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40',
    badgeClass: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  {
    id: 'business_format',
    label: 'Business Format',
    shortLabel: 'Business',
    summary: 'Scenario-driven lessons with KPI, workflow, stakeholder, and operations examples.',
    promptInstruction:
      'Write in a business format. Use business scenarios, KPI-driven examples, workflows, stakeholder decisions, operations context, and product or process thinking where relevant.',
    icon: Layers,
    surfaceClass: 'border-rose-200 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/30',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-200',
  },
  {
    id: 'learn_format',
    label: 'Learn Format',
    shortLabel: 'Learn',
    summary: 'Step-by-step learning flow with checkpoints, mini tasks, and skill-building momentum.',
    promptInstruction:
      'Write in a learn-by-doing format. Break ideas into steps, include mini checkpoints, action-oriented examples, and build understanding progressively from basic to applied.',
    icon: Lightbulb,
    surfaceClass: 'border-primary/30 bg-primary/5',
    badgeClass: 'bg-primary/10 text-primary',
  },
];

const presentationMap = Object.fromEntries(
  COURSE_PRESENTATIONS.map((presentation) => [presentation.id, presentation])
) as Record<CoursePresentationId, CoursePresentationMeta>;

export const getCoursePresentationMeta = (
  id?: string | null
): CoursePresentationMeta =>
  presentationMap[(id as CoursePresentationId) || 'learn_format'] ||
  presentationMap.learn_format;
