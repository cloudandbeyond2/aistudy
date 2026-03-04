import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaffSchedule() {
  const schedule = [
    { id: 1, day: 'Monday', classes: [
      { name: 'Computer Science 101', time: '10:00 AM - 11:30 AM', room: '304', type: 'Lecture' },
      { name: 'Database Systems', time: '1:00 PM - 2:30 PM', room: '305', type: 'Lab' }
    ]},
    { id: 2, day: 'Tuesday', classes: [
      { name: 'Software Engineering', time: '9:00 AM - 10:30 AM', room: '302', type: 'Lecture' },
      { name: 'Data Structures', time: '2:00 PM - 3:30 PM', room: 'Lab 2', type: 'Lab' }
    ]},
    { id: 3, day: 'Wednesday', classes: [
      { name: 'Computer Science 101', time: '10:00 AM - 11:30 AM', room: '304', type: 'Lecture' },
      { name: 'Database Systems', time: '1:00 PM - 2:30 PM', room: '305', type: 'Lab' }
    ]},
    { id: 4, day: 'Thursday', classes: [
      { name: 'Software Engineering', time: '9:00 AM - 10:30 AM', room: '302', type: 'Lecture' },
      { name: 'Data Structures', time: '2:00 PM - 3:30 PM', room: 'Lab 2', type: 'Lab' }
    ]},
    { id: 5, day: 'Friday', classes: [
      { name: 'Web Development', time: '11:00 AM - 12:30 PM', room: 'Lab 1', type: 'Workshop' },
      { name: 'Faculty Meeting', time: '3:00 PM - 4:00 PM', room: 'Conf Room A', type: 'Meeting' }
    ]},
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly Schedule</h1>
          <p className="text-slate-500">View your classes and meetings for the week.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-2 font-medium text-slate-900">
            <CalendarIcon size={18} className="text-blue-600" />
            <span>March 2 - March 8, 2026</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {schedule.map((day) => (
          <div key={day.id} className="space-y-4">
            <div className="text-center py-3 bg-gray-100 rounded-lg font-semibold text-slate-700 border border-gray-200">
              {day.day}
            </div>
            <div className="space-y-3">
              {day.classes.map((cls, index) => (
                <div key={index} className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                  cls.type === 'Lecture' ? 'bg-blue-50 border-blue-100' :
                  cls.type === 'Lab' ? 'bg-emerald-50 border-emerald-100' :
                  cls.type === 'Meeting' ? 'bg-amber-50 border-amber-100' :
                  'bg-purple-50 border-purple-100'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                      cls.type === 'Lecture' ? 'bg-blue-100 text-blue-700' :
                      cls.type === 'Lab' ? 'bg-emerald-100 text-emerald-700' :
                      cls.type === 'Meeting' ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {cls.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">{cls.name}</h4>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock size={14} className="mr-1.5 opacity-70" />
                      {cls.time}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin size={14} className="mr-1.5 opacity-70" />
                      {cls.room}
                    </div>
                  </div>
                </div>
              ))}
              {day.classes.length === 0 && (
                <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                  No classes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
