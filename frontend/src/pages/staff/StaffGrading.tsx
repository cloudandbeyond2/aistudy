import React from 'react';
import { CheckCircle2, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function StaffGrading() {
  const assignments = [
    { id: 1, title: 'Algorithm Analysis Report', class: 'CS 101', submitted: 42, total: 45, due: 'Feb 28, 2026', status: 'Pending' },
    { id: 2, title: 'Data Structures Implementation', class: 'Data Structures', submitted: 35, total: 38, due: 'Mar 05, 2026', status: 'Active' },
    { id: 3, title: 'Web Portfolio Project', class: 'Web Dev', submitted: 40, total: 42, due: 'Mar 10, 2026', status: 'Active' },
    { id: 4, title: 'Midterm Exam', class: 'CS 101', submitted: 45, total: 45, due: 'Feb 15, 2026', status: 'Graded' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grading & Assignments</h1>
        <p className="text-slate-500">Track submissions and grade student work.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Review</p>
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Assignments</p>
            <h3 className="text-2xl font-bold text-slate-900">5</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed This Term</p>
            <h3 className="text-2xl font-bold text-slate-900">8</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Assignments</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  assignment.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                  assignment.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium text-gray-700">{assignment.class}</span>
                    <span>•</span>
                    <span>Due: {assignment.due}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right min-w-[100px]">
                  <div className="text-sm font-medium text-gray-900">{assignment.submitted}/{assignment.total}</div>
                  <div className="text-xs text-gray-500">Submitted</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${assignment.status === 'Graded' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                      style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                  {assignment.status === 'Graded' ? 'View Grades' : 'Grade Now'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
