// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  DollarSign,
  LogOut,
  Sparkles,
  Menu,
  Settings2Icon,
  Building2,
  BookOpen,
  Bell,
  Newspaper,
  LayoutDashboard,
  Briefcase,
  Video,
  Users,
  FileText,
  Download,
  BrainCircuit,
  MessageSquare,
  Calendar,
  Megaphone,
  Folder,
  LifeBuoy,
  Award,
  BarChart3
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { websiteURL, serverURL } from '@/constants';
import { useBranding } from '@/contexts/BrandingContext';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import NotificationBell from '../NotificationBell';
import { useTheme } from '@/contexts/ThemeContext';





const DashboardLayout = () => {
  const { appName, appLogo } = useBranding();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const { toast } = useToast();
  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;
  const [admin, setAdmin] = useState(false);
  const { toggleTheme } = useTheme();
  const [notebookEnabled, setNotebookEnabled] = useState({
    free: false,
    monthly: true,
    yearly: true,
    forever: true,
    org_admin: true,
    student: false
  });
  const [resumeEnabled, setResumeEnabled] = useState({
    free: false,
    monthly: true,
    yearly: true,
    forever: true,
    org_admin: true,
    student: false
  });
  const [careerEnabled, setCareerEnabled] = useState({
    free: false,
    monthly: true,
    yearly: true,
    forever: true,
    org_admin: true,
    student: false
  });

  useEffect(() => {
    if (sessionStorage.getItem('uid') === null) {
      window.location.href = websiteURL + '/login';
    }
    async function dashboardData() {
      const postURL = serverURL + `/api/dashboard`;
      const response = await axios.post(postURL);
      sessionStorage.setItem('adminEmail', response.data.admin.email);
      if (response.data.admin.email === sessionStorage.getItem('email')) {
        setAdmin(true);
      }
      if (response.data.admin.notebookEnabled) {
        setNotebookEnabled(response.data.admin.notebookEnabled);
      }
      if (response.data.admin.resumeEnabled) {
        setResumeEnabled(response.data.admin.resumeEnabled);
      }
      if (response.data.admin.careerEnabled) {
        setCareerEnabled(response.data.admin.careerEnabled);
      }
    }
    if (sessionStorage.getItem('adminEmail')) {
      if (sessionStorage.getItem('adminEmail') === sessionStorage.getItem('email')) {
        setAdmin(true);
      }
      dashboardData(); // Always fetch to get latest settings like notebookEnabled
    } else {
      dashboardData();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    });
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return
    installPrompt.prompt()
    installPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted install')
      }
      setInstallPrompt(null)
    })
  }

  function Logout() {
    sessionStorage.clear();
    toast({
      title: "Logged Out",
      description: "You have logged out successfully",
    });
    window.location.href = websiteURL + '/login';
  }
  // starbala
  const [userType, setUserType] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [canGenerate, setCanGenerate] = useState(true);

  useEffect(() => {
    async function checkCourseLimit() {
      try {
        const uid = sessionStorage.getItem("uid");

        const userRes = await axios.get(`${serverURL}/api/getusers`);
        const user = userRes.data.find(u => u._id === uid);

        if (user) {
          setUserType(user.type);
        }

        const courseRes = await axios.get(`${serverURL}/api/getcourses`);
        const myCourses = courseRes.data.filter(c => c.user === uid);

        setCourseCount(myCourses.length);

      } catch (err) {
        console.error(err);
      }
    }

    checkCourseLimit();
  }, []);


  const handleGenerateClick = () => {

    if (userType === "free" && courseCount >= 1) {
      window.location.href = "/dashboard/pricing";
      return;
    }

    if (userType === "monthly" && courseCount >= 5) {
      window.location.href = "/dashboard/pricing";
      return;
    }

    window.location.href = "/dashboard/generate-course";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-muted/30">
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/40">
            <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-3">
              <div className="h-8 w-8 rounded-md bg-primary from-primary flex items-center justify-center">
                <img src={appLogo} alt="Logo" className='h-6 w-6' />
              </div>
              <span className="font-display text-lg font-bold bg-primary text-gradient">{appName}</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sessionStorage.getItem('role') !== 'student' && sessionStorage.getItem('role') !== 'dept_admin' && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Home" isActive={isActive('/dashboard')}>
                          <Link to="/dashboard" className={cn(isActive('/dashboard') && "text-primary")}>
                            <Home />
                            <span>Home</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Profile" isActive={isActive('/dashboard/profile')}>
                          <Link to="/dashboard/profile" className={cn(isActive('/dashboard/profile') && "text-primary")}>
                            <User />
                            <span>My Profile</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Pricing" isActive={isActive('/dashboard/pricing')}>
                          <Link to="/dashboard/pricing" className={cn(isActive('/dashboard/pricing') && "text-primary")}>
                            <DollarSign />
                            <span>Pricing</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Resume Builder — restricted by settings */}
                      {resumeEnabled[sessionStorage.getItem('role') === 'org_admin' ? 'org_admin' : (sessionStorage.getItem('type') as keyof typeof resumeEnabled)] && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="Resume Builder" isActive={isActive('/dashboard/resume-builder')}>
                            <Link to="/dashboard/resume-builder" className={cn(isActive('/dashboard/resume-builder') && "text-primary")}>
                              <FileText />
                              <span>Resume Builder</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {/* AI Notebook — restricted by settings */}
                      {notebookEnabled[sessionStorage.getItem('role') === 'org_admin' ? 'org_admin' : (sessionStorage.getItem('type') as keyof typeof notebookEnabled)] && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="AI Notebook" isActive={isActive('/dashboard/notebook')}>
                            <Link to="/dashboard/notebook" className={cn(isActive('/dashboard/notebook') && "text-primary")}>
                              <BrainCircuit />
                              <span>AI Notebook</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Interview Prep" isActive={isActive('/dashboard/interview-prep')}>
                          <Link to="/dashboard/interview-prep" className={cn(isActive('/dashboard/interview-prep') && "text-primary")}>
                            <Briefcase />
                            <span>Interview Prep</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Support — show only if NOT admin */}
                      {!admin && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            tooltip="Support"
                            isActive={isActive('/dashboard/support')}
                          >
                            <Link
                              to="/dashboard/support"
                              className={cn(isActive('/dashboard/support') && "text-primary")}
                            >
                              <MessageSquare />
                              <span>Support</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {!admin && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="Global News" isActive={isActive('/dashboard/news')}>
                            <Link to="/dashboard/news" className={cn(isActive('/dashboard/news') && "text-primary")}>
                              <Megaphone className="h-5 w-5" />
                              <span>Global News</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}


                      {/* <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Pricing" isActive={isActive('/dashboard/pricing')}>
                          <Link to="/dashboard/pricing" className={cn(isActive('/dashboard/pricing') && "text-primary")}>
                            <DollarSign />
                            <span>Pricing</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem> */}
                    </>
                  )}

                  {/* Common Menu Items - Hidden for Organization Students to keep their view clean, OR kept?
                      The request implies a specific left nav. "Assignments, Notices, Blogs, News, dashboard"
                      Let's hide the default "Home" and "Pricing" for students if we want to be strict,
                      but keeping "Profile" might be good.
                      For now, I'll add the student specific ones conditionally.
                   */}

                  {sessionStorage.getItem('role') === 'student' ? (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/dashboard/student')}>
                          <Link to="/dashboard/student" className={cn(isActive('/dashboard/student') && "text-primary")}>
                            <LayoutDashboard />
                             <span>Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Attendance" isActive={isActive('/dashboard/student/attendance')}>
                          <Link to="/dashboard/student/attendance" className={cn(isActive('/dashboard/student/attendance') && "text-primary")}>
                            <Calendar />
                            <span>Attendance</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      {notebookEnabled.student && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="AI Notebook" isActive={isActive('/dashboard/notebook')}>
                            <Link to="/dashboard/notebook" className={cn(isActive('/dashboard/notebook') && "text-primary")}>
                              <BrainCircuit />
                              <span>AI Notebook</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                      {careerEnabled.student && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="Career Hub" isActive={isActive('/dashboard/student/career')}>
                            <Link to="/dashboard/student/career" className={cn(isActive('/dashboard/student/career') && "text-primary")}>
                              <Award />
                              <span>Career Hub</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Interview Prep" isActive={isActive('/dashboard/interview-prep')}>
                          <Link to="/dashboard/interview-prep" className={cn(isActive('/dashboard/interview-prep') && "text-primary")}>
                            <Briefcase />
                            <span>Interview Prep</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Assignments" isActive={isActive('/dashboard/student/assignments')}>
                          <Link to="/dashboard/student/assignments" className={cn(isActive('/dashboard/student/assignments') && "text-primary")}>
                            <BookOpen />
                            <span>Assignments</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Notices" isActive={isActive('/dashboard/student/notices')}>
                          <Link to="/dashboard/student/notices" className={cn(isActive('/dashboard/student/notices') && "text-primary")}>
                            <Bell />
                            <span>Noticeboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Blogs" isActive={isActive('/dashboard/student/blogs')}>
                          <Link to="/dashboard/student/blogs" className={cn(isActive('/dashboard/student/blogs') && "text-primary")}>
                            <Sparkles />
                            <span>Blogs</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                     <SidebarMenuItem>
  <SidebarMenuButton 
    asChild 
    tooltip="Global News" 
    isActive={isActive('/dashboard/student/news')}
  >
    <Link 
      to="/dashboard/student/news" 
      className={cn(isActive('/dashboard/student/news') && "text-primary")}
    >
      <Megaphone />
      <span>Global News</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Meetings" isActive={isActive('/dashboard/student/meetings')}>
                          <Link to="/dashboard/student/meetings" className={cn(isActive('/dashboard/student/meetings') && "text-primary")}>
                            <Menu />
                            <span>Meetings</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Projects" isActive={isActive('/dashboard/student/projects')}>
                          <Link to="/dashboard/student/projects" className={cn(isActive('/dashboard/student/projects') && "text-primary")}>
                            <Briefcase />
                            <span>Projects</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Materials" isActive={isActive('/dashboard/student/materials')}>
                          <Link to="/dashboard/student/materials" className={cn(isActive('/dashboard/student/materials') && "text-primary")}>
                            <BookOpen />
                            <span>Materials</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          tooltip="Support Tickets"
                          isActive={isActive('/dashboard/student/support-tickets')}
                        >
                          <Link
                            to="/dashboard/student/support-tickets"
                            className={cn(isActive('/dashboard/student/support-tickets') && "text-primary")}
                          >
                            <MessageSquare />
                            <span>Support Tickets</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  ) : (
                    <>
                      {/* Default Menu Items for non-students (Regular Users / Admins / Org Admins) */}
                      {/* Note: Org Admin has their own "Organization Portal" link below */}

                      {/* Only showing Generate Course if NOT a student (or handled by routing permission) */}
                      {/* <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Generate Course" isActive={isActive('/dashboard/generate-course')}>
                          <Link to="/dashboard/generate-course" className={cn(isActive('/dashboard/generate-course') && "text-primary")}>
                            <Sparkles />
                            <span>Generate Course</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem> */}
                    </>
                  )}

                  {/* Admin Panel */}
                  {admin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Admin Panel" isActive={isActive('/admin')}>
                        <Link to="/admin" className={cn(isActive('/admin') && "text-primary")}>
                          <Settings2Icon />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}


                  {sessionStorage.getItem('isOrganization') === 'true' && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Organization Portal" isActive={isActive('/dashboard/org')}>
                          <Link to="/dashboard/org" className={cn(isActive('/dashboard/org') && "text-primary")}>
                            <Building2 />
                            <span>Organization Portal</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Organization Management Sub-menu */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Students" isActive={location.pathname === '/dashboard/org' && location.search === '?tab=students'}>
                          <Link to="/dashboard/org?tab=students" className={cn((location.pathname === '/dashboard/org' && location.search === '?tab=students') && "text-primary")}>
                            <Users className="ml-4" />
                            <span>Students</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Courses" isActive={location.search === '?tab=courses'}>
                          <Link to="/dashboard/org?tab=courses" className={cn(location.search === '?tab=courses' && "text-primary")}>
                            <BookOpen className="ml-4" />
                            <span>Courses</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Assignments" isActive={location.search === '?tab=assignments'}>
                          <Link to="/dashboard/org?tab=assignments" className={cn(location.search === '?tab=assignments' && "text-primary")}>
                            <FileText className="ml-4" />
                            <span>Assignments</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Meetings" isActive={location.search === '?tab=meetings'}>
                          <Link to="/dashboard/org?tab=meetings" className={cn(location.search === '?tab=meetings' && "text-primary")}>
                            <Video className="ml-4" />
                            <span>Meetings</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Projects" isActive={location.search === '?tab=projects'}>
                          <Link to="/dashboard/org?tab=projects" className={cn(location.search === '?tab=projects' && "text-primary")}>
                            <Briefcase className="ml-4" />
                            <span>Projects</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Materials" isActive={location.search === '?tab=materials'}>
                          <Link to="/dashboard/org?tab=materials" className={cn(location.search === '?tab=materials' && "text-primary")}>
                            <Download className="ml-4" />
                            <span>Materials</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Notices" isActive={location.search === '?tab=notices'}>
                          <Link to="/dashboard/org?tab=notices" className={cn(location.search === '?tab=notices' && "text-primary")}>
                            <Bell className="ml-4" />
                            <span>Noticeboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Career & Placement */}
                      {careerEnabled.org_admin && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild tooltip="Career & Placement" isActive={isActive('/dashboard/org/career') || location.search === '?tab=career'}>
                            <Link to="/dashboard/org/career" className={cn((isActive('/dashboard/org/career') || location.search === '?tab=career') && "text-primary")}>
                              <Award className="ml-4" />
                              <span>Career & Placement</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                      {/* ✅ Student Tickets (NEW CLEAN ROUTE) */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          tooltip="Student Tickets"
                          isActive={isActive('/dashboard/org/student-tickets')}
                        >
                          <Link
                            to="/dashboard/org/student-tickets"
                            className={cn(isActive('/dashboard/org/student-tickets') && "text-primary")}
                          >
                            <MessageSquare className="ml-4" />
                            <span>Student Tickets</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* KPI Reports */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="KPI Reports" isActive={isActive('/dashboard/org/reports')}>
                          <Link to="/dashboard/org/reports" className={cn(isActive('/dashboard/org/reports') && "text-primary")}>
                            <BarChart3 className="ml-4" />
                            <span>KPI Reports</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>




                {/* Staff Dashboard - Visible only to Department Admins */}
                {sessionStorage.getItem('role') === 'dept_admin' && (
                  <>
                    {/* Dashboard */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/dashboard/staff')}>
                        <Link to="/dashboard/staff">
                          <LayoutDashboard />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Interview Prep" isActive={isActive('/dashboard/interview-prep')}>
                        <Link to="/dashboard/interview-prep">
                          <Briefcase />
                          <span>Interview Prep</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Classes */}
                    {/* <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Classes" isActive={isActive('/dashboard/staff/classes')}>
                        <Link to="/dashboard/staff/classes">
                          <BookOpen />
                          <span>Classes</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem> */}

                    {/* Students */}
                    {/* <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Students" isActive={isActive('/dashboard/staff/students')}>
                        <Link to="/dashboard/staff/students">
                          <Users />
                          <span>Students</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem> */}



                    {/* Grading */}
                    {/* <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Grading" isActive={isActive('/dashboard/staff/grading')}>
                        <Link to="/dashboard/staff/grading">
                          <FileText />
                          <span>Grading</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem> */}

                    {/* Schedule */}
                    {/* <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Schedule" isActive={isActive('/dashboard/staff/schedule')}>
                        <Link to="/dashboard/staff/schedule">
                          <Calendar />
                          <span>Schedule</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem> */}

               {/* Global News */}
<SidebarMenuItem>
  <SidebarMenuButton
    asChild
    tooltip="Global News"
    isActive={isActive('/dashboard/news')}
  >
    <Link to="/dashboard/news">
      <Megaphone />
      <span>Global News</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>

                    {/* Resources */}
                    {/* <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Resources" isActive={isActive('/dashboard/staff/resources')}>
                        <Link to="/dashboard/staff/resources">
                          <Folder />
                          <span>Resources</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem> */}

                    {/* Support */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Support" isActive={isActive('/dashboard/staff/support')}>
                        <Link to="/dashboard/staff/support">
                          <LifeBuoy />
                          <span>Support</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <div className="h-px bg-border/40 my-2 mx-4" />
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Management</div>


                    {/* Courses */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Courses" isActive={location.search === '?tab=courses'}>
                        <Link to="/dashboard/org?tab=courses" className={cn(location.search === '?tab=courses' && "text-primary")}>
                          <BookOpen />
                          <span>Courses</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    
                   {/* Students */}
                      <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="students" isActive={location.search === '?tab=students'}>
                        <Link to="/dashboard/org?tab=students" className={cn(location.search === '?tab=students' && "text-primary")}>
                          <Users />
                          <span>Student</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Assignments */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Assignments" isActive={location.search === '?tab=assignments'}>
                        <Link to="/dashboard/org?tab=assignments" className={cn(location.search === '?tab=assignments' && "text-primary")}>
                          <FileText />
                          <span>Assignments</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Meetings */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Meetings" isActive={location.search === '?tab=meetings'}>
                        <Link to="/dashboard/org?tab=meetings" className={cn(location.search === '?tab=meetings' && "text-primary")}>
                          <Video />
                          <span>Meetings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Projects */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Projects" isActive={location.search === '?tab=projects'}>
                        <Link to="/dashboard/org?tab=projects" className={cn(location.search === '?tab=projects' && "text-primary")}>
                          <Briefcase />
                          <span>Projects/Research</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Materials */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Materials" isActive={location.search === '?tab=materials'}>
                        <Link to="/dashboard/org?tab=materials" className={cn(location.search === '?tab=materials' && "text-primary")}>
                          <Download />
                          <span>Materials</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Noticeboard */}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Noticeboard" isActive={location.search === '?tab=notices'}>
                        <Link to="/dashboard/org?tab=notices" className={cn(location.search === '?tab=notices' && "text-primary")}>
                          <Bell />
                          <span>Noticeboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarGroupContent>
            </SidebarGroup>


            {/* {sessionStorage.getItem('role') !== 'student' && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="px-2">
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary shadow-md transition-all"
                      size="sm"
                      asChild
                    >
                      <Link to="/dashboard/generate-course">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Course
                      </Link>
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )} */}
            {sessionStorage.getItem('role') !== 'student' && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="px-2">
                    <Button
                      onClick={handleGenerateClick}
                      className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-primary shadow-md transition-all"
                      size="sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Course
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-border/40">
            <SidebarMenu>
              {installPrompt && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Theme">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleInstallClick}
                        variant="ghost"
                        size="icon"
                      >
                        <DownloadIcon className='h-5 w-5' />
                        <span className='sr-only'>Desktop App</span>
                      </Button>
                      <span>Desktop App</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
              }
              {/* Toggle Theme */}
              <SidebarMenuButton asChild tooltip="Theme" onClick={toggleTheme}>
                <div className="
                      group
                      rounded-md
                      transition-all
                      hover:bg-destructive/10
                      hover:shadow-md
                    ">
                  <ThemeToggle />
                  <span className="pl-3">Toggle Theme</span>
                </div>
              </SidebarMenuButton>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout"
                  className="
          group
          rounded-md
          transition-all
          hover:bg-destructive/10
          hover:shadow-md
        "
                  style={{ paddingLeft: "18px" }}>
                  <Link onClick={Logout} className="text-muted-foreground hover:text-destructive transition-colors" style={{ gap: "37px" }}>
                    <LogOut />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
          {/* Desktop Header */}
          {!isMobile && (location.pathname.startsWith("/dashboard/org") || location.pathname.startsWith("/dashboard/student")) && (
            <div className="absolute top-4 right-8 z-10 flex items-center gap-4">
              <NotificationBell />
            </div>
          )}
          {isMobile && (
            <div className="flex items-center mb-6 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
              <SidebarTrigger className="mr-2">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-indigo-500 text-gradient">{appName}</h1>
              <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
                <ThemeToggle />
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
