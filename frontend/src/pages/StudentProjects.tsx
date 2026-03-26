// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, Clock, Eye, Download, X, Sparkles, 
  TrendingUp, Calendar, Tag, Layers, Search, Filter,
  Grid3x3, List, ArrowUpDown, Star, BookOpen, 
  Brain, Lightbulb, Target, Rocket, Zap, Menu,
  Home, Users, Calendar as CalendarIcon, Globe, Ticket, ChevronRight,
  Cpu, Database, Cloud, Shield, Award, BarChart
} from 'lucide-react';
import SEO from '@/components/SEO';
import axios from 'axios';
import { serverURL } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

// Search and Filter Bar
const SearchFilterBar = ({ searchTerm, setSearchTerm, filterType, setFilterType, sortBy, setSortBy }) => {

  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 mb-6"
    >
      {/* Search Input */}
      <div className="relative group">
       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Search projects by title, description, or subtopics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-blue-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </motion.div>
  );
};

// Project Card Component - Fixed Height
const ProjectCard = ({ project, onView, onDownload, index }) => {
  const getTypeGradient = (type) => {
    const gradients = {
      'AI/ML': 'from-blue-500 to-blue-600',
      'Web Development': 'from-indigo-500 to-blue-600',
      'Data Science': 'from-cyan-500 to-blue-600',
      'IoT': 'from-blue-500 to-indigo-600',
      default: 'from-blue-500 to-blue-600'
    };
    return gradients[type] || gradients.default;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'AI/ML': <Brain className="w-4 h-4" />,
      'Web Development': <Globe className="w-4 h-4" />,
      'Data Science': <BarChart className="w-4 h-4" />,
      'IoT': <Cpu className="w-4 h-4" />,
      default: <Sparkles className="w-4 h-4" />
    };
    return icons[type] || icons.default;
  };

  const getPriority = (dueDate) => {
    if (!dueDate) return 'normal';
    const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'normal';
  };

  const priorityConfig = {
    urgent: { color: 'text-red-600 bg-red-50 border border-red-200', label: 'Urgent', icon: '🔴' },
    warning: { color: 'text-orange-600 bg-orange-50 border border-orange-200', label: 'Due Soon', icon: '🟠' },
    normal: { color: 'text-green-600 bg-green-50 border border-green-200', label: 'On Track', icon: '🟢' }
  };

  const priority = getPriority(project.dueDate);
  const priorityInfo = priorityConfig[priority];

  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
      custom={index}
    className="h-full w-full"
    >
      <motion.div
        variants={cardHoverVariants}
        whileHover="hover"
        className="group relative h-full"
      >
      <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-700  shadow-lg hover:shadow-xl transition-all duration-500 h-full flex flex-col ">
          {/* Animated gradient border */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-r ${getTypeGradient(project.type)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            style={{ height: '4px', top: 0 }}
          />
          
          {/* Blue glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 rounded-xl transition-all duration-700" />
          
          <CardHeader className="pb-2 relative z-10 flex-shrink-0">
            <div className="flex justify-between items-start mb-2">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className={`text-xs px-3 py-1.5 rounded-full bg-gradient-to-r ${getTypeGradient(project.type)} text-white shadow-md flex items-center gap-1`}
              >
                {getTypeIcon(project.type)}
                <span>{project.type}</span>
              </motion.span>
              {project.dueDate && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-xs px-2 py-1 rounded-full ${priorityInfo.color} flex items-center gap-1 font-medium`}
                >
                  <span>{priorityInfo.icon}</span>
                  <span>{priorityInfo.label}</span>
                </motion.span>
              )}
            </div>
            
            <CardTitle className="text-lg lg:text-xl text-gray-800 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
              {project.title}
            </CardTitle>

            <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-400 text-sm min-h-[2.5rem]">
              {(project.description || '').replace(/<[^>]*>?/gm, '').substring(0, 100)}
              {(project.description || '').length > 100 ? '...' : ''}
            </CardDescription>
          </CardHeader>

          <CardContent className="border-t border-blue-100 pt-4 relative z-10 mt-auto">
            {/* Subtopics */}
            {project.subtopics?.slice(0, 3).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[2.5rem]">
                {project.subtopics.slice(0, 3).map((topic, idx) => (
                  <motion.span 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200"
                  >
                    {topic}
                  </motion.span>
                ))}
                {project.subtopics.length > 3 && (
                  <span className="text-xs text-blue-500">+{project.subtopics.length - 3}</span>
                )}
              </div>
            )}
            
       <div className="flex items-center justify-between mt-3">

  {/* LEFT SIDE */}
  <div className="flex flex-col gap-1 min-w-0">

    {/* Department / ID */}
    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
      <Briefcase className="w-3 h-3 shrink-0" />
      <span className="truncate max-w-[130px]">
        {project.department || 'General'}
      </span>
    </div>

    {/* Date */}
    {project.dueDate && (
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3" />
        <span>
          {new Date(project.dueDate).toLocaleDateString()}
        </span>
      </div>
    )}

  </div>

  {/* RIGHT SIDE ICONS */}
  <div className="flex items-center gap-2 shrink-0">

    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onView(project)}
      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition"
    >
      <Eye className="w-4 h-4 text-blue-600" />
    </motion.button>

    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onDownload(project)}
      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition"
    >
      <Download className="w-4 h-4 text-blue-600" />
    </motion.button>

  </div>

</div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Main Component
const StudentProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const orgId = sessionStorage.getItem('orgId');
  const studentId = sessionStorage.getItem('uid');

  useEffect(() => {
    if (orgId && studentId) fetchProjects();
  }, [orgId, studentId]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, filterType, sortBy]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverURL}/api/org/projects?organizationId=${orgId}&studentId=${studentId}`);
      if (res.data.success) {
        setProjects(res.data.projects);
        setFilteredProjects(res.data.projects);
        // Calculate stats
        setStats({
          total: res.data.projects.length,
          completed: res.data.projects.filter(p => p.status === 'completed').length,
          inProgress: res.data.projects.filter(p => p.status === 'in-progress').length
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subtopics?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    setFilteredProjects(filtered);
  };

  const formatGuidanceText = (text: string) => {
    if (!text) return '';
    let html = text;
    html = html.replace(/\*\*(.*?)\*\*/g, '<h3 class="text-blue-600 font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/\n?\d+\.\s/g, '<li>');
    html = html.replace(/(<li>.*?)(?=<li>|$)/g, '$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ol class="list-decimal pl-5 mb-3">$1</ol>');
    html = html.replace(/\*\s/g, '<li>');
    html = html.replace(/(<li>.*?)(?=<li>|$)/g, '$1</li>');
    html = html.replace(/\n{2,}/g, '</p><p>');
    html = `<p>${html}</p>`;
    return html;
  };

  const cleanMarkdown = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const handleDownload = (p: any) => {
    const htmlToText = (html: string) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      let text = '';
      const cleanText = (str: string) => str.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*/g, '').replace(/\n+/g, ' ').trim();
      const walk = (node: any) => {
        if (node.nodeType === 3) text += cleanText(node.nodeValue);
        if (['H1', 'H2', 'H3'].includes(node.tagName)) text += `\n\n${cleanText(node.innerText).toUpperCase()}\n---------------------\n`;
        if (node.tagName === 'P') text += `\n${cleanText(node.innerText)}\n`;
        if (node.tagName === 'LI') text += `\n• ${cleanText(node.innerText)}`;
        node.childNodes.forEach(walk);
      };
      walk(div);
      return text;
    };

    const content = `
==============================
${p.title.toUpperCase()}
==============================

DESCRIPTION:
${htmlToText(p.description)}

GUIDANCE:
${htmlToText(cleanMarkdown(p.guidance))}

SUBTOPICS:
${p.subtopics?.join(', ') || 'N/A'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.title}.txt`;
    a.click();
  };

  const handleView = (project) => {
    setSelectedProject({
      ...project,
      description: formatGuidanceText(project.description),
      guidance: formatGuidanceText(project.guidance)
    });
    setOpenView(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-blue-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-blue-600 font-medium">Loading your projects...</p>
          <p className="text-sm text-blue-500 mt-2">AI is preparing your dashboard</p>
        </motion.div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <SEO title="My Projects" description="View your projects with AI-powered insights" />
      
      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 lg:px-10 py-5 sm:py-6 md:py-8">
        {/* Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span>AI-Powered Project Management</span>
          </div>
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-purple-600">
  My Projects
</h1>
      <p className="text-gray-600 dark:text-gray-400">
            Discover, manage, and excel in your academic projects with AI-powered insights and recommendations
          </p>
        </motion.div>

 

        {/* Search and Filter */}
        <SearchFilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Projects Grid with Fixed Height Cards */}
        <AnimatePresence>
          {filteredProjects.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  onView={handleView}
                  onDownload={handleDownload}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4"
              >
                <Rocket className="w-10 h-10 text-blue-500" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">No Projects Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No projects match your search criteria' : 'Check back later for new assignments'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal with Blue Theme */}
      <AnimatePresence>
        {openView && selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
            onClick={() => setOpenView(false)}
          >
            <motion.div 
  initial={{ scale: 0.9, opacity: 0, y: 50 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.9, opacity: 0, y: 50 }}
  transition={{ type: "spring", damping: 25 }}
  className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
  onClick={(e) => e.stopPropagation()}
>
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">{selectedProject.title}</h2>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpenView(false)} 
                  className="text-white hover:text-blue-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <BookOpen className="w-5 h-5" />
                    Description
                  </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Guidance
                  </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
               <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedProject.guidance }} />
                  </div>
                </motion.div>

                {selectedProject.subtopics?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <Tag className="w-5 h-5 text-green-500" />
                      Subtopics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.subtopics.map((st: string, i: number) => (
                        <motion.span 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                       className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-full"
                        >
                          {st}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-gray-700"
                >
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Type</p>
<p className="font-medium text-gray-800 dark:text-gray-200">{selectedProject.type}</p>
                  </div>
                  {selectedProject.dueDate && (
                    <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Due Date</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                        {new Date(selectedProject.dueDate).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                 <p className="text-sm text-blue-600 dark:text-blue-400">Department</p>
<p className="font-medium text-gray-800 dark:text-gray-200">{selectedProject.department || 'General'}</p>
                  </div>
                </motion.div>
              </div>

           <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-blue-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpenView(false)} className="border-blue-300 dark:border-gray-600 text-blue-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800">Close</Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="default" onClick={() => handleDownload(selectedProject)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProjects;