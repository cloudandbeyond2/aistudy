import React, { useState } from "react";
import {
  MessageSquare,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Clock
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const serverURL = "http://localhost:5001";

export default function StaffSupport() {

  const [formData, setFormData] = useState({
    subject: "",
    category: "Technical Issue",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I update student grades?",
      a: "Navigate to the Grading tab and select the assignment."
    },
    {
      q: "Can I schedule a makeup class?",
      a: "Go to the Schedule tab and click request room."
    },
    {
      q: "How do I reset my password?",
      a: "Go to profile settings and choose security."
    },
    {
      q: "Where can I find archived courses?",
      a: "Use the archived filter in My Classes."
    },
    {
      q: "How do I upload course materials?",
      a: "Go to the Resources tab and upload files."
    }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!formData.subject || !formData.message) {

      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill subject and message"
      });

      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        `${serverURL}/api/support/create`,
        formData
      );

      Swal.fire({
        icon: "success",
        title: "Ticket Submitted",
        text: "Support team will contact you soon"
      });

      setFormData({
        subject: "",
        category: "Technical Issue",
        message: ""
      });

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit ticket"
      });

    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {

    setOpenFaqIndex(openFaqIndex === index ? null : index);

  };

 return (
  <div className="max-w-6xl mx-auto space-y-8 p-4">

    <div className="text-center max-w-2xl mx-auto mb-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        How can we help you?
      </h1>

      <p className="text-slate-600 dark:text-slate-400 text-lg">
        Find answers or contact support team
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* CONTACT FORM */}

      <div className="lg:col-span-2">

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <MessageSquare size={24} className="text-blue-600 dark:text-blue-400"/>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Contact Support
              </h2>

              <p className="text-sm text-gray-500 dark:text-slate-400">
                We respond within 24 hours
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* SUBJECT */}

              <div>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Issue subject"
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg"
                >

                  <option>Technical Issue</option>
                  <option>Account Access</option>
                  <option>Grading System</option>
                  <option>Feature Request</option>
                  <option>Other</option>

                </select>

              </div>

            </div>

            {/* MESSAGE */}

            <div>

              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Message
              </label>

              <textarea
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Describe the issue"
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex justify-center gap-2 transition"
            >

              <Send size={18} />

              {loading ? "Submitting..." : "Submit Ticket"}

            </button>

          </form>

        </div>

      </div>

      {/* SIDEBAR */}

      <div className="space-y-6">

        {/* FAQ */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow">

          <div className="p-4 border-b border-gray-200 dark:border-slate-700">

            <div className="flex items-center gap-2">
              <HelpCircle size={20} className="text-slate-700 dark:text-slate-300"/>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Common Questions
              </h2>
            </div>

          </div>

          <div>

            {faqs.map((item, idx) => (

              <div key={idx} className="border-b border-gray-200 dark:border-slate-700">

                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 flex justify-between text-slate-700 dark:text-slate-200"
                >

                  {item.q}

                  {openFaqIndex === idx ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}

                </button>

                {openFaqIndex === idx && (

                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-slate-400">
                    {item.a}
                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

        {/* CONTACT INFO */}

        <div className="bg-blue-600 text-white p-6 rounded-2xl">

          <h3 className="font-bold mb-4">
            Need immediate help?
          </h3>

          <div className="space-y-4">

            <div className="flex gap-3">
              <Phone size={18} />
              <div>
                <p className="text-xs">Help Desk</p>
                <p className="font-semibold">+91 96392 05100</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail size={18} />
              <div>
                <p className="text-xs">Email</p>
                <p className="font-semibold">
                  supportaistudy@gmail.com
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock size={18} />
              <div>
                <p className="text-xs">Office Hours</p>
                <p className="font-semibold">
                  Mon-Fri 9AM - 6PM
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
);
}