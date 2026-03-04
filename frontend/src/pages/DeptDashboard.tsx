import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    FileText,
    BarChart,
    TrendingUp,
    GraduationCap,
    Clock
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { serverURL } from '@/constants';

const DeptStatCard = ({ title, value, icon: Icon, description, className }: any) => (
    <Card className={`hover:shadow-md transition-all ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value || 0}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const DeptDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>({});
    const [students, setStudents] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const { toast } = useToast();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const deptId = user.department;

    useEffect(() => {
        if (deptId) {
            fetchStats();
            fetchStudents();
        }
    }, [deptId]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/dept/dashboard/stats?departmentId=${deptId}`);
            if (res.data.success) setStats(res.data);
        } catch (e) {
            console.error("Failed to fetch dept stats", e);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${serverURL}/api/dept/students?departmentId=${deptId}`);
            if (res.data.success) setStudents(res.data.students);
        } catch (e) {
            console.error("Failed to fetch dept students", e);
        }
    };

    if (!deptId) {
        return <div className="p-8 text-center">No department assigned to this admin account.</div>;
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Department Portal</h1>
                <p className="text-muted-foreground">Manage students and monitor progress for your department.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DeptStatCard
                    title="Total Students"
                    value={stats.studentCount}
                    icon={Users}
                    description="Enrolled in your department"
                    className="border-l-4 border-l-blue-500"
                />
                <DeptStatCard
                    title="Total Courses"
                    value={stats.totalCoursesCount}
                    icon={GraduationCap}
                    description="Assigned to department"
                    className="border-l-4 border-l-emerald-500"
                />
                <DeptStatCard
                    title="Active Assignments"
                    value={stats.assignmentCount}
                    icon={FileText}
                    description="Pending submissions"
                    className="border-l-4 border-l-amber-500"
                />
                <DeptStatCard
                    title="Course Completions"
                    value={stats.completedCoursesCount}
                    icon={TrendingUp}
                    description="100% progress attained"
                    className="border-l-4 border-l-purple-500"
                />
            </div>

            {/* Students List */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Students</CardTitle>
                    <CardDescription>View and monitor student performance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Search students..."
                        className="max-w-sm"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {students.length > 0 ? (
                            students.filter((s: any) =>
                                (s.mName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                                (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
                            ).map((student: any) => (
                                <div key={student._id} className="p-4 border rounded-lg bg-card hover:shadow-sm transition-all flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {student.mName?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{student.mName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> Joined {new Date(student.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center py-8 text-muted-foreground">No students found in this department.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DeptDashboard;
