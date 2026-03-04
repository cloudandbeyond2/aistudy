import React from 'react';
import { MessageSquare, HelpCircle, Send, ChevronDown } from 'lucide-react';

export default function StaffSupport() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">How can we help you?</h1>
        <p className="text-slate-600 text-lg">
          Find answers to common questions or contact our support team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Contact Support</h2>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                placeholder="Brief description of the issue" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none text-gray-600">
                  <option>Technical Issue</option>
                  <option>Account Access</option>
                  <option>Grading System</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                rows={5}
                placeholder="Describe your issue in detail..." 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              ></textarea>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              <Send size={18} />
              Submit Ticket
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Common Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "How do I update student grades?", a: "Navigate to the Grading tab, select the assignment, and click 'Grade Now'. You can input grades directly or upload a CSV." },
              { q: "Can I schedule a makeup class?", a: "Yes, go to the Schedule tab and click on an empty time slot or use the 'Request Room' feature." },
              { q: "How do I reset my password?", a: "Go to Profile settings and select 'Security'. You'll need your current password to make changes." },
              { q: "Where can I find archived courses?", a: "In the 'My Classes' section, use the filter dropdown to select 'Archived' or 'Past Semesters'." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
            <p className="text-blue-800 font-medium mb-2">Need immediate assistance?</p>
            <p className="text-blue-600 text-sm">Call the IT Help Desk at <span className="font-bold">ext. 4040</span></p>
            <p className="text-blue-600 text-sm">Mon-Fri, 8:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
