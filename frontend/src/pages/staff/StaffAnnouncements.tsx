import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Calendar, User, Pin, X } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { serverURL } from '@/constants';
const API = `${serverURL}/api/announcements`;

interface Announcement {
  _id: string;
  title: string;
  content: string;
  target: string;
  author: string;
  pinned: boolean;
  createdAt: string;
}

export default function StaffAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target: "",
    pinned: false,
  });

  // ===============================
  // GET ANNOUNCEMENTS
  // ===============================

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API}/all`);
      setAnnouncements(res.data.announcements);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ===============================
  // INPUT CHANGE
  // ===============================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setNewAnnouncement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setNewAnnouncement((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ===============================
  // EDIT
  // ===============================

  const handleEditClick = (announcement: Announcement) => {
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target,
      pinned: announcement.pinned,
    });

    setEditingId(announcement._id);
    setIsModalOpen(true);
  };

  // ===============================
  // DELETE
  // ===============================

  const handleDeleteClick = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Delete this announcement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API}/delete/${id}`);

        Swal.fire("Deleted!", "Announcement removed.", "success");

        fetchAnnouncements();
      }
    });
  };

  // ===============================
  // SUBMIT (CREATE / UPDATE)
  // ===============================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${API}/update/${editingId}`, newAnnouncement);

        Swal.fire({
          icon: "success",
          title: "Updated!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axios.post(`${API}/create`, newAnnouncement);

        Swal.fire({
          icon: "success",
          title: "Posted!",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      fetchAnnouncements();
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingId(null);

    setNewAnnouncement({
      title: "",
      content: "",
      target: "",
      pinned: false,
    });
  };

return (
  <div className="max-w-4xl mx-auto space-y-8">

    {/* HEADER */}

    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Announcements
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Post updates for students
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Plus size={18} />
        New Announcement
      </button>
    </div>

    {/* ANNOUNCEMENT LIST */}

    <div className="space-y-6">
      {announcements.map((item) => (

        <div
          key={item._id}
          className={`p-6 rounded-xl border shadow transition
          bg-white dark:bg-slate-900
          ${item.pinned
            ? "border-blue-200 dark:border-blue-700"
            : "border-gray-200 dark:border-slate-700"
          }`}
        >

          <div className="flex justify-between items-start mb-4">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                {item.pinned ? (
                  <Pin size={18} className="text-blue-600" />
                ) : (
                  <Megaphone size={18} className="text-slate-600 dark:text-slate-300" />
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  To: {item.target}
                </p>
              </div>

            </div>

            <span className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar size={14} />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>

          </div>

          <p className="text-gray-600 dark:text-slate-300 mb-6">
            {item.content}
          </p>

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <User size={16} />
              {item.author}
            </div>

            <div className="flex gap-4">

              <button
                onClick={() => handleEditClick(item)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteClick(item._id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      ))}
    </div>

    {/* MODAL */}

    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-lg border border-gray-200 dark:border-slate-700">

          <div className="flex justify-between mb-4">

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Announcement" : "Create Announcement"}
            </h3>

            <button
              onClick={handleModalClose}
              className="text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"
            >
              <X />
            </button>

          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="title"
              required
              value={newAnnouncement.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full border px-3 py-2 rounded
              bg-white dark:bg-slate-800
              text-slate-900 dark:text-white
              border-gray-300 dark:border-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="target"
              required
              value={newAnnouncement.target}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded
              bg-white dark:bg-slate-800
              text-slate-900 dark:text-white
              border-gray-300 dark:border-slate-700"
            >
              <option value="">Select Audience</option>
              <option value="All Students">All Students</option>
              <option value="CS 101">CS 101</option>
              <option value="Data Structures">Data Structures</option>
            </select>

            <textarea
              name="content"
              required
              rows={4}
              value={newAnnouncement.content}
              onChange={handleInputChange}
              placeholder="Announcement content"
              className="w-full border px-3 py-2 rounded
              bg-white dark:bg-slate-800
              text-slate-900 dark:text-white
              border-gray-300 dark:border-slate-700"
            />

            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">

              <input
                type="checkbox"
                name="pinned"
                checked={newAnnouncement.pinned}
                onChange={handleCheckboxChange}
              />

              <label>Pin Announcement</label>

            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              {editingId ? "Update Announcement" : "Post Announcement"}
            </button>

          </form>

        </div>

      </div>
    )}
  </div>
);
}