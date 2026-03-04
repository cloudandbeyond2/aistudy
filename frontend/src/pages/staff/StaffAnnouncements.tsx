import React from 'react';
import { Megaphone, Plus, Calendar, User, Pin } from 'lucide-react';

export default function StaffAnnouncements() {
  const announcements = [
    { 
      id: 1, 
      title: 'Midterm Exam Schedule Change', 
      content: 'The midterm exam for CS 101 has been moved to March 15th due to the campus event. Please update your calendars.',
      date: 'Mar 02, 2026',
      author: 'You',
      pinned: true,
      target: 'CS 101 - All Sections'
    },
    { 
      id: 2, 
      title: 'Lab Submission Deadline Extension', 
      content: 'Due to server maintenance, the deadline for Lab 3 has been extended by 24 hours. New deadline is Friday at 11:59 PM.',
      date: 'Feb 28, 2026',
      author: 'You',
      pinned: false,
      target: 'Data Structures - Section B'
    },
    { 
      id: 3, 
      title: 'Guest Lecture: AI Ethics', 
      content: 'We will have a guest lecture on AI Ethics this Friday in the main auditorium. Attendance is mandatory for all senior students.',
      date: 'Feb 25, 2026',
      author: 'Dr. Smith',
      pinned: false,
      target: 'All Computer Science Students'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500">Post updates and news for your students.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      <div className="space-y-6">
        {announcements.map((item) => (
          <div key={item.id} className={`bg-white p-6 rounded-xl border shadow-sm transition-all hover:shadow-md ${item.pinned ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.pinned ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  {item.pinned ? <Pin size={18} className="fill-current" /> : <Megaphone size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">To: {item.target}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                <Calendar size={14} />
                {item.date}
              </span>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-6 pl-12">
              {item.content}
            </p>

            <div className="flex items-center justify-between pl-12 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User size={16} />
                <span>Posted by <span className="font-medium text-slate-900">{item.author}</span></span>
              </div>
              <div className="flex gap-3">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
                <button className="text-sm font-medium text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
