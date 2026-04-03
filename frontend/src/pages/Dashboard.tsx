// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, Sparkles, ArrowRight, BookPlus, FileQuestion, Loader, MoreVertical, Share, Trash2, CheckCircle, Medal, Search, CalendarDays, Lock, Brain, Zap, TrendingUp, Award, Star, Rocket, Cpu, Globe, BarChart3, Target, ListTodo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { appLogo, serverURL, websiteURL } from '@/constants';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import ShareOnSocial from 'react-share-on-social';
import StatsCard from '@/components/dashboard/StatsCard';
import NotificationBell from '@/components/NotificationBell';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from './Pagination';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 8;

const safeParseCourseContent = (content: string) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse course content:', error);
    return null;
  }
};

const getCourseTopicsFromContent = (course: any) => {
  const jsonData = safeParseCourseContent(course?.content);
  if (!jsonData) return [];
  return jsonData?.course_topics || jsonData?.[course?.mainTopic?.toLowerCase()] || [];
};

const isOrgManagedDraftCourse = (course: any) => {
  if (course?.isOrgManaged) return true;
  const jsonData = safeParseCourseContent(course?.content);
  return Boolean(jsonData?.course_meta?.organizationManaged);
};

const getDraftGenerationProgress = (course: any) => {
  const topics = getCourseTopicsFromContent(course);
  if (!Array.isArray(topics) || topics.length === 0) return 0;

  let totalLessons = 0;
  let generatedLessons = 0;

  topics.forEach((topic: any) => {
    const subtopics = Array.isArray(topic?.subtopics) ? topic.subtopics : [];
    subtopics.forEach((subtopic: any) => {
      totalLessons += 1;
      const hasTheory = typeof subtopic?.theory === 'string' && subtopic.theory.trim().length >= 50;
      const hasMedia = Boolean(subtopic?.youtube || subtopic?.image);
      if (hasTheory && hasMedia) {
        generatedLessons += 1;
      }
    });
  });

  if (!totalLessons) return 0;
  return Math.round((generatedLessons / totalLessons) * 100);
};

const getCourseWorkflowBadge = (course: any, progress: number) => {
  if (isOrgManagedDraftCourse(course)) {
    if (progress >= 100) return 'Ready for Review';
    return course?.approvalStatus === 'pending' ? 'Pending Review' : 'Draft';
  }
  return course?.completed === true ? 'Completed ✓' : 'In Progress';
};

// Animated gradient background component
const AnimatedGradient = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
    <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
  </div>
);

// AI Pulse Effect Component
const AIPulse = () => (
  <div className="relative">
    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
    <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
    <Sparkles className="relative h-5 w-5 text-primary animate-spin-slow" />
  </div>
);

const Dashboard = () => {
  const daysleftRaw = sessionStorage.getItem("daysLeft");

  const daysleft =
    daysleftRaw === "UNLIMITED" || daysleftRaw === "EXPIRED"
      ? null
      : Number(daysleftRaw);

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [page, setPage] = useState(1);
  const userId = sessionStorage.getItem('uid');
  const [courseProgress, setCourseProgress] = useState({});
  const [modules, setTotalModules] = useState({});
  const [quizSummaries, setQuizSummaries] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const userRole = sessionStorage.getItem('role');
  const isOrgAdmin = userRole === 'org_admin' || sessionStorage.getItem('isOrganization') === 'true';
  const orgId = sessionStorage.getItem('orgId');
  const [orgStats, setOrgStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0
  });

  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE);

  async function redirectCourse(content: string, mainTopic: string, type: string, courseId: string, completed: string, end: string) {
    const postURL = serverURL + '/api/getmyresult';
    const response = await axios.post(postURL, { courseId });
    if (response.data.success) {
      const jsonData = JSON.parse(content);
      sessionStorage.setItem('courseId', courseId);
      sessionStorage.setItem('first', completed);
      sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
      let ending = '';
      if (completed) ending = end;
      navigate('/course/' + courseId, {
        state: {
          jsonData,
          mainTopic: mainTopic.toUpperCase(),
          type: type.toLowerCase(),
          courseId,
          end: ending,
          pass: response.data.message || completed,
          lang: response.data.lang,
          certificateId: response.data.certificateId
        }
      });
    } else {
      const jsonData = JSON.parse(content);
      sessionStorage.setItem('courseId', courseId);
      sessionStorage.setItem('first', completed);
      sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
      let ending = '';
      if (completed) ending = end;
      navigate('/course/' + courseId, {
        state: {
          jsonData,
          mainTopic: mainTopic.toUpperCase(),
          type: type.toLowerCase(),
          courseId,
          end: ending,
          pass: completed,
          lang: response.data.lang
        }
      });
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const uid = sessionStorage.getItem('uid');
    if (!uid) { setIsLoading(false); return; }
    try {
      const response = await axios.get(`${serverURL}/api/user/${uid}`);
      const user = response.data.user;
      if (user) {
        const endDate = user.subscriptionEnd;
        if (endDate === null) {
          sessionStorage.setItem("daysLeft", "UNLIMITED");
        } else {
          const today = new Date();
          const end = new Date(endDate);

          if (isNaN(end.getTime())) {
            sessionStorage.setItem("daysLeft", "EXPIRED");
            return;
          }
          const diffTime = end.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysLeft <= 0) {
            sessionStorage.setItem("daysLeft", "EXPIRED");
          } else {
            sessionStorage.setItem("daysLeft", daysLeft.toString());
          }

        }
      }
    } catch (error) {
      console.error('fetchData error:', error);
    } finally {
      setIsLoading(false);
    }

    if (isOrgAdmin && orgId) {
      try {
        const statsRes = await axios.get(`${serverURL}/api/org/dashboard/stats?organizationId=${orgId}`);
        if (statsRes.data.success) {
          setOrgStats({
            totalCourses: statsRes.data.totalCoursesCount,
            completedCourses: statsRes.data.completedCoursesCount,
            inProgressCourses: statsRes.data.inProgressCoursesCount
          });
        }
      } catch (error) {
        console.error('Error fetching org stats:', error);
      }
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    setIsLoading(true);
    const postURL = serverURL + '/api/deletecourse';
    const response = await axios.post(postURL, { courseId: courseId });
    if (response.data.success) {
      setIsLoading(false);
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
      fetchUserCourses();
    } else {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
  };

  const handleCompleteCourse = async (courseId: number) => {
    setIsLoading(true);
    const postURL = serverURL + '/api/finish';
    const response = await axios.post(postURL, { courseId: courseId });
    if (response.data.success) {
      setIsLoading(false);
      toast({
        title: "Course Completed",
        description: "The course has been marked as complete.",
      });
      fetchUserCourses();
    } else {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
  };

  const fetchUserCourses = useCallback(async () => {
    setIsLoading(true);
    const postURL = `${serverURL}/api/courses?userId=${userId}&page=${page}&limit=${ITEMS_PER_PAGE}`;
    try {
      const response = await axios.get(postURL);

      let coursesData = [];
      let total = 0;
      if (Array.isArray(response.data)) {
        coursesData = response.data;
        if (coursesData.length < ITEMS_PER_PAGE) {
          total = (page - 1) * ITEMS_PER_PAGE + coursesData.length;
        } else {
          total = page * ITEMS_PER_PAGE + 1;
        }
      } else {
        coursesData = response.data.courses || [];
        total = response.data.total || 0;
      }

      setTotalCourses(total);

      if (coursesData.length === 0) {
        setCourses([]);
        return;
      }

      const courseIds = coursesData.map((c: any) => c._id);

      const [quizResponse, progressResponse] = await Promise.all([
        axios.post(`${serverURL}/api/getmyresults-batch`, { courseIds }),
        axios.post(`${serverURL}/api/progress/batch`, { userId, courseIds })
      ]).catch(() => [{ data: { results: [] } }, { data: { progress: {} } }]);

      const quizMap: Record<string, boolean> = {};
      const quizSummaryMap: Record<string, any> = {};
      if (quizResponse.data?.success) {
        quizResponse.data.results.forEach((r: any) => {
          quizMap[r.courseId] = r.passed;
          quizSummaryMap[r.courseId] = r;
        });
      }

      const apiProgressMap = progressResponse.data?.progress || {};

      const moduleValues = await Promise.all(
        coursesData.map((course: any) => CountTotalTopics(course.content, course.mainTopic))
      );

      const newProgressMap: Record<string, number> = {};
      const newModulesMap: Record<string, number> = {};

      coursesData.forEach((course: any, i: number) => {
        const isPassed = quizMap[course._id] || course.completed;
        const persistedProgress = apiProgressMap[course._id]?.percentage || 0;
        const draftProgress = isOrgManagedDraftCourse(course) ? getDraftGenerationProgress(course) : 0;
        newProgressMap[course._id] = isPassed ? 100 : Math.max(persistedProgress, draftProgress);
        newModulesMap[course._id] = moduleValues[i];
      });

      setCourseProgress(newProgressMap);
      setTotalModules(newModulesMap);
      setQuizSummaries(quizSummaryMap);
     setCourses(
  coursesData.sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || a.date || a.updatedAt);
    const dateB = new Date(b.createdAt || b.date || b.updatedAt);
    return dateB.getTime() - dateA.getTime(); // 🔥 DESCENDING
  })
);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  useEffect(() => {
    if (courses.length > 0) {
      sessionStorage.setItem("courses", JSON.stringify(courses));
    }
  }, [courses]);
  
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedYear]);

  const CountTotalTopics = async (json: string, mainTopic: string) => {
    try {
      const jsonData = JSON.parse(json);
      let totalTopics = 0;
      const topicsData = jsonData['course_topics'] || jsonData[mainTopic.toLowerCase()];
      if (Array.isArray(topicsData)) {
        topicsData.forEach((topic: { subtopics: string[]; }) => {
          if (Array.isArray(topic.subtopics)) {
            topic.subtopics.forEach(() => { totalTopics++; });
          }
        });
      }
      return totalTopics;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const getCourseThumbnail = (course: any) => {
    try {
      const jsonData = JSON.parse(course.content);
      const topicsData = jsonData?.course_topics || jsonData?.[course.mainTopic?.toLowerCase()] || [];

      for (const topic of topicsData) {
        for (const subtopic of topic?.subtopics || []) {
          if (course.type?.toLowerCase() === 'video & text course' && subtopic?.youtube) {
            return `https://img.youtube.com/vi/${subtopic.youtube}/maxresdefault.jpg`;
          }
          if (subtopic?.image) {
            return subtopic.image;
          }
        }
      }
    } catch (error) {
      console.error('Failed to resolve course thumbnail:', error);
    }
    return course.photo || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80`;
  };

  const availableYears = Array.from(
    new Set(
      courses
        .map((course: any) => {
          const rawDate = course.date || course.createdAt || course.updatedAt;
          const parsedDate = rawDate ? new Date(rawDate) : null;
          return parsedDate && !Number.isNaN(parsedDate.getTime())
            ? String(parsedDate.getFullYear())
            : null;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => Number(b) - Number(a));

  const filteredCourses = courses.filter((course: any) => {
    const searchValue = searchTerm.trim().toLowerCase();
    const matchesSearch =
      searchValue === '' ||
      course.mainTopic?.toLowerCase().includes(searchValue) ||
      course.type?.toLowerCase().includes(searchValue);

    const rawDate = course.date || course.createdAt || course.updatedAt;
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const courseYear =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? String(parsedDate.getFullYear())
        : null;
    const matchesYear = selectedYear === 'all' || courseYear === selectedYear;

    return matchesSearch && matchesYear;
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        stiffness: 100
      }
    }
  };

  return (
    <>
      <SEO
        title="My Courses - AI Learning Dashboard"
        description="Experience the future of learning with AI-powered courses"
        keywords="dashboard, AI courses, learning, education, AI-generated courses"
      />
      <AnimatedGradient />
 <motion.div 
  initial="hidden"
  animate="visible"
  variants={containerVariants}
  className="space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-2 lg:px-4 max-w-[1400px] mx-auto relative pt-0 lg:pt-[65px]"
>
        
        {/* AI-Powered Welcome Section with Glow Effect */}
 <motion.div 
          variants={itemVariants}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-sm border border-primary/20 shadow-lg overflow-hidden">
            {/* Animated particles - Reduced count */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                  }}
                >
                  <div className="w-1 h-1 bg-primary/30 rounded-full" />
                </div>
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                  <Brain className="relative h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-gradient-to-r from-primary to-indigo-500 text-white border-0 px-2 py-0.5 text-xs">
                  AI-Powered Learning
                </Badge>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Welcome back, {sessionStorage.getItem('mName') || 'Learner'}!
              </h2>
              
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Your AI learning assistant is ready. Continue your journey with personalized course recommendations and real-time progress tracking.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="gap-1 bg-primary/5 text-xs py-0">
                  <Zap className="h-3 w-3" />
                  AI Generated
                </Badge>
                <Badge variant="outline" className="gap-1 bg-primary/5 text-xs py-0">
                  <TrendingUp className="h-3 w-3" />
                  Smart Progress
                </Badge>
                <Badge variant="outline" className="gap-1 bg-primary/5 text-xs py-0">
                  <Award className="h-3 w-3" />
                  Certifications
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

       {/* Header Section */}
{/* <motion.div 
  variants={itemVariants}
  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
>
  <div className="flex-1">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
      My Learning Hub
      <Sparkles className="h-4 w-4 sm:h-5 w-5 text-yellow-500 animate-pulse" />
    </h1>
    <p className="text-xs sm:text-sm text-slate-500 mt-1">
      {courses.length} {courses.length === 1 ? 'course' : 'courses'} crafted by AI for you
    </p>
  </div>
  

  <div className="flex items-center gap-2">
    <Button
      onClick={() => (window.location.href = websiteURL)}
      variant="outline"
      size="sm"
      className="flex-1 sm:flex-none h-9 px-3 text-xs font-semibold shadow-sm border-slate-200 hover:bg-slate-50"
    >
      <Globe className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
      Website
    </Button>

    <Button
      onClick={() => navigate('/dashboard/todo')}
      variant="outline"
      size="sm"
      className="flex-1 sm:flex-none h-9 px-3 text-xs font-semibold shadow-sm border-slate-200 hover:bg-slate-50"
    >
      <ListTodo className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
      Todo
    </Button>


    <div className="hidden lg:block ml-1">
      <NotificationBell />
    </div>
  </div>
</motion.div> */}

        {/* Search and Filter with Glass Effect */}
<motion.div 
  variants={itemVariants}
  className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md p-3 sm:p-4 shadow-lg"
>
  <div className="flex flex-col gap-4">
    {/* Top Row: Search and Select */}
    <div className="flex flex-col md:flex-row gap-3">
      {/* Search Input - Full width on mobile, flexible on desktop */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search courses..."
          className="pl-10 h-10 sm:h-11 text-sm bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 w-full"
        />
      </div>

      {/* Select Filter - Full width on mobile, fixed width on desktop */}
      <div className="w-full md:w-56">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="h-10 sm:h-11 text-sm bg-background/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by year" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Bottom Row: Results Counter */}
    <div className="flex items-center justify-between border-t border-border/40 pt-3 md:pt-0 md:border-none">
      <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Current Filters
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
        Showing <span className="text-foreground">{filteredCourses.length}</span> of <span className="text-foreground">{totalCourses}</span>
      </p>
    </div>
  </div>
</motion.div>

        {/* Stats Cards with Neumorphic Design */}
        {!isLoading && (courses.length > 0 || isOrgAdmin) && (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Total Courses"
                value={isOrgAdmin ? orgStats.totalCourses : totalCourses}
                icon={BookOpen}
                description={isOrgAdmin ? "Total organization courses" : "Courses in your library"}
                gradient="from-blue-500 to-indigo-600"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Completed"
                value={isOrgAdmin ? orgStats.completedCourses : courses.filter(c => c.completed === true).length}
                icon={CheckCircle}
                description={isOrgAdmin ? "Student completions" : "Finished courses"}
                gradient="from-green-500 to-emerald-600"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title="In Progress"
                value={isOrgAdmin ? orgStats.inProgressCourses : courses.filter(c => c.completed !== true).length}
                icon={Clock}
                description={isOrgAdmin ? "Current student learnings" : "Currently learning"}
                gradient="from-purple-500 to-pink-600"
              />
            </motion.div>
          </motion.div>
        )}

        {/* AI Learning Tip Banner */}
        {courses.length > 0 && !isLoading && (
  <motion.div 
    variants={itemVariants}
    className="rounded-2xl bg-gradient-to-br from-primary/10 via-indigo-500/5 to-purple-500/10 p-4 border border-primary/10 shadow-sm"
  >
    {/* Use flex-col on mobile, flex-row on desktop */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      
      {/* Icon and Title Header for Mobile */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex-shrink-0 p-2.5 rounded-xl bg-white/50 border border-primary/20 shadow-sm">
          <Cpu className="h-5 w-5 text-primary" />
        </div>
        <div className="sm:hidden">
          <p className="text-sm font-bold text-slate-800">AI Learning Tip</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-1">
        <p className="hidden sm:block text-sm font-bold text-slate-800">🤖 AI Learning Tip</p>
        <p className="text-xs leading-relaxed text-slate-600">
          Based on your patterns, we recommend focusing on courses with <span className="font-semibold text-slate-900">70% completion</span> to maximize retention. 
          Your average is <span className="text-primary font-bold">
            {Math.round(courses.reduce((acc, c) => acc + (courseProgress[c._id] || 0), 0) / courses.length)}%
          </span>
        </p>
      </div>

      {/* Button: Full width on mobile, auto width on desktop */}
      <Button 
        variant="secondary" 
        size="sm" 
        className="w-full sm:w-auto text-xs bg-[#1998e5]  border-slate-200 shadow-sm h-9 "
      >
        
        View Insights
      </Button>
    </div>
  </motion.div>
)}

   {/* Courses Grid with Modern Cards */}
{isLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="aspect-video relative overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <CardHeader className="pb-2">
          <Skeleton className="w-3/4 h-6 mb-2" />
          <Skeleton className="w-full h-4" />
        </CardHeader>
        <CardContent className="pb-2">
          <Skeleton className="w-full h-2 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="w-1/4 h-4" />
            <Skeleton className="w-1/4 h-4" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="w-full h-10" />
        </CardFooter>
      </Card>
    ))}
  </div>
) : (
  <>
    {courses.length > 0 ? (
      <>
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 relative">
                  {/* Rest of your card content remains the same */}
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 rounded-2xl transition-all duration-700 pointer-events-none" />
                  
                  {/* Thumbnail Section */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={getCourseThumbnail(course)}
                      alt={course.mainTopic}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-3 right-3">
                      <Badge className={`text-xs font-semibold ${
                        course.completed === true 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                      } text-white border-0 shadow-lg`}>
                        {course.completed === true ? 'Completed ✓' : 'In Progress'}
                      </Badge>
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40 bg-background/95 backdrop-blur-md">
                          <ShareOnSocial
                            textToShare={sessionStorage.getItem('mName') + " shared you course on " + course.mainTopic}
                            link={websiteURL + '/shareable?id=' + course._id}
                            linkTitle={sessionStorage.getItem('mName') + " shared you course on " + course.mainTopic}
                            linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + course.mainTopic}
                            linkFavicon={appLogo}
                            noReferer
                          >
                            <DropdownMenuItem className="text-sm">
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                          </ShareOnSocial>
                          {!isOrgManagedDraftCourse(course) && (
                            <DropdownMenuItem onClick={() => handleDeleteCourse(course._id)} className="text-sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                          {!isOrgManagedDraftCourse(course) && (
                            <DropdownMenuItem onClick={() => handleCompleteCourse(course._id)} className="text-sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          {course.certificateId && (
                            <DropdownMenuItem onClick={() => navigate(`/verify-certificate?id=${course.certificateId}`)} className="text-sm">
                              <Medal className="h-4 w-4 mr-2" />
                              Certificate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl leading-tight capitalize line-clamp-2 group-hover:text-primary transition-colors">
                      {course.mainTopic}
                    </CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {course.type}
                    </CardDescription>
         
                <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-primary/5">
                        {course.type}
                      </Badge>
                      {isOrgManagedDraftCourse(course) && (
                        <Badge className={`text-xs border-0 text-white shadow-lg ${
                          courseProgress[course._id] >= 100
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            : course.approvalStatus === 'pending'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                              : 'bg-gradient-to-r from-slate-500 to-slate-700'
                        }`}>
                          {getCourseWorkflowBadge(course, courseProgress[course._id] || 0)}
                        </Badge>
                      )}
                      {(() => {
                        const qs: any = quizSummaries?.[course._id];
                        if (!qs) return null;
                        const shouldShow = qs.passed || qs.attemptCount || qs.maxAttemptsReached || qs.nextAttemptAvailableAt;
                        if (!shouldShow) return null;

                        const nextAt = qs.nextAttemptAvailableAt ? new Date(qs.nextAttemptAvailableAt) : null;
                        const cooldownActive = !!nextAt && nextAt > new Date();

                        let label = '';
                        let className = 'text-xs border-0 text-white shadow-lg';
                        if (qs.passed) {
                          label = 'Quiz Passed';
                          className += ' bg-gradient-to-r from-emerald-500 to-green-600';
                        } else if (qs.maxAttemptsReached) {
                          label = 'Quiz Locked';
                          className += ' bg-gradient-to-r from-red-500 to-rose-600';
                        } else if (cooldownActive) {
                          label = 'Retry Later';
                          className += ' bg-gradient-to-r from-amber-500 to-orange-600';
                        } else {
                          label = `Attempt ${qs.attemptCount || 0}/${qs.attemptLimit || 2}`;
                          className += ' bg-gradient-to-r from-blue-500 to-indigo-600';
                        }

                        return (
                          <Badge className={className}>
                            {label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </CardHeader>

                  {/* Progress Section */}
                  <CardContent className="pb-2">
                    {!isOrgAdmin && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-primary">{courseProgress[course._id] || 0}%</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${courseProgress[course._id] || 0}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{modules[course._id] || 0} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>AI Curated</span>
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer Button */}
                  <CardFooter className="pt-2">
                    <Button
                      onClick={() => redirectCourse(course.content, course.mainTopic, course.type, course._id, course.completed, course.end)}
                      variant="ghost"
                      className="w-full group-hover:bg-gradient-to-r group-hover:from-primary/10 group-hover:to-indigo-500/10 transition-all duration-300 justify-between"
                    >
                      <span>
                        {isOrgManagedDraftCourse(course)
                          ? courseProgress[course._id] === 100
                            ? "Review Draft"
                            : "Continue Building"
                          : courseProgress[course._id] === 100
                            ? "Review Course"
                            : "Continue Learning"}
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {!searchTerm && selectedYear === 'all' && filteredCourses.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="mt-8"
          >
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}

        {/* No Results State */}
        {(searchTerm || selectedYear !== 'all') && filteredCourses.length === 0 && (
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="bg-muted/30 rounded-full p-8 mb-6 backdrop-blur-sm">
              <Search className="h-16 w-16 text-muted-foreground/60" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Matching Courses</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Try a different keyword or switch the year filter to view more courses.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedYear('all');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </>
    ) : (
      /* Empty State */
      <motion.div 
        variants={itemVariants}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-full p-8 backdrop-blur-sm">
            <Brain className="h-20 w-20 text-primary/60" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
          Start Your AI Learning Journey
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          You haven't created any courses yet. Generate your first AI-powered course to begin learning with smart recommendations.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" className="shadow-xl bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary text-white" asChild>
            <Link to="/dashboard/generate-course">
              <BookPlus className="mr-2 h-5 w-5" />
              Create Your First Course
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    )}
  </>
)}
      </motion.div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
