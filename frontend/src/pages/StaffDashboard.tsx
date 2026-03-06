import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  MoreVertical,
  Calendar as CalendarIcon,
  Search,
  Filter,
  TrendingUp,
  AlertCircle
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
  Legend
} from 'recharts';
import SmallCalendar from '../components/ui/SmallCalendar';
import { serverURL } from "@/constants";
import axios from "axios";
const attendanceData = [
  { name: 'Mon', attendance: 92 },
  { name: 'Tue', attendance: 95 },
  { name: 'Wed', attendance: 88 },
  { name: 'Thu', attendance: 94 },
  { name: 'Fri', attendance: 90 },
];

const assignmentData = [
  { name: 'CS101', submitted: 42, total: 45 },
  { name: 'DS', submitted: 30, total: 38 },
  { name: 'Web', submitted: 38, total: 42 },
];

const performanceData = [
  { name: 'Excellent', value: 35, color: '#10B981' },
  { name: 'Good', value: 45, color: '#3B82F6' },
  { name: 'Average', value: 15, color: '#F59E0B' },
  { name: 'Needs Help', value: 5, color: '#EF4444' },
];

export default function StaffDashboard() {
const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await axios.get(`${serverURL}/api/classes`);

        console.log("Classes API Response:", res.data);

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


    const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const deptId = sessionStorage.getItem("deptId"); // same as StaffStudents

  useEffect(() => {
    fetchStudents();
  }, []);

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
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your classes and student performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            Spring Semester 2026
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900"> {isLoading ? "Loading..." : students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Attendance</p>
            <h3 className="text-2xl font-bold text-slate-900">92%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Classes Today</p>
            <h3 className="text-2xl font-bold text-slate-900">  {loading ? "..." : classes.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Grades</p>
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Weekly Attendance Trend
            </h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Student Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Classes & Assignments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Assignment Completion Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Assignment Completion Rate</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} />
                  <Bar dataKey="submitted" name="Submitted" stackId="a" fill="#4F46E5" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="total" name="Total Students" stackId="b" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Class List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">My Classes</h2>
              <div className="flex gap-2">
                 <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                   <Search size={18} />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                   <Filter size={18} />
                 </button>
              </div>
            </div>

            <div className="grid gap-4">
              {classes.map((cls) => (
                <div key={cls._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {cls.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{cls.name}</h3>
                        <p className="text-sm text-gray-500">{cls.section}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      {cls.students} Students
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-gray-400" />
                      {cls.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>

        {/* Schedule / Sidebar */}
        <div className="space-y-6">
          <SmallCalendar />

          <h2 className="text-lg font-bold text-slate-900">Today's Schedule</h2>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
             <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
                <div className="relative">
                   <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></div>
                   <p className="text-xs font-semibold text-blue-600 mb-1">10:00 AM - 11:30 AM</p>
                   <h4 className="font-bold text-slate-900 text-sm">Computer Science 101</h4>
                   <p className="text-xs text-gray-500">Room 304 • Section A</p>
                </div>
                <div className="relative">
                   <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white"></div>
                   <p className="text-xs font-semibold text-amber-600 mb-1">12:00 PM - 1:00 PM</p>
                   <h4 className="font-bold text-slate-900 text-sm">Lunch Break</h4>
                   <p className="text-xs text-gray-500">Staff Cafeteria</p>
                </div>
                <div className="relative">
                   <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                   <p className="text-xs font-semibold text-emerald-600 mb-1">2:00 PM - 3:30 PM</p>
                   <h4 className="font-bold text-slate-900 text-sm">Data Structures</h4>
                   <p className="text-xs text-gray-500">Lab 2 • Section B</p>
                </div>
             </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-2">Quick Actions</h3>
             <div className="space-y-2">
                <button className="w-full bg-white hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors text-left border border-blue-200">
                   Post Announcement
                </button>
                <button className="w-full bg-white hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors text-left border border-blue-200">
                   Upload Material
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
