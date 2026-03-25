import React, { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  UserCog,
  MessageSquare,
  FileText,
  Shield,
  X,
  ArrowLeft,
  UserMinus,
  CreditCard,
  LogOut,
  Menu,
  FileEdit,
  FileSliders,
  Award,
  Tag,
  Settings,
  ClipboardList,
  Globe,
  Building2,
  Mail,
  Megaphone,
  BarChart3,
  Sparkles,
  Moon,
  Sun,
  Home,
  User,
  CreditCard as PricingIcon,
  FileText as ResumeIcon,
  Brain,
  Briefcase
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { serverURL, websiteURL } from '@/constants';
import axios from 'axios';
import { useBranding } from '@/contexts/BrandingContext';
import { useToast } from '@/hooks/use-toast';
import { Cookie } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme hook

const AdminLayout = () => {
  const { appName, appLogo } = useBranding();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme(); // Get theme and setTheme from your ThemeProvider

  // Helper to check active route
  const isActive = (path: string) => location.pathname === path;

  const navigate = useNavigate();
  function redirectHome() {
    navigate("/dashboard");
  }

  useEffect(() => {
    async function dashboardData() {
      const postURL = serverURL + `/api/dashboard`;
      const response = await axios.post(postURL);
      sessionStorage.setItem('adminEmail', response.data.admin.email);
      if (response.data.admin.email !== sessionStorage.getItem('email')) {
        redirectHome();
      }
    }
    if (sessionStorage.getItem('adminEmail')) {
      if (sessionStorage.getItem('adminEmail') !== sessionStorage.getItem('email')) {
        redirectHome();
      }
    } else {
      dashboardData();
    }
  }, []);

  function Logout() {
    sessionStorage.clear();
    toast({
      title: "Logged Out",
      description: "You have logged out successfully",
    });
    window.location.href = websiteURL + '/login';
  }

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20">
        {/* Sidebar with new color scheme */}
        <Sidebar className="border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
          <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-800/60">
            <Link to="/admin" className="flex items-center space-x-3 px-4 py-4 group">
                <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <img src={appLogo} alt="Logo" className='h-5 w-5' />
                </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent">Colossus IQ</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">Admin Portal</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="py-4">
            {/* Main Navigation Section */}
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Main</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/admin')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin">
                      <LayoutDashboard className="h-4.5 w-4.5" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* User Management Section */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">User Management</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Users" isActive={isActive('/admin/users')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/users') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/users">
                      <Users />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Deletion Requests" isActive={isActive('/admin/deletion-requests')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/deletion-requests') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/deletion-requests">
                      <UserMinus />
                      <span>Deletion Requests</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Paid Users" isActive={isActive('/admin/paid-users')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/paid-users') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/paid-users">
                      <DollarSign />
                      <span>Paid Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* Content & Courses Section */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Content & Courses</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Courses" isActive={isActive('/admin/courses')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/courses') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/courses">
                      <BookOpen />
                      <span>Courses</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Organizations" isActive={isActive('/admin/orgs')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/orgs') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/orgs">
                      <Building2 />
                      <span>Organizations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Organization Plans" isActive={isActive('/admin/org-plans')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/org-plans') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/org-plans">
                      <Tag />
                      <span>Organization Plans</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Quiz Retake Requests" isActive={isActive('/admin/quiz-retake-requests')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/quiz-retake-requests') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/quiz-retake-requests">
                      <ClipboardList />
                      <span>Quiz Retake Requests</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* E-commerce & Billing */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">E-commerce & Billing</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Order History" isActive={isActive('/admin/orders')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/orders') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/orders">
                      <ClipboardList />
                      <span>Order History</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Pricing Management" isActive={isActive('/admin/pricing')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/pricing') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/pricing">
                      <Tag />
                      <span>Pricing</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Payment Gateways" isActive={isActive('/admin/payment-settings')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/payment-settings') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/payment-settings">
                      <CreditCard />
                      <span>Payment Gateways</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Subscription & Billing" isActive={isActive('/admin/subscription-billing')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/subscription-billing') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/subscription-billing">
                      <CreditCard />
                      <span>Subscription & Billing</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* Support & Communications */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Support & Comms</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Tickets" isActive={isActive('/admin/tickets')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/tickets') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/tickets">
                      <MessageSquare />
                      <span>Tickets</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Contacts" isActive={isActive('/admin/contacts')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/contacts') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/contacts">
                      <MessageSquare />
                      <span>Contacts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Subscribers" isActive={isActive('/admin/subscribers')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/subscribers') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/subscribers">
                      <Mail />
                      <span>Subscribers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Organization Enquiries" isActive={isActive('/admin/organization-enquiries')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/organization-enquiries') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/organization-enquiries">
                      <Building2 />
                      <span>Organization Enquiries</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* Administration */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-2 mb-2">Administration</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admins" isActive={isActive('/admin/admins')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/admins') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/admins">
                      <UserCog />
                      <span>Admins</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="KPI Reports" isActive={isActive('/admin/kpi-reports')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/kpi-reports') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/kpi-reports">
                      <BarChart3 />
                      <span>KPI Reports</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Limit Requests" isActive={isActive('/admin/limit-requests')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/limit-requests') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/limit-requests">
                      <Shield />
                      <span>Limit Requests</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* Content Management */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Content Management</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Manage Blogs" isActive={isActive('/admin/blogs')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/blogs') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/blogs">
                      <FileSliders />
                      <span>Manage Blogs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Create Blog" isActive={isActive('/admin/create-blog')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/create-blog') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/create-blog">
                      <FileEdit />
                      <span>Create Blog</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Global News" isActive={isActive('/admin/global-news')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/global-news') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/global-news">
                      <Megaphone />
                      <span>Global News</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Testimonials" isActive={isActive('/admin/testimonials')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/testimonials') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/testimonials">
                      <MessageSquare />
                      <span>Testimonials</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* Legal Pages */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Legal Pages</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Terms" isActive={isActive('/admin/terms')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/terms') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/terms">
                      <FileText />
                      <span>Terms</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Privacy" isActive={isActive('/admin/privacy')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/privacy') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/privacy">
                      <Shield />
                      <span>Privacy</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Cookies" isActive={isActive('/admin/cookies')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/cookies') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/cookies">
                      <Cookie />
                      <span>Cookies</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Refund" isActive={isActive('/admin/refund')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/refund') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/refund">
                      <ArrowLeft />
                      <span>Refund</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>

            {/* Certificates & Settings */}
            <div className="px-3 mt-4 mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">System</p>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Certificate" isActive={isActive('/admin/certificate')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/certificate') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/certificate">
                      <Award />
                      <span>Certificate</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings" isActive={isActive('/admin/settings')} className={cn(
                    "rounded-xl transition-all duration-200",
                    isActive('/admin/settings') ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                    <Link to="/admin/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 dark:border-slate-800/60 p-3">
            <div className="space-y-2">
              {/* Theme Toggle Button - Now clickable */}
              <button 
                onClick={toggleTheme}  // Add click handler
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    {theme === 'dark' ? (
                      <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
          
              </button>

              {/* Back to Website */}
              <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Back to Website</span>
              </Link>

              {/* Logout Button */}
              <button onClick={Logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Logout</span>
              </button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {isMobile && (
            <div className="flex items-center mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
              <SidebarTrigger className="mr-3">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                 <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <img src={appLogo} alt="Logo" className='h-5 w-5' />
                </div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">Admin Panel</h1>
              </div>
              <div className="ml-auto">
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

export default AdminLayout;