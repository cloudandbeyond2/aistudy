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
  SidebarTrigger,
  useSidebar
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
  ListTodo,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { appWordmarkLight, websiteURL, serverURL } from '@/constants';
import { useBranding } from '@/contexts/BrandingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import Swal from 'sweetalert2';
import NotificationBell from '../NotificationBell';

const combineDateAndTime = (dateValue?: string, timeValue?: string) => {
  if (!dateValue || !timeValue) return null;

  const baseDate = new Date(dateValue);
  if (Number.isNaN(baseDate.getTime())) return null;

  const [hours, minutes] = timeValue.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const parsed = new Date(baseDate);
  parsed.setHours(hours, minutes, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Menu Item Component - Text hides when collapsed
const MenuItem = ({ icon: Icon, label, to, isActive, badge, onClick, className, isExpanded, onMobileClick }: any) => (
  <SidebarMenuItem>
    <SidebarMenuButton 
      asChild 
      tooltip={!isExpanded ? label : undefined}
      isActive={isActive}
      onClick={(e) => {
        if (onClick) onClick(e);
        if (onMobileClick) onMobileClick();
      }}
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


// Inner component that uses useSidebar hook
const DashboardLayoutContent = () => {
  const { appName } = useBranding();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [admin, setAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Get sidebar context to control mobile sidebar - now this is inside SidebarProvider
  const { setOpenMobile } = useSidebar();
  
  const plan = sessionStorage.getItem("type")?.toLowerCase()?.trim();
  const role = sessionStorage.getItem("role");
  const isPaidUser = ["monthly", "yearly"].includes(plan) || admin;

  const [installPrompt, setInstallPrompt] = useState(null);
  const { toast } = useToast();
  const uid = sessionStorage.getItem('uid') || '';
  
  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;
  
  // Function to close sidebar on mobile when menu item is clicked
  const handleMobileMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
 
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

  useEffect(() => {
    if (!uid || typeof window === 'undefined') return undefined;

    let cancelled = false;
    let refreshTimer: number | undefined;
    let reminderTimers: number[] = [];

    const clearReminderTimers = () => {
      reminderTimers.forEach((timer) => window.clearTimeout(timer));
      reminderTimers = [];
    };

    const showReminder = (event: any) => {
      if (!event?._id) return;

      const reminderKey = `schedule-reminder:${uid}:${event._id}:${event.date}:${event.startTime}`;
      if (sessionStorage.getItem(reminderKey)) return;

      sessionStorage.setItem(reminderKey, 'shown');

      void Swal.fire({
        icon: 'info',
        title: 'Upcoming event',
        html: `
          <div style="text-align:left;color:#0f172a;">
            <div style="border:1px solid rgba(148,163,184,0.2);border-radius:20px;padding:18px 18px 16px;background:linear-gradient(180deg,#f8fbff 0%,#eef6ff 100%);box-shadow:0 18px 45px -28px rgba(37,99,235,0.35);">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:rgba(37,99,235,0.1);color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                Calendar Reminder
              </div>
              <h3 style="margin:14px 0 6px;font-size:22px;line-height:1.2;font-weight:800;color:#020617;">${event.name}</h3>
              <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">This event starts in 5 minutes. Here is your quick agenda snapshot.</p>
              <div style="display:grid;gap:10px;">
                <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:14px;background:white;border:1px solid rgba(226,232,240,0.95);">
                  <span style="color:#64748b;font-size:13px;font-weight:600;">Time</span>
                  <span style="color:#0f172a;font-size:13px;font-weight:700;">${event.startTime} - ${event.endTime}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:14px;background:white;border:1px solid rgba(226,232,240,0.95);">
                  <span style="color:#64748b;font-size:13px;font-weight:600;">Type</span>
                  <span style="color:#0f172a;font-size:13px;font-weight:700;">${event.type}</span>
                </div>
                ${event.room ? `
                  <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:14px;background:white;border:1px solid rgba(226,232,240,0.95);">
                    <span style="color:#64748b;font-size:13px;font-weight:600;">Room</span>
                    <span style="color:#0f172a;font-size:13px;font-weight:700;">${event.room}</span>
                  </div>
                ` : ''}
                ${event.location ? `
                  <div style="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:14px;background:white;border:1px solid rgba(226,232,240,0.95);">
                    <span style="color:#64748b;font-size:13px;font-weight:600;">Location</span>
                    <span style="color:#0f172a;font-size:13px;font-weight:700;">${event.location}</span>
                  </div>
                ` : ''}
                ${event.description ? `
                  <div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.75);border:1px solid rgba(226,232,240,0.95);">
                    <div style="margin-bottom:6px;color:#64748b;font-size:13px;font-weight:600;">Notes</div>
                    <div style="color:#334155;font-size:13px;line-height:1.6;">${event.description}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `,
        confirmButtonText: 'Got it',
        buttonsStyling: false,
        customClass: {
          popup: 'w-[min(92vw,32rem)] rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.45)]',
          title: 'px-4 pt-4 text-left text-2xl font-semibold tracking-tight text-slate-950',
          htmlContainer: 'px-4 pb-2',
          confirmButton: 'mt-2 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-600 hover:to-cyan-500 focus:outline-none',
          icon: 'border-0 text-cyan-500',
        },
      });
    };

    const syncScheduleReminders = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/schedule`, {
          params: { ownerId: uid || undefined },
        });

        if (cancelled) return;

        const events = Array.isArray(res.data?.data) ? res.data.data : [];
        clearReminderTimers();

        const now = Date.now();

        events.forEach((event: any) => {
          if (!event?._id || event.status === 'done') return;

          const eventStart = combineDateAndTime(event.date, event.startTime);
          if (!eventStart) return;

          const eventEnd = combineDateAndTime(event.date, event.endTime || event.startTime)?.getTime() ?? eventStart.getTime();
          if (eventEnd <= now) return;

          const reminderAt = eventStart.getTime() - 5 * 60 * 1000;
          const delay = reminderAt - now;

          if (delay <= 0) {
            if (eventStart.getTime() > now) {
              showReminder(event);
            }
            return;
          }

          reminderTimers.push(window.setTimeout(() => showReminder(event), delay));
        });
      } catch (error) {
        console.error('schedule reminder sync error', error);
      }
    };

    void syncScheduleReminders();
    refreshTimer = window.setInterval(syncScheduleReminders, 60 * 1000);

    return () => {
      cancelled = true;
      clearReminderTimers();
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, [uid, location.pathname]);

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
              onClick={handleMobileMenuClick}
              className={cn(
                "flex items-center space-x-3 group relative transition-all duration-300",
                !isExpanded && "justify-center w-full"
              )}
            >
              <img src={appWordmarkLight} alt={appName} className={cn("w-auto transition-transform duration-300 group-hover:scale-105", isExpanded ? "h-8 max-w-[160px]" : "h-7 max-w-[44px]")} />
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

        <SidebarContent className="thin-scrollbar py-4">
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
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={User} 
                      label="My Profile" 
                      to="/dashboard/profile" 
                      isActive={isActive('/dashboard/profile')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    
                    {sessionStorage.getItem('isOrganization') !== 'true' && sessionStorage.getItem('role') !== 'dept_admin' && (
                      <MenuItem 
                        icon={DollarSign} 
                        label="Pricing" 
                        to="/dashboard/pricing" 
                        isActive={isActive('/dashboard/pricing')}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
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
                        onMobileClick={handleMobileMenuClick}
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
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}

                    <MenuItem 
                      icon={Briefcase} 
                      label="Interview Prep" 
                      to="/dashboard/interview-prep" 
                      isActive={isActive('/dashboard/interview-prep')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Calendar} 
                      label="Calendar Scheduler" 
                      to="/dashboard/calendar" 
                      isActive={isActive('/dashboard/calendar')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={ListTodo} 
                      label="Todo Center" 
                      to="/dashboard/todo" 
                      isActive={isActive('/dashboard/todo')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />

                    {!admin && (
                      <MenuItem 
                        icon={MessageSquare} 
                        label="Support" 
                        to="/dashboard/support" 
                        isActive={isActive('/dashboard/support')}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}

                    {!admin && (
                      <MenuItem 
                        icon={Megaphone} 
                        label="Global News" 
                        to="/dashboard/news" 
                        isActive={isActive('/dashboard/news')}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
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
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={User} 
                      label="My Profile" 
                      to="/dashboard/student/profile" 
                      isActive={isActive('/dashboard/student/profile')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
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
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}
                    <MenuItem 
                      icon={Briefcase} 
                      label="Interview Prep" 
                      to="/dashboard/interview-prep" 
                      isActive={isActive('/dashboard/interview-prep')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Calendar} 
                      label="Calendar Scheduler" 
                      to="/dashboard/calendar" 
                      isActive={isActive('/dashboard/calendar')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={ListTodo} 
                      label="Todo Center" 
                      to="/dashboard/todo" 
                      isActive={isActive('/dashboard/todo')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    {careerEnabled.student && (
                      <MenuItem 
                        icon={Award} 
                        label="Career Hub" 
                        to="/dashboard/student/career" 
                        isActive={isActive('/dashboard/student/career')}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}
                    
                    <SectionHeader title="Academics" icon={BookOpen} isExpanded={isExpanded} />
                    <MenuItem 
                      icon={BookOpen} 
                      label="Assignments" 
                      to="/dashboard/student/assignments" 
                      isActive={isActive('/dashboard/student/assignments')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Bell} 
                      label="Noticeboard" 
                      to="/dashboard/student/notices" 
                      isActive={isActive('/dashboard/student/notices')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Briefcase} 
                      label="Projects" 
                      to="/dashboard/student/projects" 
                      isActive={isActive('/dashboard/student/projects')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={BookOpen} 
                      label="Materials" 
                      to="/dashboard/student/materials" 
                      isActive={isActive('/dashboard/student/materials')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    
                    <SectionHeader title="Community" icon={Users} isExpanded={isExpanded} />
                    <MenuItem 
                      icon={Menu} 
                      label="Meetings" 
                      to="/dashboard/student/meetings" 
                      isActive={isActive('/dashboard/student/meetings')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Megaphone} 
                      label="Global News" 
                      to="/dashboard/student/news" 
                      isActive={isActive('/dashboard/student/news')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={MessageSquare} 
                      label="Support Tickets" 
                      to="/dashboard/student/support-tickets" 
                      isActive={isActive('/dashboard/student/support-tickets')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
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
                      onMobileClick={handleMobileMenuClick}
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
                    onMobileClick={handleMobileMenuClick}
                  />
                )}

                {/* Organization Portal */}
                {sessionStorage.getItem('isOrganization') === 'true' && (
                  <>
                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <SectionHeader title="Organization" icon={Building2} isExpanded={isExpanded} />
                    {/* <MenuItem 
                      icon={Building2} 
                      label="Organization Portal" 
                      to="/dashboard/org" 
                      isActive={isActive('/dashboard/org')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Calendar} 
                      label="Calendar Scheduler" 
                      to="/dashboard/calendar" 
                      isActive={isActive('/dashboard/calendar')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    /> */}
                    <MenuItem 
                      icon={Building2} 
                      label="Departments" 
                      to="/dashboard/org?tab=departments" 
                      isActive={location.search === '?tab=departments'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Users} 
                      label="Students" 
                      to="/dashboard/org?tab=students" 
                      isActive={location.search === '?tab=students'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={BookOpen} 
                      label="Courses" 
                      to="/dashboard/org?tab=courses" 
                      isActive={location.search === '?tab=courses'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    {sessionStorage.getItem('role') === 'org_admin' && (
                      <MenuItem 
                        icon={Users} 
                        label="Staff" 
                        to="/dashboard/org?tab=staff" 
                        isActive={location.search === '?tab=staff'}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}
                    {sessionStorage.getItem('role') === 'org_admin' && (
                      <MenuItem 
                        icon={CheckCircle2} 
                        label="Approvals" 
                        to="/dashboard/org?tab=approvals" 
                        isActive={location.search === '?tab=approvals'}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}
                    {sessionStorage.getItem('role') === 'org_admin' && (
                      <MenuItem 
                        icon={Clock} 
                        label="Activity" 
                        to="/dashboard/org?tab=activity" 
                        isActive={location.search === '?tab=activity'}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}
                    <MenuItem 
                      icon={FileText} 
                      label="Assignments" 
                      to="/dashboard/org?tab=assignments" 
                      isActive={location.search === '?tab=assignments'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Video} 
                      label="Meetings" 
                      to="/dashboard/org?tab=meetings" 
                      isActive={location.search === '?tab=meetings'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Briefcase} 
                      label="Projects" 
                      to="/dashboard/org?tab=projects" 
                      isActive={location.search === '?tab=projects'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Download} 
                      label="Materials" 
                      to="/dashboard/org?tab=materials" 
                      isActive={location.search === '?tab=materials'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Bell} 
                      label="Noticeboard" 
                      to="/dashboard/org?tab=notices" 
                      isActive={location.search === '?tab=notices'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    {careerEnabled.org_admin && (
                      <MenuItem 
                        icon={Award} 
                        label="Career & Placement" 
                        to="/dashboard/org/career" 
                        isActive={isActive('/dashboard/org/career') || location.search === '?tab=career'}
                        isExpanded={isExpanded}
                        onMobileClick={handleMobileMenuClick}
                      />
                    )}
                    <MenuItem 
                      icon={MessageSquare} 
                      label="Student Tickets" 
                      to="/dashboard/org/student-tickets" 
                      isActive={isActive('/dashboard/org/student-tickets')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={BarChart3} 
                      label="KPI Reports" 
                      to="/dashboard/org/reports" 
                      isActive={isActive('/dashboard/org/reports')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={RotateCcw} 
                      label="Quiz Retakes" 
                      to="/dashboard/org/quiz-retake-requests" 
                      isActive={isActive('/dashboard/org/quiz-retake-requests')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                  </>
                )}

                {/* Staff/Department Admin Menu */}
                {sessionStorage.getItem('role') === 'dept_admin' && (
                  <>
                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <SectionHeader title="My Work" icon={LayoutDashboard} isExpanded={isExpanded} />
                    <MenuItem 
                      icon={LayoutDashboard} 
                      label="Workboard" 
                      to="/dashboard/staff" 
                      isActive={isActive('/dashboard/staff')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Briefcase} 
                      label="Interview Prep" 
                      to="/dashboard/interview-prep" 
                      isActive={isActive('/dashboard/interview-prep')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Calendar} 
                      label="Calendar Scheduler" 
                      to="/dashboard/calendar" 
                      isActive={isActive('/dashboard/calendar')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={ListTodo} 
                      label="Todo Center" 
                      to="/dashboard/todo" 
                      isActive={isActive('/dashboard/todo')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Megaphone} 
                      label="Global News" 
                      to="/dashboard/news" 
                      isActive={isActive('/dashboard/news')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={LifeBuoy} 
                      label="Support Desk" 
                      to="/dashboard/staff/support" 
                      isActive={isActive('/dashboard/staff/support')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    
                    <SectionHeader title="Teaching Ops" icon={Settings2Icon} isExpanded={isExpanded} />
                    <MenuItem 
                      icon={BookOpen} 
                      label="Course Workspace" 
                      to="/dashboard/org?tab=courses" 
                      isActive={location.search === '?tab=courses'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Users} 
                      label="Learner Directory" 
                      to="/dashboard/org?tab=students" 
                      isActive={location.search === '?tab=students'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={FileText} 
                      label="Assessment Desk" 
                      to="/dashboard/org?tab=assignments" 
                      isActive={location.search === '?tab=assignments'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Video} 
                      label="Sessions" 
                      to="/dashboard/org?tab=meetings" 
                      isActive={location.search === '?tab=meetings'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Briefcase} 
                      label="Projects & Labs" 
                      to="/dashboard/org?tab=projects" 
                      isActive={location.search === '?tab=projects'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Download} 
                      label="Resource Library" 
                      to="/dashboard/org?tab=materials" 
                      isActive={location.search === '?tab=materials'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={Bell} 
                      label="Announcements" 
                      to="/dashboard/org?tab=notices" 
                      isActive={location.search === '?tab=notices'}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
                    />
                    <MenuItem 
                      icon={RotateCcw} 
                      label="Retake Queue" 
                      to="/dashboard/org/quiz-retake-requests" 
                      isActive={isActive('/dashboard/org/quiz-retake-requests')}
                      isExpanded={isExpanded}
                      onMobileClick={handleMobileMenuClick}
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
                    onClick={() => {
                      handleGenerateClick();
                      handleMobileMenuClick();
                    }}
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
        {/* Footer */}
<SidebarFooter className="border-t border-white/5 bg-transparent p-0">
  {/* User Profile Card */}
  <div className={cn(
    "group relative flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out",
    "bg-white/[0.03] border border-white/10 hover:border-white/20",
    isExpanded ? "m-2 mb-0 rounded-2xl p-2" : "m-1 rounded-xl p-2 justify-center"
  )}>
    {/* Animated background glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Avatar Section */}
    <div className="relative flex-shrink-0">
      <div className={cn(
        "relative z-10 flex items-center justify-center rounded-xl font-bold text-white shadow-lg transition-all duration-300",
        "bg-gradient-to-tr from-primary to-indigo-600 ring-2 ring-white/10 group-hover:ring-primary/40",
        isExpanded ? "h-10 w-10 text-sm" : "h-9 w-9 text-xs"
      )}>
        {(sessionStorage.getItem('mName') || 'L').charAt(0).toUpperCase()}
      </div>
      {/* Pulse Status Indicator */}
      <span className="absolute -bottom-0.5 -right-0.5 z-20 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0f172a]"></span>
      </span>
    </div>

    {/* User Metadata */}
    {isExpanded && (
      <div className="flex-1 min-w-0 z-10 animate-in fade-in slide-in-from-left-2 duration-300">
        <p className="text-sm font-semibold text-slate-100 truncate tracking-tight">
          {sessionStorage.getItem('mName') || 'Learner'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
            sessionStorage.getItem('role') === 'org_admin' && "bg-violet-500/10 text-violet-400 border-violet-500/20",
            sessionStorage.getItem('role') === 'dept_admin' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
            sessionStorage.getItem('role') === 'student' && "bg-teal-500/10 text-teal-400 border-teal-500/20",
            !['org_admin', 'dept_admin', 'student'].includes(sessionStorage.getItem('role') || '') && "bg-slate-500/10 text-slate-400 border-slate-500/20"
          )}>
            {sessionStorage.getItem('role')?.replace('_', ' ') || 'User'}
          </span>
        </div>
      </div>
    )}

    {/* Contextual Action */}
    {isExpanded && (
      <Link
        to="/dashboard/profile"
        onClick={handleMobileMenuClick}
        className="relative z-10 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Settings2Icon className="h-4 w-4" />
      </Link>
    )}
  </div>

  {/* Action Navigation */}
  <div className="mt-2 space-y-1 px-2">
    {/* Install Button */}
    {installPrompt && (
      <button
        onClick={() => { handleInstallClick(); handleMobileMenuClick(); }}
        className={cn(
          "group flex items-center w-full gap-3 rounded-xl transition-all duration-200",
          "hover:bg-blue-500/10 text-slate-400 hover:text-blue-400",
          isExpanded ? "p-2.5" : "p-3 justify-center"
        )}
      >
        <DownloadIcon className={cn("h-5 w-5 transition-transform group-hover:-translate-y-0.5", !isExpanded && "h-6 w-6")} />
        {isExpanded && (
          <div className="text-left">
            <p className="text-sm font-medium leading-none">Install App</p>
            <p className="text-[11px] opacity-60 mt-1">Desktop experience</p>
          </div>
        )}
      </button>
    )}

    {/* Logout Button */}
    <button
      onClick={() => { Logout(); handleMobileMenuClick(); }}
      className={cn(
        "group flex items-center w-full gap-3 rounded-xl transition-all duration-200",
        "hover:bg-red-500/10 text-slate-400 hover:text-red-500",
        isExpanded ? "p-2.5" : "p-3 justify-center"
      )}
    >
      <LogOut className={cn("h-5 w-5 transition-transform group-hover:translate-x-0.5", !isExpanded && "h-6 w-6")} />
      {isExpanded && (
        <div className="text-left">
          <p className="text-sm font-medium leading-none">Logout</p>
          <p className="text-[11px] opacity-60 mt-1">Sign out of session</p>
        </div>
      )}
    </button>
  </div>
</SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* Main Content */}
      <main className="thin-scrollbar flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
        {/* Mobile Header */}
        {isMobile && (
            <div className="flex items-center mb-6 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-border/40">
              <SidebarTrigger className="mr-2">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <img src={appWordmarkLight} alt={appName} className="h-7 w-auto max-w-[150px]" />
            <div className="ml-auto flex items-center gap-2">
              <NotificationBell />
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
  );
};

// Main DashboardLayout component that provides the SidebarProvider
const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  );
};

export default DashboardLayout;
