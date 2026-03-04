import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Mail,
  MoreHorizontal,
  User,
  Plus,
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { serverURL } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StaffStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const { toast } = useToast();

  const deptId = sessionStorage.getItem('deptId');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    if (!deptId) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${serverURL}/api/dept/students?departmentId=${deptId}`);
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Entry State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    section: '',
    rollNo: ''
  });

  // Bulk Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (student: any) => {
    setIsEditing(true);
    setSelectedStudent(student);
    setNewStudent({
      name: student.mName,
      email: student.email,
      section: student.studentDetails?.section || '',
      rollNo: student.studentDetails?.rollNo || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (student: any) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      const response = await axios.delete(`${serverURL}/api/org/student/${studentToDelete._id}`);
      if (response.data.success) {
        toast({ title: "Success", description: "Student deleted successfully" });
        fetchStudents();
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete student", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = sessionStorage.getItem('orgId');

    try {
      if (isEditing && selectedStudent) {
        const response = await axios.put(`${serverURL}/api/org/student/${selectedStudent._id}`, {
          ...newStudent,
          department: deptId
        });
        if (response.data.success) {
          toast({ title: "Success", description: "Student updated successfully" });
          fetchStudents();
          closeModal();
        } else {
          toast({ title: "Error", description: response.data.message, variant: "destructive" });
        }
      } else {
        const response = await axios.post(`${serverURL}/api/org/student/add`, {
          ...newStudent,
          organizationId: orgId,
          department: deptId
        });
        if (response.data.success) {
          toast({ title: "Success", description: "Student added successfully" });
          fetchStudents();
          closeModal();
        } else {
          toast({ title: "Error", description: response.data.message, variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${isEditing ? 'update' : 'add'} student`, variant: "destructive" });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedStudent(null);
    setNewStudent({ name: '', email: '', section: '', rollNo: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    // For now, mirroring the Org Admin bulk logic if needed, but the user asked for student display first.
    // In a real app, you'd parse or send to a multipart endpoint.
    toast({ title: "Info", description: "Bulk upload from CSV is handled via organization admin. This feature is coming soon for staff." });
    setIsModalOpen(false);
    setUploadFile(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Students</h1>
          <p className="text-slate-500">View and manage students within your department.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          <button
            onClick={() => { setIsEditing(false); setIsModalOpen(true); }}
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-gray-500 gap-2">
              <Loader2 className="animate-spin" size={20} />
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>No students found in this department.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {(student.mName || 'S').charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{student.mName}</div>
                          <div className="text-xs text-gray-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {student.studentDetails?.section || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium">{student.studentDetails?.rollNo || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400">
                        {new Date(student.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => handleEdit(student)} className="cursor-pointer gap-2">
                            <Edit size={14} />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteConfirm(student)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                            <Trash2 size={14} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && students.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {students.length} students</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit Student' : 'Add New Student'}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Tabs (Hidden during edit) */}
              {!isEditing && (
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'manual'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setActiveTab('bulk')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'bulk'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Bulk Upload
                  </button>
                </div>
              )}

              {isEditing || activeTab === 'manual' ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input
                        type="text"
                        name="section"
                        required
                        value={newStudent.section}
                        onChange={handleInputChange}
                        placeholder="e.g. A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                      <input
                        type="text"
                        name="rollNo"
                        value={newStudent.rollNo}
                        onChange={handleInputChange}
                        placeholder="e.g. 101"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {isEditing ? 'Save Changes' : 'Add Student'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {uploadFile ? uploadFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Excel or CSV (max 10MB)</p>
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

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student account for <strong>{studentToDelete?.mName}</strong> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
