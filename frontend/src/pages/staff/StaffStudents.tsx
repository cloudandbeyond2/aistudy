import React, { useState } from 'react';
import { Search, Filter, Mail, MoreHorizontal, User, Plus, X, Upload, FileSpreadsheet, FileText } from 'lucide-react';

export default function StaffStudents() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice.j@example.com', class: 'CS 101', attendance: '92%', grade: 'A' },
    { id: 2, name: 'Bob Smith', email: 'bob.s@example.com', class: 'CS 101', attendance: '85%', grade: 'B+' },
    { id: 3, name: 'Charlie Brown', email: 'charlie.b@example.com', class: 'Data Structures', attendance: '78%', grade: 'C' },
    { id: 4, name: 'Diana Prince', email: 'diana.p@example.com', class: 'Web Dev', attendance: '95%', grade: 'A+' },
    { id: 5, name: 'Evan Wright', email: 'evan.w@example.com', class: 'CS 101', attendance: '88%', grade: 'B' },
    { id: 6, name: 'Fiona Green', email: 'fiona.g@example.com', class: 'Data Structures', attendance: '90%', grade: 'A-' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  
  // Manual Entry State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    class: '',
    grade: ''
  });

  // Bulk Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = {
      id: students.length + 1,
      ...newStudent,
      attendance: '0%' // Default attendance
    };
    setStudents([...students, student]);
    setIsModalOpen(false);
    setNewStudent({ name: '', email: '', class: '', grade: '' });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    // Mock parsing logic
    // In a real app, you'd parse the Excel/PDF here
    const mockParsedStudents = [
      { id: students.length + 1, name: 'George King', email: 'george.k@example.com', class: 'CS 101', attendance: '0%', grade: '-' },
      { id: students.length + 2, name: 'Hannah Lee', email: 'hannah.l@example.com', class: 'CS 101', attendance: '0%', grade: '-' },
    ];
    
    setStudents([...students, ...mockParsedStudents]);
    setIsModalOpen(false);
    setUploadFile(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students Directory</h1>
          <p className="text-slate-500">View and manage student information across your classes.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <Mail size={16} />
            Message All
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Current Grade</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-xs text-gray-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${parseInt(student.attendance) > 90 ? 'bg-emerald-500' : parseInt(student.attendance) > 80 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                          style={{ width: student.attendance }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{student.attendance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${student.grade.startsWith('A') ? 'text-emerald-600' : student.grade.startsWith('B') ? 'text-blue-600' : 'text-amber-600'}`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1-{students.length} of {students.length} students</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'manual' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'bulk' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Bulk Upload
                </button>
              </div>

              {activeTab === 'manual' ? (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={newStudent.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={newStudent.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        name="class"
                        required
                        value={newStudent.class}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">Select Class</option>
                        <option value="CS 101">CS 101</option>
                        <option value="Data Structures">Data Structures</option>
                        <option value="Web Dev">Web Dev</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Grade</label>
                      <input
                        type="text"
                        name="grade"
                        value={newStudent.grade}
                        onChange={handleInputChange}
                        placeholder="e.g. A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Add Student
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {uploadFile ? uploadFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Excel, CSV, or PDF (max 10MB)</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Supported Formats</p>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg flex-1">
                        <FileSpreadsheet className="text-emerald-600" size={20} />
                        <div className="text-xs">
                          <p className="font-medium text-slate-900">Excel / CSV</p>
                          <p className="text-gray-500">Structured data</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg flex-1">
                        <FileText className="text-red-600" size={20} />
                        <div className="text-xs">
                          <p className="font-medium text-slate-900">PDF</p>
                          <p className="text-gray-500">Document lists</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!uploadFile}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload and Process
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
