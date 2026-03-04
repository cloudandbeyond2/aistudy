import React from 'react';
import { FileText, Download, Upload, Folder, MoreVertical, File } from 'lucide-react';

export default function StaffResources() {
  const resources = [
    { id: 1, name: 'Course Syllabus 2026.pdf', type: 'PDF', size: '2.4 MB', date: 'Jan 15, 2026', course: 'CS 101' },
    { id: 2, name: 'Lecture 1 - Introduction.pptx', type: 'PPT', size: '15 MB', date: 'Jan 20, 2026', course: 'CS 101' },
    { id: 3, name: 'Data Structures Cheatsheet.pdf', type: 'PDF', size: '1.2 MB', date: 'Feb 10, 2026', course: 'Data Structures' },
    { id: 4, name: 'Lab Manual - Spring 2026.docx', type: 'DOC', size: '4.5 MB', date: 'Jan 18, 2026', course: 'Web Dev' },
    { id: 5, name: 'Project Guidelines.pdf', type: 'PDF', size: '800 KB', date: 'Feb 05, 2026', course: 'Software Eng' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Resources</h1>
          <p className="text-slate-500">Manage and share learning materials.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
          <Upload size={18} />
          Upload New File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Folders / Categories */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-900 mb-4 px-2">Categories</h3>
          <nav className="space-y-1">
            {['All Files', 'Lecture Notes', 'Assignments', 'Lab Manuals', 'Reference Books'].map((item, idx) => (
              <button 
                key={item}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${idx === 0 ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Folder size={18} className={idx === 0 ? 'text-blue-500 fill-blue-500/20' : 'text-gray-400'} />
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* File List */}
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                        <FileText size={20} />
                      </div>
                      <span className="font-medium text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">{file.course}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{file.date}</td>
                  <td className="px-6 py-4 text-gray-500">{file.size}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
