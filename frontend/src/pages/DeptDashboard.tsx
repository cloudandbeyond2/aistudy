import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users,
  FileText,
  TrendingUp,
  GraduationCap,
  Clock,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Video,
  Download,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { serverURL } from "@/constants";

const StatCard = ({ title, value, icon: Icon, description, tone }: any) => (
  <Card className="group overflow-hidden border-border/60 bg-background/60 backdrop-blur hover:shadow-md transition-all">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{Number(value || 0).toLocaleString()}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, icon: Icon, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left group rounded-2xl border border-border/60 bg-background/60 backdrop-blur p-4 hover:shadow-md transition-all"
  >
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</div>
      </div>
    </div>
  </button>
);

const DeptDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const deptId = sessionStorage.getItem("deptId") || "";
  const deptName = sessionStorage.getItem("deptName") || "";

  useEffect(() => {
    const run = async () => {
      if (!deptId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [statsRes, studentsRes] = await Promise.all([
          axios.get(`${serverURL}/api/dept/dashboard/stats`, { params: { departmentId: deptId } }),
          axios.get(`${serverURL}/api/dept/students`, { params: { departmentId: deptId } }),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data);
          if (typeof statsRes.data?.deptName === "string" && statsRes.data.deptName.trim()) {
            sessionStorage.setItem("deptName", statsRes.data.deptName);
          }
        }
        if (studentsRes.data?.success) setStudents(studentsRes.data.students || []);
      } catch (error) {
        console.error("Failed to fetch department data", error);
        toast({ title: "Department Portal", description: "Failed to load department data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [deptId, toast]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s: any) =>
      (s.mName || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  if (!deptId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No department assigned to this account.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-indigo-600/10 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Department Portal
              </Badge>
              {(stats?.deptName || deptName) && (
                <Badge variant="outline" className="text-muted-foreground">
                  {stats?.deptName || deptName}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your Department Workspace
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Review learners, manage course delivery, and keep assessments moving—without leaving your department scope.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/staff")} className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Workboard
            </Button>
            <Button onClick={() => navigate("/dashboard/org-courses")} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <BookOpen className="h-4 w-4" />
              Course Workspace
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.studentCount}
          icon={Users}
          description="Enrolled in your department"
          tone="bg-blue-600/10 text-blue-700 dark:text-blue-300"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCoursesCount}
          icon={GraduationCap}
          description="Courses scoped to your dept"
          tone="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
        />
        <StatCard
          title="Active Assignments"
          value={stats.assignmentCount}
          icon={FileText}
          description="Needs grading / submissions"
          tone="bg-amber-600/10 text-amber-700 dark:text-amber-300"
        />
        <StatCard
          title="Completions"
          value={stats.completedCoursesCount}
          icon={TrendingUp}
          description="Learners at 100% progress"
          tone="bg-violet-600/10 text-violet-700 dark:text-violet-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickAction
          title="Learner Directory"
          description="Search and review department learners."
          icon={Users}
          onClick={() => navigate("/dashboard/org-students")}
        />
        <QuickAction
          title="Assessment Desk"
          description="Review submissions and update grades."
          icon={ClipboardList}
          onClick={() => navigate("/dashboard/org-assignments")}
        />
        <QuickAction
          title="Sessions"
          description="Manage meeting links and schedules."
          icon={Video}
          onClick={() => navigate("/dashboard/org-meetings")}
        />
        <QuickAction
          title="Resource Library"
          description="Upload or share PDFs and materials."
          icon={Download}
          onClick={() => navigate("/dashboard/org-materials")}
        />
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Department Students</CardTitle>
            <CardDescription>Quick view of learners scoped to your department.</CardDescription>
          </div>
          <div className="w-full sm:w-[320px]">
            <Input
              placeholder="Search name or email..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading students...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any) => (
                  <div
                    key={student._id}
                    className="group p-4 border rounded-2xl bg-background/60 backdrop-blur hover:shadow-sm transition-all flex items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {(student.mName || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{student.mName || "Unnamed student"}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email || "No email"}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Joined {student.date ? new Date(student.date).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/org-students")}
                      className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
                  No students found in this department.
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/org-notices")} className="gap-2">
              <Bell className="h-4 w-4" />
              Announcements
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/staff/support")} className="gap-2">
              <FileText className="h-4 w-4" />
              Support Desk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeptDashboard;
