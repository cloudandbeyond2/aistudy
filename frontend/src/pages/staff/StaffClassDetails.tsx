import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Clock, MapPin, Calendar, BookOpen, FileText, MoreVertical } from 'lucide-react';

interface ClassItem {
  _id: string;
  name: string;
  section: string;
  students: number;
  time: string;
  room: string;
  description?: string;
}

export default function StaffClassDetails() {
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Class By ID
  useEffect(() => {
    fetchClassById();
  }, [id]);

  const fetchClassById = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/classes/${id}`);
      const result = await response.json();

      if (result.success) {
        setClassInfo(result.data);
      }
    } catch (error) {
      console.error('Error fetching class:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading class details...</div>;
  }

  if (!classInfo) {
    return <div className="text-center py-10 text-red-500">Class not found</div>;
  }


    const recentActivity = [
    { id: 1, type: 'assignment', title: 'Algorithm Analysis Report', date: '2 hours ago', status: 'Posted' },
    { id: 2, type: 'announcement', title: 'Midterm Schedule Update', date: 'Yesterday', status: 'Sent' },
    { id: 3, type: 'material', title: 'Lecture 5 Slides.pdf', date: '2 days ago', status: 'Uploaded' },
  ];
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to="/dashboard/staff/classes" 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {classInfo.name}
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              {classInfo.section}
            </span>
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock size={14} /> {classInfo.time}
            </span>

            <span className="flex items-center gap-1">
              <MapPin size={14} /> {classInfo.room}
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to={`/dashboard/staff/classes/${id}/attendance`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Take Attendance
          </Link>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Edit Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Class Overview</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {classInfo.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-blue-600 mb-1"><Users size={20} /></div>
                <div className="text-2xl font-bold text-slate-900">{classInfo.students}</div>
                <div className="text-xs text-blue-600 font-medium">Total Students</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-emerald-600 mb-1"><BookOpen size={20} /></div>
                <div className="text-2xl font-bold text-slate-900">12</div>
                <div className="text-xs text-emerald-600 font-medium">Assignments</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-amber-600 mb-1"><Calendar size={20} /></div>
                <div className="text-2xl font-bold text-slate-900">92%</div>
                <div className="text-xs text-amber-600 font-medium">Avg. Attendance</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'announcement' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {item.type === 'assignment' ? <FileText size={18} /> :
                     item.type === 'announcement' ? <Users size={18} /> :
                     <BookOpen size={18} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.date} • {item.status}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Next Class</h3>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-medium text-slate-900">Lecture 12: Data Structures</p>
                <p className="text-sm text-gray-500 mt-1"></p>
                <p className="text-xs text-gray-400 mt-1">{classInfo.room}</p>
              </div>
            </div>
            <button className="w-full py-2 px-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
              View Schedule
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Users size={16} /> View Students
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText size={16} /> Create Assignment
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <BookOpen size={16} /> Upload Material
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
