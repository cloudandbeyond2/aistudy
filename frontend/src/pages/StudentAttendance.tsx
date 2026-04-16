import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend 
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentAttendance() {

  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [classEnded, setClassEnded] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const studentId = sessionStorage.getItem('uid');

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    percentage: 0
  });

  const [todaysClass, setTodaysClass] = useState<any>({
    id: '',
    name: '',
    time: '',
    room: '',
    status: 'Pending'
  });

  // Fetch student info and classes on load
  useEffect(() => {
    if (studentId) {
      fetchStudentInfo();
      fetchClasses();
      fetchAttendanceSummary();
    }
  }, [studentId]);

  const fetchAttendanceSummary = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/attendance/summary/${studentId}`);
      if (res.data.success) {
        setStats(res.data.summary);
        setRecentAttendance(res.data.history.map((r: any) => ({
          id: r.classId?._id || r._id,
          date: r.date,
          class: r.classId?.name || "Deleted Class",
          status: r.status,
          time: r.time || (r.classId ? `${r.classId.startTime} - ${r.classId.endTime}` : "-")
        })));
      }
    } catch (e) {
      console.error("Failed to fetch attendance summary", e);
    }
  };

  // Fetch classes from server
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/classes`);
      if (!res.data.success) return;

      const classList = res.data.data || [];
      setClasses(classList);

      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Find today's class in progress
      const todays = classList.find((cls: any) => {
        if (!cls.date) return false;
        const classDate = cls.date.split("T")[0];
        const [sh, sm] = cls.startTime.split(":").map(Number);
        const [eh, em] = cls.endTime.split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        return classDate === today && currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      });

      if (todays) {
        setTodaysClass({
          id: todays._id,
          name: todays.name,
          time: `${todays.startTime} - ${todays.endTime}`,
          room: todays.room,
          status: "Pending"
        });

        setClassEnded(false);

        // ✅ Check if already marked from server
        checkAttendance(studentId!, todays._id);
      } else {
        setTodaysClass({ id: '', name: '', time: '', room: '', status: 'Pending' });
        setClassEnded(false);
      }

      // Build recent attendance history
      const history = classList.map((cls: any) => ({
        id: cls._id,
        date: cls.date ? cls.date.split("T")[0] : "",
        class: cls.name,
        status: cls.attendance?.find((r: any) => r.studentId === studentId)?.status || "Pending",
        time: `${cls.startTime} - ${cls.endTime}`
      }));

      setRecentAttendance(history);

    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Fetch student info
  const fetchStudentInfo = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/user/${studentId}`);
      if (res.data.success) setStudentInfo(res.data.user);
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  };

  // Check if student already marked attendance
  const checkAttendance = async (studentId: string, classId: string) => {
    try {
      const res = await axios.get(`${serverURL}/api/attendance/check`, {
        params: { studentId, classId }
      });

      if (res.data.success && res.data.marked) {
        setAttendanceMarked(true);
        setTodaysClass((prev: any) => ({ ...prev, status: res.data.status }));

        // ✅ Update Recent History
        setRecentAttendance(prev => 
          prev.map(record => 
            record.id === classId ? { ...record, status: res.data.status } : record
          )
        );
      }

    } catch (err) {
      console.error("Error checking attendance", err);
    }
  };

  // Handle marking attendance
  const handleAttendance = async () => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      
      // Get class start time
      const startTimeStr = todaysClass.time.split(" - ")[0];
      const [sh, sm] = startTimeStr.split(":").map(Number);
      
      // Create date objects for comparison
      const classStartTime = new Date();
      classStartTime.setHours(sh, sm, 0);
      
      const currentTime = new Date();
      
      // Calculate difference in minutes
      const diffMinutes = (currentTime.getTime() - classStartTime.getTime()) / (1000 * 60);
      
      // Determine status based on time difference
      let status: "Present" | "Late";
      if (diffMinutes <= 15) {
        status = "Present";
      } else {
        status = "Late";
      }

      const res = await axios.post(`${serverURL}/api/attendance/mark`, {
        studentId,
        classId: todaysClass.id,
        status,
        time: timeString
      });

      if (res.data.success) {
        setAttendanceMarked(true);
        setTodaysClass((prev: any) => ({ ...prev, status }));

        // Update Recent History
        setRecentAttendance(prev => 
          prev.map(record => 
            record.id === todaysClass.id ? { ...record, status } : record
          )
        );

        // Refresh stats
        fetchAttendanceSummary();
        
        // Store in localStorage that attendance is marked
        localStorage.setItem(`attendance-marked-${studentId}-${todaysClass.id}`, 'true');
      }

    } catch (error: any) {
      alert(error.response?.data?.message || "Attendance failed");
    }
  };

  // Restore attendance marked state from localStorage on reload
  useEffect(() => {
    if (studentId && todaysClass.id) {
      const marked = localStorage.getItem(`attendance-marked-${studentId}-${todaysClass.id}`);
      if (marked === 'true') {
        setAttendanceMarked(true);
      }
    }
  }, [studentId, todaysClass.id]);

  // Check if class ended every minute
  useEffect(() => {
    const timer = setInterval(() => {
      if (!todaysClass.time) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const end = todaysClass.time.split(" - ")[1];
      if (!end) return;

      const [eh, em] = end.split(":").map(Number);
      const endMinutes = eh * 60 + em;

      if (currentMinutes > endMinutes) {
        setClassEnded(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [todaysClass]);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Absent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in space-y-8">
      <SEO title="My Attendance" description="Track your attendance record across all classes." />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">
          My Attendance
        </h1>
        <p className="text-muted-foreground mt-1">Track your attendance record across all classes.</p>
      </div>

      {/* Stats & Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={20} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                        {stats.percentage >= 75 ? 'Good Standing' : 'Below Requirement'}
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold">{stats.percentage}%</h3>
                    <p className="text-sm text-muted-foreground mt-1">Overall Attendance</p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                        <Calendar size={20} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold">{stats.present}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Days Present</p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold">{stats.late}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Days Late</p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                        <XCircle size={20} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold">{stats.absent}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Days Absent</p>
                </div>
            </div>
        </div>

        {/* Chart Column */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4">Participation Mix</h3>
            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Present', value: stats.present, color: '#10b981' },
                                { name: 'Late', value: stats.late, color: '#f59e0b' },
                                { name: 'Absent', value: stats.absent, color: '#ef4444' }
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <ReTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
                Out of {stats.total} total sessions
            </p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Today's Schedule</h2>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {todaysClass.name && !classEnded ? (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wide animate-pulse">
                    Happening Now
                  </span>
                  <span className="text-muted-foreground text-sm flex items-center gap-1 font-medium">
                    <Clock size={14} /> {todaysClass.time}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{todaysClass.name}</h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={16} /> {todaysClass.room}
                </p>
              </div>

              <div className="flex gap-3">
                {attendanceMarked ? (
                  <div className={`px-4 py-2 rounded-lg border ${getStatusBadge(todaysClass.status)}`}>
                    <span className="font-semibold">Status: {todaysClass.status}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const startTimeStr = todaysClass.time.split(" - ")[0];
                        const [sh, sm] = startTimeStr.split(":").map(Number);
                        const classStartTime = new Date();
                        classStartTime.setHours(sh, sm, 0);
                        const currentTime = new Date();
                        const diffMinutes = 15 - ((currentTime.getTime() - classStartTime.getTime()) / (1000 * 60));
                        
                        if (diffMinutes > 0) {
                          return `⏱️ ${Math.ceil(diffMinutes)} minutes left to mark as Present`;
                        } else {
                          return "⚠️ You'll be marked as Late";
                        }
                      })()}
                    </div>
                    <button
                      onClick={handleAttendance}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
                    >
                      <CheckCircle2 size={18} />
                      Mark Attendance
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {classEnded ? "Today's class finished" : "No class scheduled today"}
            </div>
          )}

        </div>
      </div>

      {/* Recent History */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent History</h2>
        </div>
        <div className="divide-y divide-border">
          {recentAttendance.map((record) => (
            <div
              key={record.id}
              className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium">{record.class}</h4>
                <p className="text-xs text-muted-foreground">{record.date}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                  {record.status}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{record.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}