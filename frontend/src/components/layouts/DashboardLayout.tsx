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
  BarChart3,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { websiteURL, serverURL } from '@/constants';
import { useBranding } from '@/contexts/BrandingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import NotificationBell from '../NotificationBell';

// Menu Item Component - Text hides when collapsed
const MenuItem = ({ icon: Icon, label, to, isActive, badge, onClick, className, isExpanded }: any) => (
  <SidebarMenuItem>
    <SidebarMenuButton 
      asChild 
      tooltip={!isExpanded ? label : undefined}
      isActive={isActive}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        isActive 
          ? "bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 text-primary shadow-sm" 
          : "hover:bg-muted/50",
        className
      )}
    >
      <Link to={to} className="relative z-10">
        <div className={cn(
          "flex items-center transition-all duration-300",
          !isActive && "group-hover:translate-x-1",
          isExpanded ? "gap-3" : "justify-center gap-0"
        )}>
          <div className="rounded-lg p-1.5 transition-all duration-300">
            <Icon className={cn(
              "h-5 w-5 transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )} />
          </div>
          {isExpanded && (
            <>
              <span className="font-medium whitespace-nowrap">{label}</span>
              {badge && (
                <span className={cn(
                  "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                  badge === "PRO" && "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
                  badge === "NEW" && "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                  badge === "BETA" && "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                )}>
                  {badge}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

// Section Header Component - Text hides when collapsed
const SectionHeader = ({ title, icon: Icon, isExpanded }: any) => {
  if (!isExpanded) return null;
  
  return (
    <div className="px-4 py-2 mt-2 mb-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {Icon && <Icon className="h-3 w-3" />}
        <span>{title}</span>
      </div>
    </div>
  );
};

// Theme Toggle Button Component
// Theme Toggle Button Component - Always show Sun icon with different text
// Theme Toggle Button Component - Show appropriate icon for the action
const ThemeToggleButton = ({ isExpanded = false }: { isExpanded?: boolean }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300 w-full",
        "hover:shadow-md active:scale-[0.98]",
        isExpanded ? "p-2" : "p-2.5"
      )}
    >
      <div className={cn(
        "flex items-center",
        isExpanded ? "gap-3" : "justify-center"
      )}>
        <div className="rounded-lg p-1.5 transition-all duration-300">
          {theme === 'light' ? (
            // In light mode, show Moon icon (to switch to dark)
            <Sun className="h-5 w-5 text-slate-700 transition-all duration-300 group-hover:-rotate-12" />
          ) : (
            // In dark mode, show Sun icon (to switch to light)
            <Moon className="h-5 w-5 text-yellow-500 transition-all duration-300 group-hover:rotate-90" />
          )}
        </div>
        {isExpanded && (
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </p>
          </div>
        )}
      </div>
    </button>
  );
};

const DashboardLayout = () => {
  const { appName, appLogo } = useBranding();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [admin, setAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const plan = sessionStorage.getItem("type")?.toLowerCase()?.trim();
  const role = sessionStorage.getItem("role");
  const isPaidUser = ["monthly", "yearly"].includes(plan) || admin;

  const [installPrompt, setInstallPrompt] = useState(null);
  const { toast } = useToast();
  
  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;
 
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
      dashboardData();
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

  // Determine if sidebar should be expanded
  const isExpanded = !isCollapsed || hovered;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <Sidebar 
          className={cn(
            "border-r border-border/40 bg-card/95 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out",
            isCollapsed && !hovered ? "w-[70px]" : "w-[260px]"
          )}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Header with Collapse Toggle */}
          <SidebarHeader className="border-b border-border/40 py-4 px-3">
            <div className="flex items-center justify-between">
              <Link 
                to="/dashboard" 
                className={cn(
                  "flex items-center space-x-3 group relative transition-all duration-300",
                  !isExpanded && "justify-center w-full"
                )}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                    <img src={appLogo} alt="Logo" className='h-5 w-5' />
                  </div>
                </div>
                {isExpanded && (
                  <span className="font-display text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent group-hover:scale-105 transition-transform whitespace-nowrap">
                    {appName}
                  </span>
                )}
              </Link>
              
              {/* Collapse Toggle Button */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-muted/50 transition-all"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {!isExpanded ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="py-4">
            {/* Main Menu Section */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5 px-2">
                  {sessionStorage.getItem('role') !== 'student' && sessionStorage.getItem('role') !== 'dept_admin' && (
                    <>
                      <MenuItem 
                        icon={Home} 
                        label="Home" 
                        to="/dashboard" 
                        isActive={isActive('/dashboard')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={User} 
                        label="My Profile" 
                        to="/dashboard/profile" 
                        isActive={isActive('/dashboard/profile')}
                        isExpanded={isExpanded}
                      />
                      
                      {sessionStorage.getItem('isOrganization') !== 'true' && sessionStorage.getItem('role') !== 'dept_admin' && (
                        <MenuItem 
                          icon={DollarSign} 
                          label="Pricing" 
                          to="/dashboard/pricing" 
                          isActive={isActive('/dashboard/pricing')}
                          isExpanded={isExpanded}
                        />
                      )}

                      {/* Resume Builder */}
                      {resumeEnabled[sessionStorage.getItem('role') === 'org_admin' ? 'org_admin' : (sessionStorage.getItem('type') as keyof typeof resumeEnabled)] && (
                        <MenuItem 
                          icon={FileText} 
                          label="Resume Builder" 
                          to="/dashboard/resume-builder" 
                          isActive={isActive('/dashboard/resume-builder')}
                          badge={isPaidUser ? "PRO" : undefined}
                          isExpanded={isExpanded}
                        />
                      )}

                      {/* AI Notebook */}
                      {notebookEnabled[sessionStorage.getItem('role') === 'org_admin' ? 'org_admin' : (sessionStorage.getItem('type') as keyof typeof notebookEnabled)] && (
                        <MenuItem 
                          icon={BrainCircuit} 
                          label="AI Notebook" 
                          to="/dashboard/notebook" 
                          isActive={isActive('/dashboard/notebook')}
                          badge="NEW"
                          isExpanded={isExpanded}
                        />
                      )}

                      <MenuItem 
                        icon={Briefcase} 
                        label="Interview Prep" 
                        to="/dashboard/interview-prep" 
                        isActive={isActive('/dashboard/interview-prep')}
                        isExpanded={isExpanded}
                      />

                      {!admin && (
                        <MenuItem 
                          icon={MessageSquare} 
                          label="Support" 
                          to="/dashboard/support" 
                          isActive={isActive('/dashboard/support')}
                          isExpanded={isExpanded}
                        />
                      )}

                      {!admin && (
                        <MenuItem 
                          icon={Megaphone} 
                          label="Global News" 
                          to="/dashboard/news" 
                          isActive={isActive('/dashboard/news')}
                          isExpanded={isExpanded}
                        />
                      )}
                    </>
                  )}

                  {/* Student Menu Section */}
                  {sessionStorage.getItem('role') === 'student' && (
                    <>
                      <SectionHeader title="Overview" icon={LayoutDashboard} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        to="/dashboard/student" 
                        isActive={isActive('/dashboard/student')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={User} 
                        label="My Profile" 
                        to="/dashboard/student/profile" 
                        isActive={isActive('/dashboard/student/profile')}
                        isExpanded={isExpanded}
                      />
                      
                      <SectionHeader title="Learning Tools" icon={Zap} isExpanded={isExpanded} />
                      {notebookEnabled.student && (
                        <MenuItem 
                          icon={BrainCircuit} 
                          label="AI Notebook" 
                          to="/dashboard/notebook" 
                          isActive={isActive('/dashboard/notebook')}
                          badge="NEW"
                          isExpanded={isExpanded}
                        />
                      )}
                      <MenuItem 
                        icon={Briefcase} 
                        label="Interview Prep" 
                        to="/dashboard/interview-prep" 
                        isActive={isActive('/dashboard/interview-prep')}
                        isExpanded={isExpanded}
                      />
                      {careerEnabled.student && (
                        <MenuItem 
                          icon={Award} 
                          label="Career Hub" 
                          to="/dashboard/student/career" 
                          isActive={isActive('/dashboard/student/career')}
                          isExpanded={isExpanded}
                        />
                      )}
                      
                      <SectionHeader title="Academics" icon={BookOpen} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Assignments" 
                        to="/dashboard/student/assignments" 
                        isActive={isActive('/dashboard/student/assignments')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Bell} 
                        label="Noticeboard" 
                        to="/dashboard/student/notices" 
                        isActive={isActive('/dashboard/student/notices')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Projects" 
                        to="/dashboard/student/projects" 
                        isActive={isActive('/dashboard/student/projects')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Materials" 
                        to="/dashboard/student/materials" 
                        isActive={isActive('/dashboard/student/materials')}
                        isExpanded={isExpanded}
                      />
                      
                      <SectionHeader title="Community" icon={Users} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={Menu} 
                        label="Meetings" 
                        to="/dashboard/student/meetings" 
                        isActive={isActive('/dashboard/student/meetings')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Megaphone} 
                        label="Global News" 
                        to="/dashboard/student/news" 
                        isActive={isActive('/dashboard/student/news')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={MessageSquare} 
                        label="Support Tickets" 
                        to="/dashboard/student/support-tickets" 
                        isActive={isActive('/dashboard/student/support-tickets')}
                        isExpanded={isExpanded}
                      />
                    </>
                  )}

                  {/* Admin Panel */}
                  {admin && (
                    <>
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <SectionHeader title="Administration" icon={Settings2Icon} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={Settings2Icon} 
                        label="Admin Panel" 
                        to="/admin" 
                        isActive={isActive('/admin')}
                        badge="ADMIN"
                        isExpanded={isExpanded}
                      />
                    </>
                  )}
                  
                  {/* Analytics */}
                  {isPaidUser && (
                    <MenuItem 
                      icon={BarChart3} 
                      label="Analytics" 
                      to="/dashboard/analytics" 
                      isActive={isActive('/dashboard/analytics')}
                      isExpanded={isExpanded}
                    />
                  )}

                  {/* Organization Portal */}
                  {sessionStorage.getItem('isOrganization') === 'true' && (
                    <>
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <SectionHeader title="Organization" icon={Building2} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={Building2} 
                        label="Organization Portal" 
                        to="/dashboard/org" 
                        isActive={isActive('/dashboard/org')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Building2} 
                        label="Departments" 
                        to="/dashboard/org?tab=departments" 
                        isActive={location.search === '?tab=departments'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Users} 
                        label="Students" 
                        to="/dashboard/org?tab=students" 
                        isActive={location.search === '?tab=students'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Courses" 
                        to="/dashboard/org?tab=courses" 
                        isActive={location.search === '?tab=courses'}
                        isExpanded={isExpanded}
                      />
                      {sessionStorage.getItem('role') === 'org_admin' && (
                        <MenuItem 
                          icon={Users} 
                          label="Staff" 
                          to="/dashboard/org?tab=staff" 
                          isActive={location.search === '?tab=staff'}
                          isExpanded={isExpanded}
                        />
                      )}
                      {sessionStorage.getItem('role') === 'org_admin' && (
                        <MenuItem 
                          icon={CheckCircle2} 
                          label="Approvals" 
                          to="/dashboard/org?tab=approvals" 
                          isActive={location.search === '?tab=approvals'}
                          isExpanded={isExpanded}
                        />
                      )}
                      {sessionStorage.getItem('role') === 'org_admin' && (
                        <MenuItem 
                          icon={Clock} 
                          label="Activity" 
                          to="/dashboard/org?tab=activity" 
                          isActive={location.search === '?tab=activity'}
                          isExpanded={isExpanded}
                        />
                      )}
                      <MenuItem 
                        icon={FileText} 
                        label="Assignments" 
                        to="/dashboard/org?tab=assignments" 
                        isActive={location.search === '?tab=assignments'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Video} 
                        label="Meetings" 
                        to="/dashboard/org?tab=meetings" 
                        isActive={location.search === '?tab=meetings'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Projects" 
                        to="/dashboard/org?tab=projects" 
                        isActive={location.search === '?tab=projects'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Download} 
                        label="Materials" 
                        to="/dashboard/org?tab=materials" 
                        isActive={location.search === '?tab=materials'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Bell} 
                        label="Noticeboard" 
                        to="/dashboard/org?tab=notices" 
                        isActive={location.search === '?tab=notices'}
                        isExpanded={isExpanded}
                      />
                      {careerEnabled.org_admin && (
                        <MenuItem 
                          icon={Award} 
                          label="Career & Placement" 
                          to="/dashboard/org/career" 
                          isActive={isActive('/dashboard/org/career') || location.search === '?tab=career'}
                          isExpanded={isExpanded}
                        />
                      )}
                      <MenuItem 
                        icon={MessageSquare} 
                        label="Student Tickets" 
                        to="/dashboard/org/student-tickets" 
                        isActive={isActive('/dashboard/org/student-tickets')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={BarChart3} 
                        label="KPI Reports" 
                        to="/dashboard/org/reports" 
                        isActive={isActive('/dashboard/org/reports')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={RotateCcw} 
                        label="Quiz Retakes" 
                        to="/dashboard/org/quiz-retake-requests" 
                        isActive={isActive('/dashboard/org/quiz-retake-requests')}
                        isExpanded={isExpanded}
                      />
                    </>
                  )}

                  {/* Staff/Department Admin Menu */}
                  {sessionStorage.getItem('role') === 'dept_admin' && (
                    <>
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <SectionHeader title="Staff Dashboard" icon={LayoutDashboard} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        to="/dashboard/staff" 
                        isActive={isActive('/dashboard/staff')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Interview Prep" 
                        to="/dashboard/interview-prep" 
                        isActive={isActive('/dashboard/interview-prep')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Megaphone} 
                        label="Global News" 
                        to="/dashboard/news" 
                        isActive={isActive('/dashboard/news')}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={LifeBuoy} 
                        label="Support" 
                        to="/dashboard/staff/support" 
                        isActive={isActive('/dashboard/staff/support')}
                        isExpanded={isExpanded}
                      />
                      
                      <SectionHeader title="Management" icon={Settings2Icon} isExpanded={isExpanded} />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Courses" 
                        to="/dashboard/org?tab=courses" 
                        isActive={location.search === '?tab=courses'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Users} 
                        label="Students" 
                        to="/dashboard/org?tab=students" 
                        isActive={location.search === '?tab=students'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={FileText} 
                        label="Assignments" 
                        to="/dashboard/org?tab=assignments" 
                        isActive={location.search === '?tab=assignments'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Video} 
                        label="Meetings" 
                        to="/dashboard/org?tab=meetings" 
                        isActive={location.search === '?tab=meetings'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Projects" 
                        to="/dashboard/org?tab=projects" 
                        isActive={location.search === '?tab=projects'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Download} 
                        label="Materials" 
                        to="/dashboard/org?tab=materials" 
                        isActive={location.search === '?tab=materials'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={Bell} 
                        label="Noticeboard" 
                        to="/dashboard/org?tab=notices" 
                        isActive={location.search === '?tab=notices'}
                        isExpanded={isExpanded}
                      />
                      <MenuItem 
                        icon={RotateCcw} 
                        label="Quiz Retakes" 
                        to="/dashboard/org/quiz-retake-requests" 
                        isActive={isActive('/dashboard/org/quiz-retake-requests')}
                        isExpanded={isExpanded}
                      />
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Generate Course Button */}
            {sessionStorage.getItem('role') !== 'student' && (
              <SidebarGroup className="mt-4">
                <SidebarGroupContent>
                  <div className={cn("px-2", isExpanded && "px-3")}>
                    <Button
                      onClick={handleGenerateClick}
                      className={cn(
                        "w-full bg-gradient-to-r from-primary via-primary/90 to-indigo-500 hover:from-indigo-500 hover:via-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl group",
                        !isExpanded && "p-2"
                      )}
                      size={isExpanded ? "default" : "icon"}
                    >
                      <Sparkles className={cn(
                        "transition-transform",
                        isExpanded ? "mr-2 h-4 w-4 group-hover:rotate-12" : "h-5 w-5"
                      )} />
                      {isExpanded && <span className="font-semibold">Generate Course</span>}
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="border-t border-border/40 bg-gradient-to-b from-background to-muted/5">
            {/* Action Buttons */}
            <div className={cn(
              "grid gap-2 px-2",
              isExpanded ? "grid-cols-1" : "grid-cols-1"
            )}>
              {/* Install App Button */}
              {installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className={cn(
                    "group relative overflow-hidden rounded-xl transition-all duration-300 w-full",
                    "hover:shadow-md active:scale-[0.98]",
                    isExpanded ? "p-2" : "p-2.5"
                  )}
                >
                  <div className={cn(
                    "flex items-center",
                    isExpanded ? "gap-3" : "justify-center"
                  )}>
                    <div className="rounded-lg p-1.5 transition-all duration-300">
                      <DownloadIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    {isExpanded && (
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Install App</p>
                        <p className="text-xs text-muted-foreground">Desktop experience</p>
                      </div>
                    )}
                  </div>
                </button>
              )}

              {/* Theme Toggle Button */}
              <ThemeToggleButton isExpanded={isExpanded} />

              {/* Logout Button */}
              <button
                onClick={Logout}
                className={cn(
                  "group relative overflow-hidden rounded-xl transition-all duration-300 w-full",
                  "hover:shadow-md active:scale-[0.98]",
                  isExpanded ? "p-2" : "p-2.5"
                )}
              >
                <div className={cn(
                  "flex items-center",
                  isExpanded ? "gap-3" : "justify-center"
                )}>
                  <div className="rounded-lg p-1.5 transition-all duration-300">
                    <LogOut className="h-5 w-5 text-red-500" />
                  </div>
                  {isExpanded && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Logout</p>
                      <p className="text-xs text-muted-foreground">Sign out</p>
                    </div>
                  )}
                </div>
              </button>
            </div>

       
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center mb-6 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
              <SidebarTrigger className="mr-2">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                {appName}
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
                <ThemeToggleButton  />
              </div>
            </div>
          )}
          
          {/* Desktop Header */}
          {!isMobile && (location.pathname.startsWith("/dashboard/org") || location.pathname.startsWith("/dashboard/student")) && (
            <div className="absolute top-4 right-8 z-10 flex items-center gap-4">
              <NotificationBell />
            </div>
          )}
          
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
