import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, MoreVertical, Calendar, BookOpen, X } from 'lucide-react';

interface ClassItem {
  id: number;
  name: string;
  section: string;
  students: number;
  time: string;
  room: string;
}

export default function StaffClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: 1, name: 'Computer Science 101', section: 'Section A', students: 45, time: 'Mon, Wed 10:00 AM', room: '304' },
    { id: 2, name: 'Data Structures', section: 'Section B', students: 38, time: 'Tue, Thu 2:00 PM', room: 'Lab 2' },
    { id: 3, name: 'Web Development', section: 'Section A', students: 42, time: 'Fri 11:00 AM', room: 'Lab 1' },
    { id: 4, name: 'Database Systems', section: 'Section C', students: 30, time: 'Mon, Wed 1:00 PM', room: '305' },
    { id: 5, name: 'Software Engineering', section: 'Section B', students: 35, time: 'Tue, Thu 9:00 AM', room: '302' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    time: '',
    room: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClassItem: ClassItem = {
      id: classes.length + 1,
      name: newClass.name,
      section: newClass.section,
      students: 0, // Default to 0 for new class
      time: newClass.time,
      room: newClass.room
    };
    setClasses([...classes, newClassItem]);
    setIsModalOpen(false);
    setNewClass({ name: '', section: '', time: '', room: '' }); // Reset form
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
          <p className="text-slate-500">Manage your assigned courses and sections.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          + Create New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{cls.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{cls.section}</p>
            
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2 text-gray-400" />
                {cls.students} Students Enrolled
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2 text-gray-400" />
                {cls.time}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2 text-gray-400" />
                Room {cls.room}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Link to={`/dashboard/staff/classes/${cls.id}`} className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors text-center">
                View Details
              </Link>
              <Link to={`/dashboard/staff/classes/${cls.id}/attendance`} className="flex-1 py-2 px-3 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors text-center">
                Attendance
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-slate-900">Create New Class</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={newClass.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Introduction to AI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  required
                  value={newClass.section}
                  onChange={handleInputChange}
                  placeholder="e.g. Section A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
                  <input
                    type="text"
                    id="time"
                    name="time"
                    required
                    value={newClass.time}
                    onChange={handleInputChange}
                    placeholder="e.g. Mon 10:00 AM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    id="room"
                    name="room"
                    required
                    value={newClass.room}
                    onChange={handleInputChange}
                    placeholder="e.g. 304"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
