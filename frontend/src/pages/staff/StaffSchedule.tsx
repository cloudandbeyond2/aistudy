import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Edit
} from "lucide-react";
import { serverURL } from '@/constants';

interface ScheduleItem {
  _id?: string;
  day: string;
  name: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
}

export default function StaffSchedule() {

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<ScheduleItem>({
    day: "Monday",
    name: "",
    startTime: "",
    endTime: "",
    room: "",
    type: "Lecture"
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<any[]>([]);

  useEffect(() => {
    fetchSchedules();
    generateWeekDates(currentDate);
  }, [currentDate]);

  /* ---------------- FETCH SCHEDULE ---------------- */

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/schedule`);
      setSchedule(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- ADD / UPDATE ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      if (editId) {
        await axios.put(`${serverURL}/api/schedule/update/${editId}`, newItem);
      } else {
        await axios.post(`${serverURL}/api/schedule/add`, newItem);
      }

      fetchSchedules();

      setIsModalOpen(false);
      setEditId(null);

      setNewItem({
        day: "Monday",
        name: "",
        startTime: "",
        endTime: "",
        room: "",
        type: "Lecture"
      });

    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${serverURL}/api/schedule/delete/${id}`);
      fetchSchedules();
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (item: ScheduleItem) => {
    setEditId(item._id || null);
    setNewItem(item);
    setIsModalOpen(true);
  };

  /* ---------------- INPUT ---------------- */

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setNewItem((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* ---------------- WEEK GENERATOR ---------------- */

  const generateWeekDates = (baseDate: Date) => {

    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();

    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);

    startOfWeek.setDate(diff);

    const days = [];

    for (let i = 0; i < 5; i++) {

      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);

      const today = new Date();

      const isToday =
        current.getDate() === today.getDate() &&
        current.getMonth() === today.getMonth() &&
        current.getFullYear() === today.getFullYear();

      days.push({
        dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
        date: current.getDate(),
        fullDate: current,
        isToday
      });
    }

    setWeekDates(days);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  /* ---------------- FILTER BY DAY ---------------- */

  const getDaySchedule = (day: string) => {
    return schedule.filter((item) => item.day === day);
  };

  /* ---------------- TYPE STYLE ---------------- */

  const getTypeStyle = (type: string) => {

    if (type === "Lecture")
      return "border-blue-500 bg-blue-100 text-blue-700";

    if (type === "Lab")
      return "border-green-500 bg-green-100 text-green-700";

    if (type === "Workshop")
      return "border-purple-500 bg-purple-100 text-purple-700";

    if (type === "Meeting")
      return "border-orange-500 bg-orange-100 text-orange-700";

    return "";
  };

return (
  <div className="max-w-7xl mx-auto space-y-6">

    {/* HEADER */}

    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Weekly Schedule
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View your classes and meetings for the week.
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        <Plus size={18} />
        Add Schedule
      </button>

    </div>

    {/* WEEK NAVIGATION */}

    <div className="flex items-center justify-end">

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow px-4 py-2 rounded-lg">

        <ChevronLeft
          className="cursor-pointer text-gray-600 dark:text-gray-300"
          onClick={handlePrevWeek}
        />

        <CalendarIcon size={18} className="text-gray-600 dark:text-gray-300" />

        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
          Week View
        </span>

        <ChevronRight
          className="cursor-pointer text-gray-600 dark:text-gray-300"
          onClick={handleNextWeek}
        />

      </div>

    </div>

    {/* DAY CARDS */}

    <div className="grid grid-cols-5 gap-4">

      {weekDates.map((day, index) => {

        const classes = getDaySchedule(day.dayName);

        return (
          <div key={index}>

            {/* DAY HEADER */}

            <div
              className={`text-center p-3 rounded-xl mb-4 font-semibold
              ${
                day.isToday
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200"
              }`}
            >
              <p className="text-sm">{day.dayName}</p>
              <p className="text-xl">{day.date}</p>
            </div>

            {/* CLASSES */}

            {classes.map((cls) => (

              <div
                key={cls._id}
                className={`p-4 mb-4 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700
                ${getTypeStyle(cls.type)}`}
              >

                <span className="text-xs px-2 py-1 rounded font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                  {cls.type.toUpperCase()}
                </span>

                <h4 className="font-semibold mt-2 text-slate-900 dark:text-white">
                  {cls.name}
                </h4>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Clock size={14} />
                  {cls.startTime} - {cls.endTime}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin size={14} />
                  {cls.room}
                </div>

                <div className="flex gap-3 mt-3">

                  <button
                    onClick={() => handleEdit(cls)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(cls._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

            ))}

            {classes.length === 0 && (
              <div className="text-gray-400 dark:text-gray-500 text-sm">
                No classes
              </div>
            )}

          </div>
        );
      })}

    </div>

    {/* MODAL */}

    {isModalOpen && (

      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 w-[400px]">

          <div className="flex justify-between mb-4">

            <h3 className="font-bold text-slate-900 dark:text-white">
              {editId ? "Edit Schedule" : "Add Schedule"}
            </h3>

            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <X />
            </button>

          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            <select
              name="day"
              value={newItem.day}
              onChange={handleInputChange}
              className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-2 rounded"
            >
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
            </select>

            <input
              name="name"
              value={newItem.name}
              onChange={handleInputChange}
              placeholder="Event Name"
              className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-2 rounded"
            />

            <div className="grid grid-cols-2 gap-3">

              <input
                type="time"
                name="startTime"
                value={newItem.startTime}
                onChange={handleInputChange}
                className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-2 rounded"
              />

              <input
                type="time"
                name="endTime"
                value={newItem.endTime}
                onChange={handleInputChange}
                className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-2 rounded"
              />

            </div>

            <input
              name="room"
              value={newItem.room}
              onChange={handleInputChange}
              placeholder="Room"
              className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-2 rounded"
            />

            <select
              name="type"
              value={newItem.type}
              onChange={handleInputChange}
              className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white p-2 rounded"
            >
              <option>Lecture</option>
              <option>Lab</option>
              <option>Meeting</option>
              <option>Workshop</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white py-2 rounded"
            >
              {editId ? "Update Schedule" : "Add Schedule"}
            </button>

          </form>

        </div>

      </div>

    )}

  </div>
);
}