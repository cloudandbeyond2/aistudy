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
      'Structure like a university textbook chapter. Start with a Definition callout for key terms, use numbered sections (1.1, 1.2) with formal headings, include Key Insight callouts, at least one Worked Example, a Chapter Summary with numbered recap, and a Key Terms Glossary. Tone: formal, precise, third-person.',
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
      'Write as lecture notes a teacher can present in class. Start with a Lecture Objective, use Teaching Points as headers, include inline cues like [Pause here for questions] and [Ask class: ...], add Board Notes summaries, a Classroom Activity, and a Lecture Recap. Tone: conversational but authoritative.',
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
      'Write as an exam preparation study guide. Start with a High-Yield Summary of 5-7 key facts, use Probable Question headings with exam-style answers, include Short Answer Practice questions, Common Exam Mistakes, a Memory Aid (mnemonic or comparison table), and a Quick Revision Checklist. Tone: direct, concise, urgency-focused.',
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
      'Write as a friendly senior student explaining to a confused junior. Start with Why Should You Care, use everyday analogies, keep sentences under 20 words, break ideas into The Simple Version and The Full Picture, include a Real Life Example, a Still Confused? section, and end with What You Should Remember. Tone: warm, encouraging, first-person plural.',
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
      'Write as a professional development resource for working adults. Start with an Executive Brief (3-sentence overview), use Framework headings, include a Decision Matrix or Comparison Table, a Workplace Application section, an Implementation Checklist, and Key Takeaways for Practitioners. Tone: polished, neutral, third-person professional.',
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
      'Write as a business analyst creating an internal knowledge document. Start with Business Context (impact on revenue/operations), use KPI Impact sections, include a Process Flow in numbered steps, a Stakeholder View for different roles, a Case Scenario with numbers, a Dashboard Concept section, and end with Action Items. Tone: results-driven, data-aware.',
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
      'Write as a hands-on workshop guide for active learning. Start with What You Will Build/Learn, structure as numbered steps (Step 1, Step 2), include Checkpoints every 2-3 steps, a Try It Yourself exercise, Common Pitfalls with fixes, a Challenge for advanced learners, and a Progress Check with 3 questions. Tone: motivating, action-oriented, second-person.',
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
