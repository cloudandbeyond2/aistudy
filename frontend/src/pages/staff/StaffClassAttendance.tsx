import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, CheckCircle2, XCircle, Clock, Search, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { Input } from '@/components/ui/input';

export default function StaffClassAttendance() {
  const { id } = useParams();
  const deptId = sessionStorage.getItem("deptId");
  
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Date picker state - default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (id) {
      fetchClassAndStudents();
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [id, selectedDate]);

  const fetchClassAndStudents = async () => {
    try {
      // 1. Fetch Class
      const classRes = await fetch(`${serverURL}/api/classes/${id}`);
      const classResult = await classRes.json();
      
      let currentClass = null;
      if (classResult.success) {
        currentClass = classResult.data;
        setClassInfo(currentClass);
      }

      // 2. Fetch Students for Dept
      if (deptId && currentClass) {
        const studentRes = await axios.get(`${serverURL}/api/dept/students?departmentId=${deptId}`);
        if (studentRes.data.success) {
          const allDeptStudents = studentRes.data.students || [];
          // Filter students who belong to this class and section
          const classStudents = allDeptStudents.filter(
            (student) =>
              student.studentDetails?.studentClass === currentClass.name &&
              student.studentDetails?.section === currentClass.section
          );
          setStudents(classStudents);
        }
      }
    } catch (e) {
      console.error("Failed to load class data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date: string) => {
    try {
      const res = await axios.get(`${serverURL}/api/attendance/class/${id}?date=${date}`);
      if (res.data.success) {
        setAttendanceRecords(res.data.records || []);
      }
    } catch (e) {
      console.error("Failed to fetch attendance:", e);
    }
  };

  const getStudentStatus = (studentId: string) => {
    const record = attendanceRecords.find(r => r.studentId?._id === studentId || r.studentId === studentId);
    return record ? record.status : 'Not Marked';
  };

  const getStudentTime = (studentId: string) => {
    const record = attendanceRecords.find(r => r.studentId?._id === studentId || r.studentId === studentId);
    return record?.time || '-';
  };

  const filteredStudents = students.filter(s => 
    (s.mName || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.studentDetails?.rollNo || '').toLowerCase().includes(search.toLowerCase())
  );

  // Compute Stats for the chosen date
  const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const absentCount = students.length - (presentCount + lateCount); // Treat unmarked as absent/pending
  
  const attendanceRate = students.length > 0 
    ? Math.round(((presentCount + lateCount) / students.length) * 100) 
    : 0;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Attendance Monitoring...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to={`/dashboard/staff/classes/${id}`} 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Tracker</h1>
          <p className="text-slate-500 text-sm">
            Monitoring: {classInfo?.name} ({classInfo?.section})
          </p>
        </div>
      </div>

      {/* Date Selector & Overall Stats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-slate-700">Select Date:</label>
            <input 
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span className="font-bold">{presentCount}</span> Present
            </div>
            <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 flex items-center gap-2">
              <Clock size={18} />
              <span className="font-bold">{lateCount}</span> Late
            </div>
            <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-2">
              <XCircle size={18} />
              <span className="font-bold">{absentCount}</span> Unmarked/Absent
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-emerald-500 h-3 rounded-full" 
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{attendanceRate}% Participation</p>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Student Roll</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search student or roll no..."
              className="pl-9 h-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-bold">Roll No</th>
                <th className="text-left px-6 py-4 font-bold">Student Name</th>
                <th className="text-center px-6 py-4 font-bold">Status</th>
                <th className="text-right px-6 py-4 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const status = getStudentStatus(student._id);
                  const time = getStudentTime(student._id);
                  
                  return (
                    <tr key={student._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-700">{student.studentDetails?.rollNo || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{student.mName || 'Unnamed'}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                          ${status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                            status === 'Late' ? 'bg-amber-100 text-amber-700' :
                            status === 'Absent' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'}
                        `}>
                          {status === 'Present' && <CheckCircle2 size={14} />}
                          {status === 'Late' && <Clock size={14} />}
                          {status === 'Absent' && <XCircle size={14} />}
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">{time}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No students currently mapped to this class/section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

