import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Save, 
  MessageSquare,
  MoreVertical,
  Download,
  X
} from 'lucide-react';

// --- Types ---
interface Assignment {
  id: number;
  title: string;
  class: string;
  submitted: number;
  total: number;
  due: string;
  status: 'Pending' | 'Active' | 'Graded';
}

interface Submission {
  id: number;
  studentName: string;
  studentId: string;
  submittedAt: string;
  status: 'Pending' | 'Graded';
  imageUrl: string;
  score: number | '';
  feedback: string;
}

// --- Mock Data ---
const ASSIGNMENTS: Assignment[] = [
  { id: 1, title: 'Algorithm Analysis Report', class: 'CS 101', submitted: 42, total: 45, due: 'Feb 28, 2026', status: 'Pending' },
  { id: 2, title: 'Data Structures Implementation', class: 'Data Structures', submitted: 35, total: 38, due: 'Mar 05, 2026', status: 'Active' },
  { id: 3, title: 'Web Portfolio Project', class: 'Web Dev', submitted: 40, total: 42, due: 'Mar 10, 2026', status: 'Active' },
  { id: 4, title: 'Midterm Exam', class: 'CS 101', submitted: 45, total: 45, due: 'Feb 15, 2026', status: 'Graded' },
];

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 101,
    studentName: "Alice Johnson",
    studentId: "S2026001",
    submittedAt: "Feb 27, 2026 • 2:30 PM",
    status: "Pending",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop", // Handwriting/Math
    score: '',
    feedback: ""
  },
  {
    id: 102,
    studentName: "Bob Smith",
    studentId: "S2026002",
    submittedAt: "Feb 28, 2026 • 10:15 AM",
    status: "Graded",
    imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000&auto=format&fit=crop", // Code/Screen
    score: 88,
    feedback: "Great analysis, but watch out for edge cases in the sorting algorithm."
  },
  {
    id: 103,
    studentName: "Charlie Brown",
    studentId: "S2026003",
    submittedAt: "Feb 28, 2026 • 11:45 PM",
    status: "Pending",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop", // Notes
    score: '',
    feedback: ""
  }
];

export default function StaffGrading() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  
  // Grading View State
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [isSaving, setIsSaving] = useState(false);

  const activeAssignment = ASSIGNMENTS.find(a => a.id === selectedAssignmentId);
  const currentSubmission = submissions[currentSubmissionIndex];

  // Handlers
  const handleGradeClick = (id: number) => {
    setSelectedAssignmentId(id);
    setCurrentSubmissionIndex(0); // Reset to first student
  };

  const handleBack = () => {
    setSelectedAssignmentId(null);
  };

  const handlePrevStudent = () => {
    setCurrentSubmissionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextStudent = () => {
    setCurrentSubmissionIndex(prev => Math.min(submissions.length - 1, prev + 1));
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(200, prev + 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(50, prev - 10));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleScoreChange = (val: string) => {
    const num = val === '' ? '' : Math.min(100, Math.max(0, Number(val)));
    updateSubmission(currentSubmission.id, { score: num });
  };

  const handleFeedbackChange = (val: string) => {
    updateSubmission(currentSubmission.id, { feedback: val });
  };

  const updateSubmission = (id: number, updates: Partial<Submission>) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSaveGrade = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateSubmission(currentSubmission.id, { status: 'Graded' });
      setIsSaving(false);
      
      // Auto-advance to next student if not last
      if (currentSubmissionIndex < submissions.length - 1) {
        setCurrentSubmissionIndex(prev => prev + 1);
      }
    }, 600);
  };

  // --- Render: Grading Interface ---
  if (selectedAssignmentId && activeAssignment) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 lg:-m-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-slate-900">{activeAssignment.title}</h2>
              <p className="text-xs text-gray-500">{activeAssignment.class} • Due {activeAssignment.due}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button 
                onClick={handlePrevStudent}
                disabled={currentSubmissionIndex === 0}
                className="p-1.5 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
                Student {currentSubmissionIndex + 1} of {submissions.length}
              </span>
              <button 
                onClick={handleNextStudent}
                disabled={currentSubmissionIndex === submissions.length - 1}
                className="p-1.5 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <button 
              onClick={handleSaveGrade}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              {isSaving ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Left: Submission Viewer */}
          <div className="flex-1 flex flex-col relative border-r border-gray-200">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-full px-4 py-2 flex items-center gap-4 z-20">
              <button onClick={handleZoomOut} className="text-gray-500 hover:text-gray-900"><ZoomOut size={18} /></button>
              <span className="text-xs font-medium text-gray-600 w-12 text-center">{zoomLevel}%</span>
              <button onClick={handleZoomIn} className="text-gray-500 hover:text-gray-900"><ZoomIn size={18} /></button>
              <div className="w-px h-4 bg-gray-300"></div>
              <button onClick={handleRotate} className="text-gray-500 hover:text-gray-900"><RotateCw size={18} /></button>
              <button className="text-gray-500 hover:text-gray-900"><Maximize2 size={18} /></button>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-100/50">
              <div 
                className="bg-white shadow-lg transition-transform duration-200 ease-out origin-center"
                style={{ 
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <img 
                  src={currentSubmission.imageUrl} 
                  alt="Student Submission" 
                  className="max-w-full h-auto object-contain"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Right: Grading Panel */}
          <div className="w-96 bg-white flex flex-col shadow-xl z-10">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{currentSubmission.studentName}</h3>
                  <p className="text-sm text-gray-500">ID: {currentSubmission.studentId}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentSubmission.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {currentSubmission.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                Submitted {currentSubmission.submittedAt}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Score Input */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 block">Grade</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      value={currentSubmission.score}
                      onChange={(e) => handleScoreChange(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">/ 100</span>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                    Number(currentSubmission.score) >= 90 ? 'bg-emerald-500' :
                    Number(currentSubmission.score) >= 80 ? 'bg-blue-500' :
                    Number(currentSubmission.score) >= 70 ? 'bg-amber-500' :
                    'bg-gray-300'
                  }`}>
                    {currentSubmission.score ? 
                      (Number(currentSubmission.score) >= 90 ? 'A' :
                       Number(currentSubmission.score) >= 80 ? 'B' :
                       Number(currentSubmission.score) >= 70 ? 'C' : 'F') 
                    : '-'}
                  </div>
                </div>
              </div>

              {/* Rubric (Mock) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900">Rubric</label>
                  <button className="text-xs text-blue-600 hover:underline">View Full</button>
                </div>
                <div className="space-y-2">
                  <div className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Concept Accuracy</span>
                      <span className="text-gray-500">8/10</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Clarity & Presentation</span>
                      <span className="text-gray-500">9/10</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Feedback
                </label>
                <textarea 
                  value={currentSubmission.feedback}
                  onChange={(e) => handleFeedbackChange(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                  placeholder="Enter feedback for the student..."
                ></textarea>
                <div className="flex gap-2">
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                    Great job!
                  </button>
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                    Check calculations
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
               <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                 <Download size={16} />
                 Download Submission
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Dashboard List ---
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grading & Assignments</h1>
        <p className="text-slate-500">Track submissions and grade student work.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Review</p>
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Assignments</p>
            <h3 className="text-2xl font-bold text-slate-900">5</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed This Term</p>
            <h3 className="text-2xl font-bold text-slate-900">8</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Assignments</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {ASSIGNMENTS.map((assignment) => (
            <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  assignment.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                  assignment.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium text-gray-700">{assignment.class}</span>
                    <span>•</span>
                    <span>Due: {assignment.due}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right min-w-[100px]">
                  <div className="text-sm font-medium text-gray-900">{assignment.submitted}/{assignment.total}</div>
                  <div className="text-xs text-gray-500">Submitted</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${assignment.status === 'Graded' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                      style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => handleGradeClick(assignment.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  {assignment.status === 'Graded' ? 'View Grades' : 'Grade Now'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
