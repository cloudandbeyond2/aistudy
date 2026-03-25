import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Save,
  Download,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

const getDepartmentValue = (value: any) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.name || '';
  return '';
};

const formatSubmissionStatus = (submission: any) => {
  if (submission?.status === 'resubmit_required') return 'Resubmit Required';
  if (submission?.status === 'graded') return `Graded${submission?.grade ? ` (${submission.grade})` : ''}`;
  if (submission?.status === 'submitted') return 'Submitted';
  return submission?.status || 'Pending';
};

const isImageFile = (fileUrl: string) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl);
const isPdfFile = (fileUrl: string) => /\.pdf$/i.test(fileUrl);

export default function StaffGrading() {
  const { toast } = useToast();
  const orgId = sessionStorage.getItem('orgId') || '';
  const role = sessionStorage.getItem('role');
  const deptId = sessionStorage.getItem('deptId') || '';
  const deptName = sessionStorage.getItem('deptName') || '';

  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentSubmissionStats, setAssignmentSubmissionStats] = useState<Record<string, { total: number; graded: number; pending: number; resubmit: number }>>({});
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    fetchAssignments();
  }, [orgId, deptId, deptName, role]);

  useEffect(() => {
    if (!assignments.length) {
      setAssignmentSubmissionStats({});
      return;
    }

    const fetchSubmissionStats = async () => {
      try {
        const statsEntries = await Promise.all(
          assignments.map(async (assignment: any) => {
            try {
              const res = await axios.get(`${serverURL}/api/org/assignment/${assignment._id}/submissions`);
              const nextSubmissions = Array.isArray(res.data?.submissions) ? res.data.submissions : [];
              const graded = nextSubmissions.filter((submission: any) => submission.status === 'graded').length;
              const resubmit = nextSubmissions.filter((submission: any) => submission.status === 'resubmit_required').length;
              const pending = nextSubmissions.length - graded - resubmit;

              return [
                assignment._id,
                { total: nextSubmissions.length, graded, pending, resubmit }
              ] as const;
            } catch (error) {
              console.error(`Failed to fetch submission stats for ${assignment._id}`, error);
              return [assignment._id, { total: 0, graded: 0, pending: 0, resubmit: 0 }] as const;
            }
          })
        );

        setAssignmentSubmissionStats(Object.fromEntries(statsEntries));
      } catch (error) {
        console.error('Failed to fetch assignment submission stats', error);
      }
    };

    fetchSubmissionStats();
  }, [assignments]);

  useEffect(() => {
    if (!selectedAssignmentId) return;
    fetchSubmissions(selectedAssignmentId);
  }, [selectedAssignmentId]);

  useEffect(() => {
    const currentSubmission = submissions[currentSubmissionIndex];
    setSelectedGrade(currentSubmission?.grade || '');
  }, [submissions, currentSubmissionIndex]);

  const matchesCurrentDepartment = (value: any, departmentId?: any) => {
    const normalizedValue = getDepartmentValue(value);
    const normalizedDepartmentId = getDepartmentValue(departmentId);
    return Boolean(
      (deptName && normalizedValue === deptName) ||
      (deptId && normalizedValue === deptId) ||
      (deptId && normalizedDepartmentId === deptId)
    );
  };

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`);
      if (res.data?.success) {
        let nextAssignments = Array.isArray(res.data.assignments) ? res.data.assignments : [];
        if (role === 'dept_admin') {
          nextAssignments = nextAssignments.filter((assignment: any) =>
            matchesCurrentDepartment(assignment.department, assignment.departmentId)
          );
        }
        setAssignments(nextAssignments);
      }
    } catch (error) {
      console.error('Failed to fetch assignments', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    setLoadingSubmissions(true);
    try {
      const res = await axios.get(`${serverURL}/api/org/assignment/${assignmentId}/submissions`);
      if (res.data?.success) {
        const nextSubmissions = Array.isArray(res.data.submissions) ? res.data.submissions : [];
        setSubmissions(nextSubmissions);
        setCurrentSubmissionIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch submissions', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment submissions.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSave = async () => {
    const currentSubmission = submissions[currentSubmissionIndex];
    if (!currentSubmission?._id || !selectedGrade) {
      toast({
        title: 'Missing grade',
        description: 'Select a grade before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await axios.post(
        `${serverURL}/api/org/assignment/submission/${currentSubmission._id}/grade`,
        { grade: selectedGrade }
      );

      if (res.data?.success) {
        const nextStatus = selectedGrade === 'E' ? 'resubmit_required' : 'graded';
        setSubmissions((prev) =>
          prev.map((submission) =>
            submission._id === currentSubmission._id
              ? { ...submission, grade: selectedGrade, status: nextStatus }
              : submission
          )
        );
        setAssignmentSubmissionStats((prev) => {
          const activeAssignmentStats = prev[selectedAssignmentId || ''] || { total: 0, graded: 0, pending: 0, resubmit: 0 };
          const nextStats = { ...activeAssignmentStats };
          const previousStatus = currentSubmission.status;

          if (previousStatus === 'graded') nextStats.graded = Math.max(0, nextStats.graded - 1);
          if (previousStatus === 'resubmit_required') nextStats.resubmit = Math.max(0, nextStats.resubmit - 1);
          if (previousStatus === 'submitted' || previousStatus === 'pending') nextStats.pending = Math.max(0, nextStats.pending - 1);

          if (nextStatus === 'graded') nextStats.graded += 1;
          if (nextStatus === 'resubmit_required') nextStats.resubmit += 1;

          return {
            ...prev,
            [selectedAssignmentId || '']: nextStats,
          };
        });

        toast({
          title: 'Grade saved',
          description: 'Submission updated successfully.',
        });
      }
    } catch (error) {
      console.error('Failed to grade submission', error);
      toast({
        title: 'Error',
        description: 'Failed to save grade.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const activeAssignment = assignments.find((assignment) => assignment._id === selectedAssignmentId) || null;
  const currentSubmission = submissions[currentSubmissionIndex] || null;
  const pendingReviewCount = Object.values(assignmentSubmissionStats).reduce((sum, stats) => sum + stats.pending + stats.resubmit, 0);
  const activeAssignmentCount = assignments.length;
  const completedAssignmentCount = assignments.filter((assignment) => {
    const stats = assignmentSubmissionStats[assignment._id];
    return stats && stats.total > 0 && stats.pending === 0 && stats.resubmit === 0;
  }).length;

  if (selectedAssignmentId && activeAssignment) {
    const fileUrl = currentSubmission?.fileUrl ? `${serverURL}${currentSubmission.fileUrl}` : '';

    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col -m-4 lg:-m-8">
        <div className="z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAssignmentId(null)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                {activeAssignment.topic}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Due {activeAssignment.dueDate ? new Date(activeAssignment.dueDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setCurrentSubmissionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSubmissionIndex === 0}
                className="rounded-md p-1.5 transition-all hover:bg-white disabled:opacity-30 dark:hover:bg-slate-700"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="min-w-[120px] text-center text-sm font-medium text-gray-600 dark:text-slate-300">
                Submission {submissions.length === 0 ? 0 : currentSubmissionIndex + 1} of {submissions.length}
              </span>

              <button
                onClick={() => setCurrentSubmissionIndex((prev) => Math.min(submissions.length - 1, prev + 1))}
                disabled={currentSubmissionIndex === submissions.length - 1 || submissions.length === 0}
                className="rounded-md p-1.5 transition-all hover:bg-white disabled:opacity-30 dark:hover:bg-slate-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mx-2 h-8 w-px bg-gray-200 dark:bg-slate-700"></div>

            <button
              onClick={handleGradeSave}
              disabled={isSaving || !currentSubmission}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-slate-950">
          <div className="relative flex flex-1 flex-col border-r border-gray-200 dark:border-slate-700">
            <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
              <button onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))} className="text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
                <ZoomOut size={18} />
              </button>
              <span className="w-12 text-center text-xs font-medium text-gray-600 dark:text-slate-300">
                {zoomLevel}%
              </span>
              <button onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))} className="text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
                <ZoomIn size={18} />
              </button>
              <div className="h-4 w-px bg-gray-300 dark:bg-slate-600"></div>
              <button onClick={() => setRotation((prev) => (prev + 90) % 360)} className="text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
                <RotateCw size={18} />
              </button>
              <button className="text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
                <Maximize2 size={18} />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100/50 p-8 dark:bg-slate-900">
              {loadingSubmissions ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : !currentSubmission ? (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-muted-foreground dark:bg-slate-900">
                  No submissions received yet.
                </div>
              ) : currentSubmission.fileUrl && isImageFile(currentSubmission.fileUrl) ? (
                <div
                  className="origin-center bg-white shadow-lg transition-transform duration-200 ease-out dark:bg-slate-800"
                  style={{ transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`, maxWidth: '100%', maxHeight: '100%' }}
                >
                  <img
                    src={fileUrl}
                    alt="Student submission"
                    className="h-auto max-w-full object-contain"
                    draggable={false}
                  />
                </div>
              ) : currentSubmission.fileUrl && isPdfFile(currentSubmission.fileUrl) ? (
                <div
                  className="h-full w-full overflow-hidden rounded-xl border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  style={{ transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)` }}
                >
                  <iframe title="Submission PDF" src={fileUrl} className="h-[75vh] w-[60vw]" />
                </div>
              ) : currentSubmission.content ? (
                <div
                  className="max-w-3xl rounded-xl border bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  style={{ transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)` }}
                >
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Text Submission
                  </h3>
                  <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {currentSubmission.content}
                  </div>
                </div>
              ) : currentSubmission.fileUrl ? (
                <div className="rounded-xl border bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <FileText className="mx-auto mb-4 h-10 w-10 text-blue-600" />
                  <p className="mb-3 font-medium text-slate-900 dark:text-white">File preview is not available for this type.</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Open submission file
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <AlertCircle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
                  <p className="font-medium text-slate-900 dark:text-white">No preview available for this submission.</p>
                </div>
              )}
            </div>
          </div>

          <div className="z-10 flex w-96 flex-col bg-white shadow-xl dark:bg-slate-900">
            <div className="border-b border-gray-200 p-6 dark:border-slate-700">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentSubmission?.studentId?.mName || 'Student'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {currentSubmission?.studentId?.email || 'No email'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    Roll No: {currentSubmission?.studentId?.studentDetails?.rollNo || '-'}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    currentSubmission?.status === 'graded'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : currentSubmission?.status === 'resubmit_required'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}
                >
                  {formatSubmissionStatus(currentSubmission)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                <Clock size={12} />
                Submitted {currentSubmission?.submittedAt ? new Date(currentSubmission.submittedAt).toLocaleString() : '-'}
              </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Grade
                </label>

                <div className="grid grid-cols-5 gap-2">
                  {GRADE_OPTIONS.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                        selectedGrade === grade
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : grade === 'E'
                          ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
                          : 'border-gray-200 bg-white text-slate-900 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Grade `E` marks the submission as resubmission required in the current backend flow.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <FileText size={16} />
                  Submission Details
                </label>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Current State
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {currentSubmission?.grade ? `Saved grade: ${currentSubmission.grade}` : 'No grade has been saved yet.'}
                  </p>
                  {currentSubmission?.content && (
                    <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                      {currentSubmission.content}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-900">
              {currentSubmission?.fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <Download size={16} />
                  Download Submission
                </a>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  No downloadable file attached.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Assessment Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Review pending work, open live submissions, and grade department assignments with real organization data.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Assessment Control Panel
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Prioritize submissions that need grading or resubmission follow-up, then move to completed assignment review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              Pending: {pendingReviewCount}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Active Assignments: {activeAssignmentCount}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Completed: {completedAssignmentCount}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Pending Review
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pendingReviewCount}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Active Assignments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeAssignmentCount}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Completed Assignments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {completedAssignmentCount}
            </h3>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-gray-200 p-6 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Assignment Queue
          </h2>
        </div>

        {loadingAssignments ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No assignments available for this staff workspace.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {assignments.map((assignment) => {
              const stats = assignmentSubmissionStats[assignment._id] || { total: 0, graded: 0, pending: 0, resubmit: 0 };
              const needsReview = stats.pending > 0 || stats.resubmit > 0;

              return (
                <div
                  key={assignment._id}
                  className="flex flex-col gap-4 p-6 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-xl p-3 ${
                        needsReview
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      <FileText size={20} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {assignment.topic}
                      </h3>

                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Not set'}</span>
                        <span>•</span>
                        <span>Submissions: {stats.total}</span>
                        <span>•</span>
                        <span>Pending: {stats.pending + stats.resubmit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="min-w-[140px] text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {stats.graded}/{stats.total || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Graded
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-700">
                        <div
                          className={`h-1.5 rounded-full ${needsReview ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{
                            width: `${stats.total > 0 ? (stats.graded / stats.total) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAssignmentId(assignment._id)}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {needsReview ? 'Open Grading' : 'Review Assignment'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
