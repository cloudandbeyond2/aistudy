
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
  Building2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { serverURL, websiteURL } from '@/constants';
import axios from 'axios';
import { useBranding } from '@/contexts/BrandingContext';
import { useToast } from '@/hooks/use-toast';
import { Cookie } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';


const AdminLayout = () => {
  const { appName, appLogo } = useBranding();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { toggleTheme } = useTheme();
  {/* Star bala */ }
  const { toast } = useToast();
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
  });
  {/* Star bala */ }
  function Logout() {
    sessionStorage.clear();
    toast({
      title: "Logged Out",
      description: "You have logged out successfully",
    });
    window.location.href = websiteURL + '/login';
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background to-muted/20">
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="border-b border-border/40">
            <Link to="/admin" className="flex items-center space-x-2 px-4 py-3">
              <div className="h-8 w-8 rounded-md bg-primary from-primary flex items-center justify-center">
                <img src={appLogo} alt="Logo" className='h-6 w-6' />
              </div>
              <span className="font-display text-lg font-bold">Admin Panel</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={isActive('/admin')}>
                  <Link to="/admin" className={cn(isActive('/admin') && "text-primary")}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Users" isActive={isActive('/admin/users')}>
                  <Link to="/admin/users" className={cn(isActive('/admin/users') && "text-primary")}>
                    <Users />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Courses" isActive={isActive('/admin/courses')}>
                  <Link to="/admin/courses" className={cn(isActive('/admin/courses') && "text-primary")}>
                    <BookOpen />
                    <span>Courses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Organizations" isActive={isActive('/admin/orgs')}>
                  <Link to="/admin/orgs" className={cn(isActive('/admin/orgs') && "text-primary")}>
                    <Building2 />
                    <span>Organizations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Paid Users" isActive={isActive('/admin/paid-users')}>
                  <Link to="/admin/paid-users" className={cn(isActive('/admin/paid-users') && "text-primary")}>
                    <DollarSign />
                    <span>Paid Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Order History" isActive={isActive('/admin/orders')}>
                  <Link to="/admin/orders" className={cn(isActive('/admin/orders') && "text-primary")}>
                    <ClipboardList />
                    <span>Order History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Payment Gateways" isActive={isActive('/admin/payment-settings')}>
                  <Link to="/admin/payment-settings" className={cn(isActive('/admin/payment-settings') && "text-primary")}>
                    <Settings />
                    <span>Payment Gateways</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Pricing Management" isActive={isActive('/admin/pricing')}>
                  <Link to="/admin/pricing" className={cn(isActive('/admin/pricing') && "text-primary")}>
                    <Tag />
                    <span>Pricing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Admins" isActive={isActive('/admin/admins')}>
                  <Link to="/admin/admins" className={cn(isActive('/admin/admins') && "text-primary")}>
                    <UserCog />
                    <span>Admins</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Contacts" isActive={isActive('/admin/contacts')}>
                  <Link to="/admin/contacts" className={cn(isActive('/admin/contacts') && "text-primary")}>
                    <MessageSquare />
                    <span>Contacts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Testimonials" isActive={isActive('/admin/testimonials')}>
                  <Link to="/admin/testimonials" className={cn(isActive('/admin/testimonials') && "text-primary")}>
                    <MessageSquare />
                    <span>Testimonials</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Blogs" isActive={isActive('/admin/blogs')}>
                  <Link to="/admin/blogs" className={cn(isActive('/admin/blogs') && "text-primary")}>
                    <FileSliders />
                    <span>Manage Blogs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create Blog" isActive={isActive('/admin/create-blog')}>
                  <Link to="/admin/create-blog" className={cn(isActive('/admin/create-blog') && "text-primary")}>
                    <FileEdit />
                    <span>Create Blog</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Terms" isActive={isActive('/admin/terms')}>
                  <Link to="/admin/terms" className={cn(isActive('/admin/terms') && "text-primary")}>
                    <FileText />
                    <span>Terms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Privacy" isActive={isActive('/admin/privacy')}>
                  <Link to="/admin/privacy" className={cn(isActive('/admin/privacy') && "text-primary")}>
                    <Shield />
                    <span>Privacy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Cookies"
                  isActive={isActive('/admin/cookies')}
                >
                  <Link
                    to="/admin/cookies"
                    className={cn(isActive('/admin/cookies') && "text-primary")}
                  >
                    <Cookie />
                    <span>Cookies</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cancellation" isActive={isActive('/admin/cancellation')}>
                  <Link to="/admin/cancellation" className={cn(isActive('/admin/cancellation') && "text-primary")}>
                    <X />
                    <span>Cancellation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Refund" isActive={isActive('/admin/refund')}>
                  <Link to="/admin/refund" className={cn(isActive('/admin/refund') && "text-primary")}>
                    <ArrowLeft />
                    <span>Refund</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Subscription & Billing" isActive={isActive('/admin/subscription-billing')}>
                  <Link to="/admin/subscription-billing" className={cn(isActive('/admin/subscription-billing') && "text-primary")}>
                    <CreditCard />
                    <span>Subscription & Billing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Certificate" isActive={isActive('/admin/certificate')}>
                  <Link to="/admin/certificate" className={cn(isActive('/admin/certificate') && "text-primary")}>
                    <Award />
                    <span>Certificate</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>


              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Organization Enquiries" isActive={isActive('/admin/organization-enquiries')}>
                  <Link to="/admin/organization-enquiries" className={cn(isActive('/admin/organization-enquiries') && "text-primary")}>
                    <Building2 />
                    <span>Organization Enquiries</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={isActive('/admin/settings')}>
                  <Link to="/admin/settings" className={cn(isActive('/admin/settings') && "text-primary")}>
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarContent>


          <SidebarFooter className="border-t border-border/40">
            <SidebarMenu className="py-2">

              {/* Toggle Theme */}
              <SidebarMenuButton asChild tooltip="Theme" onClick={toggleTheme}>
                <div className="
          group
          flex items-center
          rounded-md
          transition-all
          hover:bg-accent
          hover:shadow-md
          px-3 py-2
        ">
                  <ThemeToggle />
                  <span className="pl-3">Toggle Theme</span>
                </div>
              </SidebarMenuButton>

              {/* Back to Website */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Back to Website"
                  className="
          group
          rounded-md
          transition-all
          hover:bg-accent
          hover:shadow-md
        "
                >
                  <Link to="/" className="flex items-center gap-3 w-full px-3 py-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">
                      Back to Website
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Logout */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Logout"
                  className="
          group
          rounded-md
          transition-all
          hover:bg-destructive/10
          hover:shadow-md
        "
                >
                  <button
                    onClick={Logout}
                    className="
            flex items-center gap-3 w-full px-3 py-2
            text-muted-foreground
            hover:text-destructive
          "
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">
                      Logout
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarFooter>


          <SidebarRail />
        </Sidebar>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {isMobile && (
            <div className="flex items-center mb-6 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
              <SidebarTrigger className="mr-2">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div >
    </SidebarProvider >
  );
};

export default AdminLayout;
