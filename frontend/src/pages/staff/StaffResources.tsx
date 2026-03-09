import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Folder, 
  MoreVertical, 
  File, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Types ---

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  course: string;
  categoryId: string;
  content?: string; // Data URL
}

interface Category {
  id: string;
  name: string;
}

// --- Constants ---

const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Files' },
  { id: 'cat_lectures', name: 'Lecture Notes' },
  { id: 'cat_assignments', name: 'Assignments' },
  { id: 'cat_labs', name: 'Lab Manuals' },
  { id: 'cat_refs', name: 'Reference Books' },
];

const INITIAL_RESOURCES: Resource[] = [
  { id: '1', name: 'Course Syllabus 2026.pdf', type: 'PDF', size: '2.4 MB', date: 'Jan 15, 2026', course: 'CS 101', categoryId: 'cat_refs' },
  { id: '2', name: 'Lecture 1 - Introduction.pptx', type: 'PPT', size: '15 MB', date: 'Jan 20, 2026', course: 'CS 101', categoryId: 'cat_lectures' },
  { id: '3', name: 'Data Structures Cheatsheet.pdf', type: 'PDF', size: '1.2 MB', date: 'Feb 10, 2026', course: 'Data Structures', categoryId: 'cat_refs' },
  { id: '4', name: 'Lab Manual - Spring 2026.docx', type: 'DOC', size: '4.5 MB', date: 'Jan 18, 2026', course: 'Web Dev', categoryId: 'cat_labs' },
  { id: '5', name: 'Project Guidelines.pdf', type: 'PDF', size: '800 KB', date: 'Feb 05, 2026', course: 'Software Eng', categoryId: 'cat_assignments' },
];

export default function StaffResources() {
  // Initialize state from localStorage or defaults
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('staff_resource_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('staff_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('staff_resource_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('staff_resources', JSON.stringify(resources));
    } catch (e) {
      console.error('Storage quota exceeded', e);
      Swal.fire('Error', 'Storage quota exceeded. Unable to save recent changes locally.', 'error');
    }
  }, [resources]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // --- Handlers ---

  const handleAddCategory = () => {
    Swal.fire({
      title: 'New Category',
      input: 'text',
      inputLabel: 'Category Name',
      inputPlaceholder: 'e.g., Exam Papers',
      showCancelButton: true,
      confirmButtonText: 'Add Category',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
        if (categories.some(c => c.name.toLowerCase() === value.toLowerCase())) {
          return 'Category already exists!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newCategory: Category = {
          id: `cat_${Date.now()}`,
          name: result.value
        };
        setCategories([...categories, newCategory]);
        Swal.fire({
          icon: 'success',
          title: 'Category Added',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categoryId === 'all') return; // Cannot delete 'All Files'

    const categoryName = categories.find(c => c.id === categoryId)?.name;

    Swal.fire({
      title: `Delete "${categoryName}"?`,
      text: "All files in this category will be deleted too! You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove category
        setCategories(categories.filter(c => c.id !== categoryId));
        // Remove resources in that category
        setResources(resources.filter(r => r.categoryId !== categoryId));
        
        // Reset to 'all' if the deleted category was selected
        if (selectedCategory === categoryId) {
          setSelectedCategory('all');
        }
        Swal.fire(
          'Deleted!',
          'Category and its files have been deleted.',
          'success'
        );
      }
    });
  };

  const handleUploadFile = () => {
    // Simulate file upload with a form
    Swal.fire({
      title: 'Upload New File',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">File Name</label>
            <input id="swal-input1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="e.g., Lecture 1 Notes.pdf">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input id="swal-input2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="e.g., CS 101">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="swal-input3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all">
              ${categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>

          <input type="file" id="swal-file-input" class="hidden" />
          <div id="swal-drop-zone" class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
            <div class="flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              <p id="swal-drop-text" class="text-sm font-medium">Click to upload or drag and drop</p>
              <p class="text-xs text-gray-400 mt-1">Max size 2MB</p>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Upload File',
      confirmButtonColor: '#2563eb',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-4 py-2 rounded-lg font-medium',
        cancelButton: 'px-4 py-2 rounded-lg font-medium'
      },
      didOpen: () => {
        const dropZone = document.getElementById('swal-drop-zone');
        const fileInput = document.getElementById('swal-file-input') as HTMLInputElement;
        const nameInput = document.getElementById('swal-input1') as HTMLInputElement;
        const dropText = document.getElementById('swal-drop-text');

        if (dropZone && fileInput && nameInput && dropText) {
          dropZone.addEventListener('click', () => fileInput.click());

          fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
              nameInput.value = fileInput.files[0].name;
              dropText.textContent = fileInput.files[0].name;
              dropZone.classList.add('border-blue-500', 'bg-blue-50');
            }
          });

          // Drag and drop support
          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
          });

          dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
          });

          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            // Keep the active style to show something happened
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
            
            if (e.dataTransfer && e.dataTransfer.files.length > 0) {
              fileInput.files = e.dataTransfer.files;
              nameInput.value = e.dataTransfer.files[0].name;
              dropText.textContent = e.dataTransfer.files[0].name;
            }
          });
        }
      },
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const course = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const categoryId = (document.getElementById('swal-input3') as HTMLSelectElement).value;
        const fileInput = document.getElementById('swal-file-input') as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!name || !course || !categoryId) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.showValidationMessage('File size exceeds 2MB limit');
                return false;
            }
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        name,
                        course,
                        categoryId,
                        file,
                        content: e.target?.result
                    });
                };
                reader.readAsDataURL(file);
            });
        }

        return { name, course, categoryId, file: null, content: null };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { name, course, categoryId, file, content } = result.value;

        const newResource: Resource = {
          id: Date.now().toString(),
          name: name,
          type: name.split('.').pop()?.toUpperCase() || 'FILE',
          size: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '0 MB',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          course: course,
          categoryId: categoryId,
          content: content
        };

        setResources([newResource, ...resources]);
        Swal.fire({
          icon: 'success',
          title: 'File Uploaded',
          text: `${name} has been added successfully.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleDeleteResource = (resourceId: string) => {
    Swal.fire({
      title: 'Delete File?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        setResources(resources.filter(r => r.id !== resourceId));
        Swal.fire(
          'Deleted!',
          'File has been removed.',
          'success'
        );
      }
    });
  };

  const handleDownload = (resource: Resource) => {
    const element = document.createElement("a");
    
    if (resource.content) {
        element.href = resource.content;
    } else {
        // Fallback for mock resources
        const file = new Blob([`This is a mock file content for: ${resource.name}`], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
    }
    
    element.download = resource.name;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);

    Swal.fire({
      icon: 'success',
      title: 'Downloaded',
      text: `${resource.name} has been downloaded.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  // --- Filtering & Pagination ---

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.categoryId === selectedCategory;
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredResources.length);
  const currentResources = filteredResources.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

return (
  <div className="max-w-7xl mx-auto space-y-6">

    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Course Resources
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage and share learning materials.
        </p>
      </div>

      <div className="flex items-center gap-3">

        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleUploadFile}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Upload size={18} />
          Upload New File
        </button>

      </div>
    </div>

    {/* Mobile Search */}
    <div className="md:hidden relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
        size={18}
      />
      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      {/* Sidebar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm h-fit">

        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Categories
          </h3>

          <button
            onClick={handleAddCategory}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-blue-600 transition-colors"
            title="Add Category"
          >
            <Plus size={18} />
          </button>
        </div>

        <nav className="space-y-1">

          {categories.map((category) => (
            <div key={category.id} className="group flex items-center gap-2">

              <button
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  selectedCategory === category.id
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <Folder
                  size={18}
                  className={
                    selectedCategory === category.id
                      ? "text-blue-500"
                      : "text-gray-400"
                  }
                />
                <span className="truncate">{category.name}</span>
              </button>

              {category.id !== "all" && (
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all"
                  title="Delete Category"
                >
                  <Trash2 size={14} />
                </button>
              )}

            </div>
          ))}

        </nav>
      </div>

      {/* File Table */}
      <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col min-h-[500px]">

        {filteredResources.length > 0 ? (
          <>

            <div className="overflow-x-auto flex-1">

              <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">

                <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">File Name</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Date Added</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">

                  {currentResources.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800 transition-colors group"
                    >

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div
                            className={`p-2 rounded-lg
                            ${
                              file.type === "PDF"
                                ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                : file.type === "PPT"
                                ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                : file.type === "DOC"
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-500"
                            }`}
                          >
                            <FileText size={20} />
                          </div>

                          <div>
                            <span className="font-medium text-slate-900 dark:text-white block">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400 md:hidden">
                              {file.size} • {file.date}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-medium text-gray-600 dark:text-slate-300">
                          {file.course}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 hidden md:table-cell">
                        {file.date}
                      </td>

                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400 hidden md:table-cell">
                        {file.size}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() => handleDownload(file)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            onClick={() => handleDeleteResource(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* Pagination */}

            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800">

              <span className="text-sm text-gray-500 dark:text-slate-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{endIndex}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredResources.length}</span> results
              </span>

              <div className="flex items-center gap-2">

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 bg-white dark:bg-slate-900"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 px-2">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 bg-white dark:bg-slate-900"
                >
                  <ChevronRight size={16} />
                </button>

              </div>

            </div>

          </>
        ) : (

          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 p-12">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Folder size={32} className="text-gray-300 dark:text-slate-600" />
            </div>
            <p className="text-lg font-medium text-gray-500 dark:text-slate-300">
              No files found
            </p>
            <p className="text-sm">
              Try adjusting your search or category filter.
            </p>
          </div>

        )}

      </div>
    </div>
  </div>
);
}
