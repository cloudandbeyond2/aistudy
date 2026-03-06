import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, MoreVertical, Calendar, BookOpen, X } from 'lucide-react';
import { serverURL } from '@/constants';
interface ClassItem {
  _id: string; // ✅ MongoDB ID
  name: string;
  section: string;
  students: number;
  time: string;
  room: string;
}
import axios from "axios";

export default function StaffClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
 const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const deptId = sessionStorage.getItem("deptId");

  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    time: '',
    room: ''
  });

  // ✅ Fetch Classes from Backend
 useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

const fetchClasses = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${serverURL}/api/classes`);

      if (res.data.success) {
        setClasses(res.data.data || []);
      } else {
        setClasses([]);
      }

    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {

    if (!deptId) {
      setIsLoadingStudents(false);
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
      setIsLoadingStudents(false);
    }
  };

  // ================================
  // Get Students Count per Class
  // ================================

  const getStudentCount = (className: string, section: string) => {

    return students.filter(
      (student) =>
        student.studentDetails?.studentClass === className &&
        student.studentDetails?.section === section
    ).length;

  };


  // ✅ Handle Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Create Class (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${serverURL}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });

      const result = await response.json();

      if (result.success) {
        await fetchClasses(); // refresh from DB
        setIsModalOpen(false);
        setNewClass({ name: '', section: '', time: '', room: '' });
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* Header */}
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

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading classes...
        </div>
      )}

      {/* Classes Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div 
              key={cls._id}  // ✅ FIXED KEY
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {cls.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{cls.section}</p>
              
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-2 text-gray-400" />
                   {isLoadingStudents
                    ? "Loading..."
                    : `${getStudentCount(cls.name, cls.section)} Students Enrolled`}
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
                <Link 
                  to={`/dashboard/staff/classes/${cls._id}`}
                  className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors text-center"
                >
                  View Details
                </Link>

                <Link 
                  to={`/dashboard/staff/classes/${cls._id}/attendance`}
                  className="flex-1 py-2 px-3 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                Create New Class
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <input
                type="text"
                name="name"
                required
                value={newClass.name}
                onChange={handleInputChange}
                placeholder="Class Name"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="section"
                required
                value={newClass.section}
                onChange={handleInputChange}
                placeholder="Section"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="time"
                required
                value={newClass.time}
                onChange={handleInputChange}
                placeholder="Schedule Time"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="room"
                required
                value={newClass.room}
                onChange={handleInputChange}
                placeholder="Room Number"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
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