import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Clock, Calendar, BookOpen, X } from "lucide-react";
import axios from "axios";
import { serverURL } from "@/constants";

interface ClassItem {
  _id: string;
  name: string;
  section: string;
  students: number;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

export default function StaffClasses() {

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const deptId = sessionStorage.getItem("deptId");

  const [newClass, setNewClass] = useState({
    name: "",
    section: "",
    date: "",
    startTime: "",
    endTime: "",
    room: ""
  });

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  // FETCH CLASSES
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

  // FETCH STUDENTS
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

  // STUDENT COUNT
  const getStudentCount = (className: string, section: string) => {
    return students.filter(
      (student) =>
        student.studentDetails?.studentClass === className &&
        student.studentDetails?.section === section
    ).length;
  };

  // INPUT CHANGE
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
  };

  // EDIT
  const handleEdit = (cls: ClassItem) => {

    setEditingId(cls._id);

    setNewClass({
      name: cls.name,
      section: cls.section,
      date: cls.date.split("T")[0],
      startTime: cls.startTime,
      endTime: cls.endTime,
      room: cls.room
    });

    setIsModalOpen(true);
  };

  // SUBMIT CREATE / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      let response;

      if (editingId) {

        response = await axios.put(
          `${serverURL}/api/classes/${editingId}`,
          newClass
        );

      } else {

        response = await axios.post(
          `${serverURL}/api/classes`,
          newClass
        );

      }

      if (response.data.success) {

        await fetchClasses();

        setIsModalOpen(false);

        setEditingId(null);

        setNewClass({
          name: "",
          section: "",
          date: "",
          startTime: "",
          endTime: "",
          room: ""
        });

      }

    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  return (

    <div className="max-w-7xl mx-auto space-y-6 relative">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Classes
          </h1>

          <p className="text-slate-500 dark:text-gray-400">
            Manage your assigned courses and sections.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Create New Class
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading classes...
        </div>
      )}

      {/* CLASSES GRID */}

      {!loading && (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {classes.map((cls) => (

            <div
              key={cls._id}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
            >

              <div className="flex justify-between items-start mb-4">

                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>

                <button
                  onClick={() => handleEdit(cls)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Edit
                </button>

              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {cls.name}
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                {cls.section}
              </p>

              <div className="space-y-2 pt-4 border-t">

                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-2" />
                  {isLoadingStudents
                    ? "Loading..."
                    : `${getStudentCount(cls.name, cls.section)} Students`}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  {cls.startTime} - {cls.endTime}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  {new Date(cls.date).toLocaleDateString()}
                </div>

                <div className="text-sm text-gray-600">
                  Room {cls.room}
                </div>

              </div>

              <div className="mt-6 flex gap-2">

                <Link
                  to={`/dashboard/staff/classes/${cls._id}`}
                  className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 text-sm rounded-lg text-center"
                >
                  View Details
                </Link>

                <Link
                  to={`/dashboard/staff/classes/${cls._id}/attendance`}
                  className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-lg text-center"
                >
                  Attendance
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* MODAL */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md">

            <div className="flex justify-between items-center p-4 border-b">

              <h3 className="font-bold text-lg">
                {editingId ? "Edit Class" : "Create New Class"}
              </h3>

              <button onClick={() => setIsModalOpen(false)}>
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
                type="date"
                name="date"
                required
                value={newClass.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="time"
                name="startTime"
                required
                value={newClass.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="time"
                name="endTime"
                required
                value={newClass.endTime}
                onChange={handleInputChange}
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

              <div className="flex gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  {editingId ? "Update Class" : "Create Class"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}