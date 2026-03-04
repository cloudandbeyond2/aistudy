import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle2, XCircle, Clock, Save, Search, Filter } from 'lucide-react';

export default function StaffClassAttendance() {
  const { id } = useParams();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock student data
  const [students, setStudents] = useState([
    { id: 1, name: 'Alice Johnson', status: 'present' },
    { id: 2, name: 'Bob Smith', status: 'present' },
    { id: 3, name: 'Charlie Brown', status: 'absent' },
    { id: 4, name: 'Diana Prince', status: 'present' },
    { id: 5, name: 'Evan Wright', status: 'late' },
    { id: 6, name: 'Fiona Green', status: 'present' },
    { id: 7, name: 'George King', status: 'present' },
    { id: 8, name: 'Hannah Lee', status: 'absent' },
  ]);

  const handleStatusChange = (studentId: number, status: string) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, status } : s
    ));
  };

  const markAll = (status: string) => {
    setStudents(students.map(s => ({ ...s, status })));
  };

  const stats = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    total: students.length
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link to={`/dashboard/staff/classes/${id}`} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500">Computer Science 101 • Section A</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Save size={16} />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium uppercase">Present</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
          </div>
          <CheckCircle2 className="text-emerald-500 opacity-50" size={24} />
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-red-600 font-medium uppercase">Absent</p>
            <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
          </div>
          <XCircle className="text-red-500 opacity-50" size={24} />
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-medium uppercase">Late</p>
            <p className="text-2xl font-bold text-amber-700">{stats.late}</p>
          </div>
          <Clock className="text-amber-500 opacity-50" size={24} />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => markAll('present')} className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">Mark All Present</button>
            <button onClick={() => markAll('absent')} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">Mark All Absent</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 text-center">Present</th>
                <th className="px-6 py-4 text-center">Absent</th>
                <th className="px-6 py-4 text-center">Late</th>
                <th className="px-6 py-4 text-right">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="cursor-pointer flex justify-center">
                      <input 
                        type="radio" 
                        name={`status-${student.id}`} 
                        checked={student.status === 'present'}
                        onChange={() => handleStatusChange(student.id, 'present')}
                        className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="cursor-pointer flex justify-center">
                      <input 
                        type="radio" 
                        name={`status-${student.id}`} 
                        checked={student.status === 'absent'}
                        onChange={() => handleStatusChange(student.id, 'absent')}
                        className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="cursor-pointer flex justify-center">
                      <input 
                        type="radio" 
                        name={`status-${student.id}`} 
                        checked={student.status === 'late'}
                        onChange={() => handleStatusChange(student.id, 'late')}
                        className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input 
                      type="text" 
                      placeholder="Add note..." 
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 w-32"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
