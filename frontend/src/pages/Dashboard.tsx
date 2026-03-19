// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, Sparkles, ArrowRight, BookPlus, FileQuestion, Loader, MoreVertical, Share, Trash2, CheckCircle, Medal, Search, CalendarDays } from 'lucide-react';
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
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid
} from 'recharts';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Lock } from 'lucide-react';
import Pagination from './Pagination';


const ITEMS_PER_PAGE = 9;

const Dashboard = () => {
  const daysleftRaw = sessionStorage.getItem("daysLeft");

  const daysleft =
    daysleftRaw === "UNLIMITED" || daysleftRaw === "EXPIRED"
      ? null
      : Number(daysleftRaw);

  const [isUnlimited, setIsUnlimited] = useState(false);
  const [data, setData] = useState([]);
  const plan = sessionStorage.getItem('type');
  const isPaid = ['monthly', 'yearly', 'forever'].includes(plan) || sessionStorage.getItem('daysLeft') === 'UNLIMITED';
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [page, setPage] = useState(1);
  const userId = sessionStorage.getItem('uid');
  const [courseProgress, setCourseProgress] = useState({});
  const [modules, setTotalModules] = useState({});
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


  function redirectCreate() {
    navigate("/dashboard/generate-course");
  }

  function redirectPricing() {
    navigate("/dashboard/pricing");
  }

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
          setIsUnlimited(true);
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

          setIsUnlimited(false);
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

      // Support both { courses, total } shape and plain array (backwards compat)
      let coursesData = [];
      let total = 0;
      if (Array.isArray(response.data)) {
        coursesData = response.data;
        // If fewer results than the page limit came back, we're on the last page.
        // Reconstruct an approximate total from what we know.
        if (coursesData.length < ITEMS_PER_PAGE) {
          total = (page - 1) * ITEMS_PER_PAGE + coursesData.length;
        } else {
          // More pages may exist — set total high enough to show Next
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
      if (quizResponse.data?.success) {
        quizResponse.data.results.forEach((r: any) => {
          quizMap[r.courseId] = r.passed;
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
        newProgressMap[course._id] = isPassed ? 100 : (apiProgressMap[course._id]?.percentage || 0);
        newModulesMap[course._id] = moduleValues[i];
      });

      setCourseProgress(newProgressMap);
      setTotalModules(newModulesMap);
      setCourses(coursesData.sort((a: any, b: any) => b._id.localeCompare(a._id)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchUserCourses();
  }, [fetchUserCourses]);

  // ✅ ADD HERE
useEffect(() => {
  if (courses.length > 0) {
    sessionStorage.setItem("courses", JSON.stringify(courses));
  }
}, [courses]);
  // Reset to page 1 when search or year filter changes
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
            return `https://img.youtube.com/vi/${subtopic.youtube}/hqdefault.jpg`;
          }
          if (subtopic?.image) {
            return subtopic.image;
          }
        }
      }
    } catch (error) {
      console.error('Failed to resolve course thumbnail:', error);
    }
    return course.photo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
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

  return (
    <>
      <SEO
        title="My Courses"
        description="View and manage your CourseGenie AI-generated courses"
        keywords="dashboard, courses, learning, education, AI-generated courses"
      />
      <div className="space-y-8 animate-fade-in">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent border border-primary/10 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-md hover:border-primary/20">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Welcome back, {sessionStorage.getItem('mName') || 'Learner'}! <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Ready to continue your learning journey? You're doing a great job!
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500">My Courses</h1>
            <p className="text-muted-foreground mt-1">Continue learning where you left off</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h6
              onClick={redirectPricing}
              style={{
                display: "inline-block",
                padding: "8px 14px",
                cursor: "pointer",
                borderRadius: "20px",
                backgroundColor:
                  plan === "free"
                    ? "#E0E7FF"
                    : isUnlimited
                      ? "#FEF3C7"
                      : daysleftRaw === "EXPIRED"
                        ? "#FEE2E2"
                        : "#ECFDF5",
                color:
                  plan === "free"
                    ? "#3730A3"
                    : isUnlimited
                      ? "#92400E"
                      : daysleftRaw === "EXPIRED"
                        ? "#DC2626"
                        : "#065F46",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {plan === "free"
                ? "🧪 Free Plan"
                : isUnlimited
                  ? "👑 Unlimited Access"
                  : daysleftRaw === "EXPIRED"
                    ? "Expired"
                    : `📅 ${daysleft} days left`}
            </h6>

            <Button
              onClick={() => (window.location.href = websiteURL)}
              variant="outline"
              className="shadow-md"
            >
              View Website
            </Button>

            <Button
              onClick={() =>
                courses.length === 1 && (plan === "free" || daysleftRaw === "EXPIRED")
                  ? redirectPricing()
                  : redirectCreate()
              }
              className="shadow-md bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Course
            </Button>

            <NotificationBell />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses by topic or type"
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-52">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Filter by year" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredCourses.length} of {totalCourses} course{totalCourses === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Stats Cards Section */}
        {!isLoading && (courses.length > 0 || isOrgAdmin) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatsCard
              title="Total Courses"
              value={isOrgAdmin ? orgStats.totalCourses : totalCourses}
              icon={BookOpen}
              description={isOrgAdmin ? "Total organization courses" : "Courses in your library"}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatsCard
              title="Completed"
              value={isOrgAdmin ? orgStats.completedCourses : courses.filter(c => c.completed === true).length}
              icon={CheckCircle}
              description={isOrgAdmin ? "Student completions" : "Finished courses"}
              gradient="from-green-500 to-emerald-600"
            />
            <StatsCard
              title="In Progress"
              value={isOrgAdmin ? orgStats.inProgressCourses : courses.filter(c => c.completed !== true).length}
              icon={Clock}
              description={isOrgAdmin ? "Current student learnings" : "Currently learning"}
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-border/50">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 group">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={getCourseThumbnail(course)}
                          alt={course.mainTopic}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={course.status === 'Completed' ? 'destructive' : 'secondary'}>
                            {course.completed === true ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="absolute top-2 left-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40">
                              <ShareOnSocial
                                textToShare={sessionStorage.getItem('mName') + " shared you course on " + course.mainTopic}
                                link={websiteURL + '/shareable?id=' + course._id}
                                linkTitle={sessionStorage.getItem('mName') + " shared you course on " + course.mainTopic}
                                linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + course.mainTopic}
                                linkFavicon={appLogo}
                                noReferer
                              >
                                <DropdownMenuItem>
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              </ShareOnSocial>
                              <DropdownMenuItem onClick={() => handleDeleteCourse(course._id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCompleteCourse(course._id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Complete
                              </DropdownMenuItem>
                              {course.certificateId && (
                                <DropdownMenuItem onClick={() => navigate(`/verify-certificate?id=${course.certificateId}`)}>
                                  <Medal className="h-4 w-4 mr-2" />
                                  View Certificate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl leading-tight capitalize">{course.mainTopic}</CardTitle>
                        <CardDescription className="line-clamp-2 capitalize">{course.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {!isOrgAdmin && (
                          <div className="mb-3">
                            <div className="h-2 bg-secondary rounded-full">
                              <div
                                className="h-2 bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                                style={{ width: `${courseProgress[course._id] || 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{courseProgress[course._id] || 0}% complete</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <BookOpen className="mr-1 h-4 w-4" />
                            {modules[course._id] || 0} modules
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() => redirectCourse(course.content, course.mainTopic, course.type, course._id, course.completed, course.end)}
                          variant="ghost"
                          className="w-full group-hover:bg-primary/10 transition-colors justify-between"
                          asChild
                        >
                          <div>
                            {courseProgress[course._id] === 100 ? "View Course" : "Continue Learning"}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {!searchTerm && selectedYear === 'all' && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}

                {/* When filters are active, show a clear filters nudge instead of pagination */}
                {(searchTerm || selectedYear !== 'all') && filteredCourses.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-muted/50 rounded-full p-8 mb-6">
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
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/50 rounded-full p-8 mb-6">
                  <FileQuestion className="h-16 w-16 text-muted-foreground/60" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Courses Created Yet</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  You haven't created any courses yet. Generate your first AI-powered course to start learning.
                </p>
                <Button size="lg" className="shadow-lg" asChild>
                  <Link to="/dashboard/generate-course">
                    <BookPlus className="mr-2 h-5 w-5" />
                    Create Your First Course
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        {/* Advanced Analytics Section */}
        {/* <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500">Advanced Analytics</h2>
            {!isPaid && (
              <Badge variant="secondary" className="gap-1 px-3 py-1">
                <Lock className="h-3 w-3" /> Premium Feature
              </Badge>
            )}
          </div>

          <div className="relative">
            {!isPaid && (
              <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-background/40 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/20 p-8 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unlock Advanced Insights</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  Get detailed visualizations of your learning patterns, topic distribution, and progress tracking with our premium analytics.
                </p>
                <Button onClick={redirectPricing} className="rounded-full px-8 shadow-lg shadow-primary/20">
                  Upgrade to Paid Plan
                </Button>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!isPaid ? 'opacity-40 grayscale-[0.5] pointer-events-none select-none' : ''}`}>
              <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Topic Distribution</CardTitle>
                  <CardDescription>Courses categorized by subject matter</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = {};
                          courses.forEach(c => {
                            const topic = c.mainTopic?.split(' ')[0] || 'Genie';
                            counts[topic] = (counts[topic] || 0) + 1;
                          });
                          return Object.entries(counts).map(([name, value]) => ({ name, value }));
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[0, 1, 2, 3, 4].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Learning Progress</CardTitle>
                  <CardDescription>Completion status across all courses</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Completed', value: courses.filter(c => c.completed).length },
                        { name: 'In Progress', value: courses.filter(c => !c.completed).length },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        <Cell fill="#10B981" />
                        <Cell fill="#4F46E5" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div> */}

      </div>
    </>
  );
};

export default Dashboard;
