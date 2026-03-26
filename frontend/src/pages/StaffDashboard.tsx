import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users,
  Clock,
  CheckCircle2,
  MoreVertical,
  Calendar as CalendarIcon,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Bell,
  ListTodo,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import SmallCalendar from '../components/ui/SmallCalendar';
import { serverURL } from "@/constants";
import axios from "axios";
import { useTheme } from '@/contexts/ThemeContext';

export default function StaffDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orgDisplayName, setOrgDisplayName] = useState('Organization');
  const [departmentDisplayName, setDepartmentDisplayName] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [orgStats, setOrgStats] = useState({
    studentCount: 0,
    studentLimit: 0,
    assignmentCount: 0,
    submissionCount: 0,
    placedCount: 0,
  });
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const deptId = sessionStorage.getItem("deptId");
  const orgId = sessionStorage.getItem("orgId") || '';

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await axios.get(`${serverURL}/api/classes`);

        if (Array.isArray(res.data)) {
          setClasses(res.data);
        } else if (Array.isArray(res.data.classes)) {
          setClasses(res.data.classes);
        } else if (Array.isArray(res.data.data)) {
          setClasses(res.data.data);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  useEffect(() => {
    const uid = sessionStorage.getItem('uid');
    if (!uid) return;

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/user/${uid}`);
        if (res.data?.success) {
          setCurrentUser(res.data.user);
          sessionStorage.setItem('courseLimit', String(res.data.user?.courseLimit || 0));
          sessionStorage.setItem('coursesCreatedCount', String(res.data.user?.coursesCreatedCount || 0));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!orgId) return;

    const fetchOrgMeta = async () => {
      try {
        const [orgRes, deptRes] = await Promise.all([
          axios.get(`${serverURL}/api/org/details/${orgId}`),
          axios.get(`${serverURL}/api/org/departments?organizationId=${orgId}`),
        ]);

        if (orgRes.data?.success) {
          const organization =
            orgRes.data.organization?.organizationName ||
            orgRes.data.organization?.name ||
            orgRes.data.organization?.orgName ||
            orgRes.data.organization?.email ||
            'Organization';
          setOrgDisplayName(organization);
          sessionStorage.setItem('organizationName', organization);
        }

        if (deptRes.data?.success) {
          const departments = Array.isArray(deptRes.data.departments) ? deptRes.data.departments : [];
          const rawDepartment =
            currentUser?.department?._id ||
            currentUser?.department?.name ||
            currentUser?.department ||
            deptId ||
            sessionStorage.getItem('deptId') ||
            '';

          const matchedDepartment = departments.find(
            (department: any) =>
              department._id === rawDepartment || department.name === rawDepartment
          );

          const resolvedDepartmentName =
            matchedDepartment?.name ||
            sessionStorage.getItem('deptName') ||
            '';

          if (resolvedDepartmentName) {
            setDepartmentDisplayName(resolvedDepartmentName);
            sessionStorage.setItem('deptName', resolvedDepartmentName);
          }
        }
      } catch (error) {
        console.error('Error fetching organization metadata:', error);
      }
    };

    fetchOrgMeta();
  }, [orgId, deptId, currentUser]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!orgId) return;

    const getDepartmentValue = (value: any) => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return value._id || value.name || '';
      return '';
    };

    const matchesCurrentDepartment = (value: any, departmentId?: any) => {
      const deptName =
        currentUser?.department?.name ||
        currentUser?.department ||
        sessionStorage.getItem('deptName') ||
        '';
      const normalizedValue = getDepartmentValue(value);
      const normalizedDepartmentId = getDepartmentValue(departmentId);
      return Boolean(
        (deptName && normalizedValue === deptName) ||
        (deptId && normalizedValue === deptId) ||
        (deptId && normalizedDepartmentId === deptId)
      );
    };

    const fetchWorkspaceData = async () => {
      try {
        const [statsRes, assignmentsRes, meetingsRes, projectsRes, noticesRes] = await Promise.all([
          axios.get(`${serverURL}/api/org/dashboard/stats?organizationId=${orgId}`),
          axios.get(`${serverURL}/api/org/assignments?organizationId=${orgId}`),
          axios.get(`${serverURL}/api/org/meetings?organizationId=${orgId}`),
          axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}`),
          axios.get(`${serverURL}/api/org/notices?organizationId=${orgId}`),
        ]);

        if (statsRes.data?.success) {
          setOrgStats(statsRes.data);
        }

        if (assignmentsRes.data?.success) {
          const nextAssignments = Array.isArray(assignmentsRes.data.assignments)
            ? assignmentsRes.data.assignments.filter((assignment: any) =>
                matchesCurrentDepartment(assignment.department, assignment.departmentId)
              )
            : [];
          setAssignments(nextAssignments);
        }

        if (meetingsRes.data?.success) {
          const nextMeetings = Array.isArray(meetingsRes.data.meetings)
            ? meetingsRes.data.meetings.filter((meeting: any) =>
                matchesCurrentDepartment(meeting.department, meeting.departmentId)
              )
            : [];
          setMeetings(nextMeetings);
        }

        if (projectsRes.data?.success) {
          const nextProjects = Array.isArray(projectsRes.data.projects)
            ? projectsRes.data.projects.filter((project: any) =>
                matchesCurrentDepartment(project.department, project.departmentId)
              )
            : [];
          setProjects(nextProjects);
        }

        if (noticesRes.data?.success) {
          const nextNotices = Array.isArray(noticesRes.data.notices)
            ? noticesRes.data.notices.filter((notice: any) =>
                matchesCurrentDepartment(notice.department, notice.departmentId)
              )
            : [];
          setNotices(nextNotices);
        }
      } catch (error) {
        console.error('Error fetching staff workspace data:', error);
      }
    };

    fetchWorkspaceData();
  }, [orgId, deptId, currentUser]);

  const fetchStudents = async () => {
    if (!deptId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${serverURL}/api/dept/students?departmentId=${deptId}`
      );

      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentCount = (className: string, section: string) => {
    return students.filter(
      (student) =>
        student.studentDetails?.studentClass === className &&
        student.studentDetails?.section === section
    ).length;
  };

  const staffName = currentUser?.mName || currentUser?.name || 'Staff';
  const departmentName =
    departmentDisplayName ||
    currentUser?.department?.name ||
    sessionStorage.getItem("deptName") ||
    "Assigned department";
  const courseLimit = Number(
    sessionStorage.getItem("courseLimit") || currentUser?.courseLimit || 0
  );
  const coursesCreated = Number(
    sessionStorage.getItem("coursesCreatedCount") ||
      currentUser?.coursesCreatedCount ||
      0
  );
  const remainingCourseCapacity = Math.max(courseLimit - coursesCreated, 0);
  const activeBatches = new Set(
    students
      .map((student) => {
        const studentClass = student.studentDetails?.studentClass;
        const section = student.studentDetails?.section;
        return studentClass ? `${studentClass}-${section || 'NA'}` : null;
      })
      .filter(Boolean)
  ).size;
  const relevantClasses = classes.filter(
    (cls) => getStudentCount(cls.name, cls.section) > 0
  );
  const todaySessions = relevantClasses.slice(0, 3);
  const learnerAttentionList = students
    .map((student) => {
      const reasons: string[] = [];
      if (!student.studentDetails?.studentClass) reasons.push('Class not mapped');
      if (!student.studentDetails?.rollNo) reasons.push('Roll number missing');
      if (!student.studentDetails?.academicYear) reasons.push('Academic year missing');

      if (reasons.length === 0) return null;

      return {
        id: student._id,
        name: student.mName || student.name || student.email || 'Learner',
        reasons,
      };
    })
    .filter(Boolean) as Array<{ id: string; name: string; reasons: string[] }>;
  const learnersNeedingAttention = learnerAttentionList.length;
  const classMappedCount = students.filter((student) => student.studentDetails?.studentClass).length;
  const placementReadyCount = students.filter((student) => student.studentDetails?.isPlacementClosed).length;
  const pendingReviewCount = assignments.length;
  const upcomingMeetingCount = meetings.filter((meeting) => {
    if (!meeting?.date) return false;
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time || '00:00'}`);
    return meetingDateTime >= new Date();
  }).length;
  const operationalChartData = [
    { name: 'Assignments', total: assignments.length, color: '#2563EB' },
    { name: 'Meetings', total: meetings.length, color: '#0EA5E9' },
    { name: 'Projects', total: projects.length, color: '#7C3AED' },
    { name: 'Notices', total: notices.length, color: '#F59E0B' },
  ];
  const learnerMixData = [
    { name: 'Class Mapped', value: classMappedCount, color: '#10B981' },
    { name: 'Profile Gaps', value: learnersNeedingAttention, color: '#EF4444' },
    { name: 'Placement Ready', value: placementReadyCount, color: '#3B82F6' },
  ].filter((item) => item.value > 0);
  const classCoverageData = relevantClasses.slice(0, 5).map((cls) => ({
    name: cls.name,
    students: getStudentCount(cls.name, cls.section),
  }));
  const quickScanChips = [
    {
      label: `Department: ${departmentName}`,
      tone: 'slate',
      action: null,
    },
    {
      label: `Attention ${learnersNeedingAttention}`,
      tone: 'amber',
      action: () => navigate('/dashboard/org?tab=students'),
    },
    {
      label: `Assignments ${assignments.length}`,
      tone: 'blue',
      action: () => navigate('/dashboard/org?tab=assignments'),
    },
    {
      label: `Sessions ${meetings.length}`,
      tone: 'sky',
      action: () => navigate('/dashboard/org?tab=meetings'),
    },
    {
      label: `Projects ${projects.length}`,
      tone: 'violet',
      action: () => navigate('/dashboard/org?tab=projects'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Workboard</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Track teaching load, learner progress, and course capacity from one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Spring Semester 2026
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/todo')}
            className="hidden sm:inline-flex gap-2"
          >
            <ListTodo size={16} />
            Todo Center
          </Button>
        </div>
      </div>

      {currentUser?.lastLoginAt && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-100">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Clock size={16} />
              Login activity
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-200">
              Last successful sign-in: {new Date(currentUser.lastLoginAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {quickScanChips.map((chip) => {
          const baseClasses = "rounded-full px-4 py-2 text-sm font-medium transition-colors";
          const toneClasses =
            chip.tone === 'amber'
              ? "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
              : chip.tone === 'blue'
              ? "border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300"
              : chip.tone === 'sky'
              ? "border border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300"
              : chip.tone === 'violet'
              ? "border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300"
              : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

          if (!chip.action) {
            return (
              <span key={chip.label} className={`${baseClasses} ${toneClasses}`}>
                {chip.label}
              </span>
            );
          }

          return (
            <button
              key={chip.label}
              onClick={chip.action}
              className={`${baseClasses} ${toneClasses} hover:opacity-90`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-sm dark:border-slate-700">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                Staff Command Center
              </p>
              <h2 className="text-2xl font-bold">
                {staffName}, manage delivery for {orgDisplayName}.
              </h2>
              <p className="max-w-2xl text-sm text-slate-200">
                Keep learners on track, monitor your active teaching load, and stay within the
                organization&apos;s course creation controls.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Department</p>
                <p className="mt-2 text-sm font-semibold">{departmentName}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Active Batches</p>
                <p className="mt-2 text-2xl font-bold">{activeBatches}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Courses Created</p>
                <p className="mt-2 text-2xl font-bold">{coursesCreated}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Quota Left</p>
                <p className="mt-2 text-2xl font-bold">{remainingCourseCapacity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">Assignments</p>
                <p className="mt-1 text-lg font-semibold">{assignments.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">Upcoming Sessions</p>
                <p className="mt-1 text-lg font-semibold">{upcomingMeetingCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">Projects Live</p>
                <p className="mt-1 text-lg font-semibold">{projects.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">Placements Closed</p>
                <p className="mt-1 text-lg font-semibold">{orgStats.placedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Priority Actions
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Open the workspace you need without changing the current flow.
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => navigate('/dashboard/org?tab=courses')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/70 dark:border-slate-700 dark:hover:border-blue-900 dark:hover:bg-slate-800"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Course Workspace</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Review draft, approval, and publishing progress.
                </p>
              </div>
              <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
            </button>

            <button
              onClick={() => navigate('/dashboard/org?tab=assignments')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-amber-200 hover:bg-amber-50/70 dark:border-slate-700 dark:hover:border-amber-900 dark:hover:bg-slate-800"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Assessment Desk</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Check submissions, assignments, and learner follow-up.
                </p>
              </div>
              <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-400" />
            </button>

            <button
              onClick={() => navigate('/dashboard/org?tab=students')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/70 dark:border-slate-700 dark:hover:border-emerald-900 dark:hover:bg-slate-800"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Learner Directory</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Maintain student records, batches, and department roster.
                </p>
              </div>
              <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              onClick={() => navigate('/dashboard/org?tab=meetings')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50/70 dark:border-slate-700 dark:hover:border-sky-900 dark:hover:bg-slate-800"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Sessions & Notices</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Run live sessions and keep learners updated.
                </p>
              </div>
              <Bell size={18} className="text-sky-600 dark:text-sky-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Learners In Department
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {students.length}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Learners Needing Attention
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {learnersNeedingAttention}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Classes Scheduled</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : relevantClasses.length}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Assignments</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pendingReviewCount}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <TrendingUp size={20} className="text-blue-600" />
              Operational Footprint
            </h3>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Live org workspace counts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={operationalChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                  className="dark:stroke-slate-700"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
            Learner Readiness Mix
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={learnerMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {learnerMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
              Class Coverage Snapshot
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classCoverageData} barSize={40}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? "#334155" : "#E5E7EB"}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    tick={{
                      fill: isDark ? "#CBD5F5" : "#6B7280",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: isDark ? "#CBD5F5" : "#6B7280",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    cursor={{ fill: isDark ? "#1E293B" : "#F3F4F6" }}
                    contentStyle={{
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      border: `1px solid ${isDark ? "#334155" : "#E5E7EB"}`,
                      borderRadius: "8px",
                    }}
                  />

                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#4F46E5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Teaching Load
              </h2>

              <div className="flex gap-2">
                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200">
                  <Search size={18} />
                </button>

                <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {relevantClasses.map((cls) => (
                <div
                  key={cls._id}
                  className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                        {cls.name.charAt(0)}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white">
                          {cls.name}
                        </h3>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {cls.section}
                        </p>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400 dark:text-gray-500" />
                      {isLoading
                        ? "Loading..."
                        : `${getStudentCount(cls.name, cls.section)} Students`}
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-gray-400 dark:text-gray-500" />
                      {cls.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SmallCalendar />

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Learner Attention Board
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Students with missing academic mapping or profile details that can block delivery follow-up.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-amber-700 shadow-sm dark:bg-slate-900 dark:text-amber-300">
                {learnersNeedingAttention}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {learnerAttentionList.length > 0 ? (
                learnerAttentionList.slice(0, 4).map((student) => (
                  <div
                    key={student.id}
                    className="rounded-lg border border-amber-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {student.reasons.map((reason) => (
                        <span
                          key={`${student.id}-${reason}`}
                          className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-slate-900 dark:text-emerald-300">
                  No immediate learner profile gaps found in this department.
                </div>
              )}
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Today&apos;s Session Queue
          </h2>

          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="relative space-y-8 border-l-2 border-gray-200 pl-6 dark:border-slate-700">
              {todaySessions.length > 0 ? (
                todaySessions.map((session, index) => (
                  <div key={session._id || `${session.name}-${index}`} className="relative">
                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900"></div>
                    <p className="mb-1 text-xs font-semibold text-blue-600">
                      {session.time || "Scheduled session"}
                    </p>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {session.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {[session.room, session.section].filter(Boolean).join(" • ") || "Department session"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900"></div>
                  <p className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No session data yet
                  </p>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Your timetable will appear here when classes are assigned.
                  </h4>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-400">
              Operational Shortcuts
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/org?tab=notices')}
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
              >
                Open Announcements
              </button>

              <button
                onClick={() => navigate('/dashboard/org?tab=materials')}
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
              >
                Open Resource Library
              </button>

              <button
                onClick={() => navigate('/dashboard/org?tab=meetings')}
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
              >
                Open Sessions
              </button>

              <button
                onClick={() => navigate('/dashboard/org?tab=projects')}
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
              >
                Open Projects & Labs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
