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
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Zap,
  Sun,
  Moon,
  Laptop
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

// Menu Item Component - Removed icon background colors
const MenuItem = ({ icon: Icon, label, to, isActive, badge, onClick, className }: any) => (
  <SidebarMenuItem>
    <SidebarMenuButton 
      asChild 
      tooltip={label}
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
          "flex items-center gap-3 transition-all duration-300",
          !isActive && "group-hover:translate-x-1"
        )}>
          {/* Icon without any background color */}
          <div className="rounded-lg p-1.5 transition-all duration-300">
            <Icon className={cn(
              "h-5 w-5 transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )} />
          </div>
          <span className={cn(
            "font-medium",
            isActive ? "text-primary" : "text-foreground"
          )}>{label}</span>
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
        </div>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

// Section Header Component
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

// Custom Theme Toggle Button Component - Removed background color
const ThemeToggleButton = ({ isExpanded, theme, toggleTheme }: any) => {
  const getThemeIcon = () => {
    switch(theme) {
      case 'light':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'dark':
        return <Moon className="h-5 w-5 text-blue-400" />;
      default:
        return <Laptop className="h-5 w-5 text-purple-500" />;
    }
  };

  const getThemeLabel = () => {
    switch(theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      default:
        return 'System Theme';
    }
  };

  const getThemeDescription = () => {
    switch(theme) {
      case 'light':
        return 'Bright and clean';
      case 'dark':
        return 'Easy on eyes';
      default:
        return 'Follows system';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative overflow-hidden rounded-xl transition-all duration-300",
        "hover:shadow-md active:scale-[0.98]",
        isExpanded ? "p-2" : "p-2.5"
      )}
    >
      <div className={cn(
        "flex items-center gap-3",
        !isExpanded && "justify-center"
      )}>
        {/* Icon without background color */}
        <div className="rounded-lg p-1.5 transition-all duration-300">
          {getThemeIcon()}
        </div>
        {isExpanded && (
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{getThemeLabel()}</p>
            <p className="text-xs text-muted-foreground">{getThemeDescription()}</p>
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar
  
  const plan = sessionStorage.getItem("type")?.toLowerCase()?.trim();
  const role = sessionStorage.getItem("role");
  const isPaidUser = ["monthly", "yearly"].includes(plan) || admin;

  const [installPrompt, setInstallPrompt] = useState(null);
  const { toast } = useToast();
  
  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;
 
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function
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
  const isExpanded = (!isCollapsed || hovered) && !isMobile;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          className={cn(
            "border-r border-border/40 bg-card/95 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out z-50",
            isMobile ? (
              sidebarOpen ? "fixed left-0 top-0 h-full w-[260px]" : "fixed -left-full top-0 h-full w-[260px]"
            ) : (
              isCollapsed && !hovered ? "w-[70px]" : "w-[260px]"
            )
          )}
          onMouseEnter={() => !isMobile && setHovered(true)}
          onMouseLeave={() => !isMobile && setHovered(false)}
        >
          {/* Header with Collapse Toggle */}
          <SidebarHeader className="border-b border-border/40 py-4 px-3">
            <div className="flex items-center justify-between">
              <Link 
                to="/dashboard" 
                className={cn(
                  "flex items-center space-x-3 group relative transition-all duration-300",
                  !isMobile && isCollapsed && !hovered && "justify-center w-full"
                )}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                    <img src={appLogo} alt="Logo" className='h-5 w-5' />
                  </div>
                </div>
                {(isExpanded || isMobile) && (
                  <span className="font-display text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent group-hover:scale-105 transition-transform whitespace-nowrap">
                    {appName}
                  </span>
                )}
              </Link>
              
              {/* Collapse Toggle Button - Desktop only */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-muted/50 transition-all"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed && !hovered ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {/* Close button for mobile */}
              {isMobile && sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-muted/50 transition-all"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
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
                      />
                      <MenuItem 
                        icon={User} 
                        label="My Profile" 
                        to="/dashboard/profile" 
                        isActive={isActive('/dashboard/profile')}
                      />
                      
                      {sessionStorage.getItem('isOrganization') !== 'true' && sessionStorage.getItem('role') !== 'dept_admin' && (
                        <MenuItem 
                          icon={DollarSign} 
                          label="Pricing" 
                          to="/dashboard/pricing" 
                          isActive={isActive('/dashboard/pricing')}
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
                        />
                      )}

                      <MenuItem 
                        icon={Briefcase} 
                        label="Interview Prep" 
                        to="/dashboard/interview-prep" 
                        isActive={isActive('/dashboard/interview-prep')}
                      />

                      {!admin && (
                        <MenuItem 
                          icon={MessageSquare} 
                          label="Support" 
                          to="/dashboard/support" 
                          isActive={isActive('/dashboard/support')}
                        />
                      )}

                      {!admin && (
                        <MenuItem 
                          icon={Megaphone} 
                          label="Global News" 
                          to="/dashboard/news" 
                          isActive={isActive('/dashboard/news')}
                        />
                      )}
                    </>
                  )}

                  {/* Student Menu Section */}
                  {sessionStorage.getItem('role') === 'student' && (
                    <>
                      <SectionHeader title="Overview" icon={LayoutDashboard} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        to="/dashboard/student" 
                        isActive={isActive('/dashboard/student')}
                      />
                      <MenuItem 
                        icon={User} 
                        label="My Profile" 
                        to="/dashboard/profile" 
                        isActive={isActive('/dashboard/profile')}
                      />
                      
                      <SectionHeader title="Learning Tools" icon={Zap} isExpanded={isExpanded || isMobile} />
                      {notebookEnabled.student && (
                        <MenuItem 
                          icon={BrainCircuit} 
                          label="AI Notebook" 
                          to="/dashboard/notebook" 
                          isActive={isActive('/dashboard/notebook')}
                          badge="NEW"
                        />
                      )}
                      <MenuItem 
                        icon={Briefcase} 
                        label="Interview Prep" 
                        to="/dashboard/interview-prep" 
                        isActive={isActive('/dashboard/interview-prep')}
                      />
                      {careerEnabled.student && (
                        <MenuItem 
                          icon={Award} 
                          label="Career Hub" 
                          to="/dashboard/student/career" 
                          isActive={isActive('/dashboard/student/career')}
                        />
                      )}
                      
                      <SectionHeader title="Academics" icon={BookOpen} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Assignments" 
                        to="/dashboard/student/assignments" 
                        isActive={isActive('/dashboard/student/assignments')}
                      />
                      <MenuItem 
                        icon={Bell} 
                        label="Noticeboard" 
                        to="/dashboard/student/notices" 
                        isActive={isActive('/dashboard/student/notices')}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Projects" 
                        to="/dashboard/student/projects" 
                        isActive={isActive('/dashboard/student/projects')}
                      />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Materials" 
                        to="/dashboard/student/materials" 
                        isActive={isActive('/dashboard/student/materials')}
                      />
                      
                      <SectionHeader title="Community" icon={Users} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={Menu} 
                        label="Meetings" 
                        to="/dashboard/student/meetings" 
                        isActive={isActive('/dashboard/student/meetings')}
                      />
                      <MenuItem 
                        icon={Megaphone} 
                        label="Global News" 
                        to="/dashboard/student/news" 
                        isActive={isActive('/dashboard/student/news')}
                      />
                      <MenuItem 
                        icon={MessageSquare} 
                        label="Support Tickets" 
                        to="/dashboard/student/support-tickets" 
                        isActive={isActive('/dashboard/student/support-tickets')}
                      />
                    </>
                  )}

                  {/* Admin Panel - Hide when collapsed */}
                  {admin && (isExpanded || isMobile) && (
                    <>
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <SectionHeader title="Administration" icon={Settings2Icon} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={Settings2Icon} 
                        label="Admin Panel" 
                        to="/admin" 
                        isActive={isActive('/admin')}
                        badge="ADMIN"
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
                    />
                  )}

                  {/* Organization Portal */}
                  {sessionStorage.getItem('isOrganization') === 'true' && (
                    <>
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <SectionHeader title="Organization" icon={Building2} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={Building2} 
                        label="Organization Portal" 
                        to="/dashboard/org" 
                        isActive={isActive('/dashboard/org')}
                      />
                      <MenuItem 
                        icon={Building2} 
                        label="Departments" 
                        to="/dashboard/org?tab=departments" 
                        isActive={location.search === '?tab=departments'}
                      />
                      <MenuItem 
                        icon={Users} 
                        label="Students" 
                        to="/dashboard/org?tab=students" 
                        isActive={location.search === '?tab=students'}
                      />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Courses" 
                        to="/dashboard/org?tab=courses" 
                        isActive={location.search === '?tab=courses'}
                      />
                      <MenuItem 
                        icon={FileText} 
                        label="Assignments" 
                        to="/dashboard/org?tab=assignments" 
                        isActive={location.search === '?tab=assignments'}
                      />
                      <MenuItem 
                        icon={Video} 
                        label="Meetings" 
                        to="/dashboard/org?tab=meetings" 
                        isActive={location.search === '?tab=meetings'}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Projects" 
                        to="/dashboard/org?tab=projects" 
                        isActive={location.search === '?tab=projects'}
                      />
                      <MenuItem 
                        icon={Download} 
                        label="Materials" 
                        to="/dashboard/org?tab=materials" 
                        isActive={location.search === '?tab=materials'}
                      />
                      <MenuItem 
                        icon={Bell} 
                        label="Noticeboard" 
                        to="/dashboard/org?tab=notices" 
                        isActive={location.search === '?tab=notices'}
                      />
                      {careerEnabled.org_admin && (
                        <MenuItem 
                          icon={Award} 
                          label="Career & Placement" 
                          to="/dashboard/org/career" 
                          isActive={isActive('/dashboard/org/career') || location.search === '?tab=career'}
                        />
                      )}
                      <MenuItem 
                        icon={MessageSquare} 
                        label="Student Tickets" 
                        to="/dashboard/org/student-tickets" 
                        isActive={isActive('/dashboard/org/student-tickets')}
                      />
                      <MenuItem 
                        icon={BarChart3} 
                        label="KPI Reports" 
                        to="/dashboard/org/reports" 
                        isActive={isActive('/dashboard/org/reports')}
                      />
                    </>
                  )}

                  {/* Staff/Department Admin Menu */}
                  {sessionStorage.getItem('role') === 'dept_admin' && (
                    <>
                      <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <SectionHeader title="Staff Dashboard" icon={LayoutDashboard} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        to="/dashboard/staff" 
                        isActive={isActive('/dashboard/staff')}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Interview Prep" 
                        to="/dashboard/interview-prep" 
                        isActive={isActive('/dashboard/interview-prep')}
                      />
                      <MenuItem 
                        icon={Megaphone} 
                        label="Global News" 
                        to="/dashboard/news" 
                        isActive={isActive('/dashboard/news')}
                      />
                      <MenuItem 
                        icon={LifeBuoy} 
                        label="Support" 
                        to="/dashboard/staff/support" 
                        isActive={isActive('/dashboard/staff/support')}
                      />
                      
                      <SectionHeader title="Management" icon={Settings2Icon} isExpanded={isExpanded || isMobile} />
                      <MenuItem 
                        icon={BookOpen} 
                        label="Courses" 
                        to="/dashboard/org?tab=courses" 
                        isActive={location.search === '?tab=courses'}
                      />
                      <MenuItem 
                        icon={Users} 
                        label="Students" 
                        to="/dashboard/org?tab=students" 
                        isActive={location.search === '?tab=students'}
                      />
                      <MenuItem 
                        icon={FileText} 
                        label="Assignments" 
                        to="/dashboard/org?tab=assignments" 
                        isActive={location.search === '?tab=assignments'}
                      />
                      <MenuItem 
                        icon={Video} 
                        label="Meetings" 
                        to="/dashboard/org?tab=meetings" 
                        isActive={location.search === '?tab=meetings'}
                      />
                      <MenuItem 
                        icon={Briefcase} 
                        label="Projects" 
                        to="/dashboard/org?tab=projects" 
                        isActive={location.search === '?tab=projects'}
                      />
                      <MenuItem 
                        icon={Download} 
                        label="Materials" 
                        to="/dashboard/org?tab=materials" 
                        isActive={location.search === '?tab=materials'}
                      />
                      <MenuItem 
                        icon={Bell} 
                        label="Noticeboard" 
                        to="/dashboard/org?tab=notices" 
                        isActive={location.search === '?tab=notices'}
                      />
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Generate Course Button */}
            {sessionStorage.getItem('role') !== 'student' && (isExpanded || isMobile) && (
              <SidebarGroup className="mt-4">
                <SidebarGroupContent>
                  <div className="px-3">
                    <Button
                      onClick={handleGenerateClick}
                      className="w-full bg-gradient-to-r from-primary via-primary/90 to-indigo-500 hover:from-indigo-500 hover:via-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl group"
                      size="default"
                    >
                      <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                      <span className="font-semibold">Generate Course</span>
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Compact Generate Button for Collapsed State - Desktop only */}
            {!isMobile && sessionStorage.getItem('role') !== 'student' && !isExpanded && (
              <SidebarGroup className="mt-4">
                <SidebarGroupContent>
                  <div className="px-2">
                    <Button
                      onClick={handleGenerateClick}
                      className="w-full bg-gradient-to-r from-primary to-indigo-500 rounded-xl p-2"
                      size="icon"
                    >
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="border-t border-border/40 bg-gradient-to-b from-background to-muted/5">
            <div className={cn(
              "grid gap-2 px-2",
              (isExpanded || isMobile) ? "grid-cols-1" : "grid-cols-1"
            )}>
              {/* Install App Button - Removed background color */}
              {installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className={cn(
                    "group relative overflow-hidden rounded-xl transition-all duration-300",
                    "hover:shadow-md active:scale-[0.98]",
                    (isExpanded || isMobile) ? "p-2" : "p-2.5"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-3",
                    !(isExpanded || isMobile) && "justify-center"
                  )}>
                    <div className="rounded-lg p-1.5 transition-all duration-300">
                      <DownloadIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    {(isExpanded || isMobile) && (
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Install App</p>
                        <p className="text-xs text-muted-foreground">Desktop experience</p>
                      </div>
                    )}
                  </div>
                </button>
              )}

              {/* Theme Toggle Button - Using custom component */}
              <ThemeToggleButton 
                isExpanded={isExpanded || isMobile} 
                theme={theme} 
                toggleTheme={toggleTheme} 
              />

              {/* Logout Button - Removed background color */}
              <button
                onClick={Logout}
                className={cn(
                  "group relative overflow-hidden rounded-xl transition-all duration-300",
                  "hover:shadow-md active:scale-[0.98]",
                  (isExpanded || isMobile) ? "p-2" : "p-2.5"
                )}
              >
                <div className={cn(
                  "flex items-center gap-3",
                  !(isExpanded || isMobile) && "justify-center"
                )}>
                  <div className="rounded-lg p-1.5 transition-all duration-300">
                    <LogOut className="h-5 w-5 text-red-500" />
                  </div>
                  {(isExpanded || isMobile) && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Logout</p>
                      <p className="text-xs text-muted-foreground">Sign out</p>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Version Info */}
            {(isExpanded || isMobile) && (
              <div className="px-3 pt-3 mt-2 text-center">
                <p className="text-[10px] text-muted-foreground">
                  Version 2.0.0 • © 2024
                </p>
              </div>
            )}
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center mb-6 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm sticky top-0 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                {appName}
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
                {/* Mobile theme button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                >
                  {theme === 'light' && <Sun className="h-5 w-5 text-yellow-500" />}
                  {theme === 'dark' && <Moon className="h-5 w-5 text-blue-400" />}
                  {theme === 'system' && <Laptop className="h-5 w-5 text-purple-500" />}
                </button>
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