import CookiePopup from "./components/CookiePopup";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import OrganizationEnquiry from "./pages/OrganizationEnquiry";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import GenerateCourse from "./pages/GenerateCourse";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ProfilePricing from "./pages/ProfilePricing";
import IndividualPricing from "./pages/IndividualPricing";
import PaymentDetails from "./pages/PaymentDetails";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";
import PaymentSuccess from "./pages/PaymentSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailed from "./pages/PaymentFailed";
import VerifyEmail from "./pages/VerifyEmail";
import GlobalNews from "./pages/GlobalNews";
import Analytics from "./pages/Analytics";

// Admin imports
import AdminLayout from "./components/layouts/AdminLayout";
import OrgDashboard from "./pages/OrgDashboard";
import OrgAssignmentSubmissions from "./pages/OrgAssignmentSubmissions";
import StudentPortal from "./pages/StudentPortal";
import StudentAssignments from "./pages/StudentAssignments";
import OrgAssignmentCertificate from "./pages/OrgAssignmentCertificate";
import OrgCareerPlacement from "./pages/OrgCareerPlacement";
import OrgInternshipDetails from "./pages/OrgInternshipDetails";
import OrgKpiReports from "./pages/OrgKpiReports";
import StudentCareer from "./pages/StudentCareer";
import StudentPublicPortfolio from "./pages/StudentPublicPortfolio";
import StudentNotices from "./pages/StudentNotices";
import StudentBlogs from "./pages/StudentBlogs";
import StudentNews from "./pages/StudentNews";
import StudentMeetings from "./pages/StudentMeetings";
import StudentProjects from "./pages/StudentProjects";
import StudentMaterials from "./pages/StudentMaterials";
import StudentInternship from "./pages/StudentInternship";
import AssignmentPage from "./pages/AssignmentPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCookies from "./pages/admin/AdminCookies";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminPaidUsers from "./pages/admin/AdminPaidUsers";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminTerms from "./pages/admin/AdminTerms";
import AdminPrivacy from "./pages/admin/AdminPrivacy";
import AdminRefund from "./pages/admin/AdminRefund";
import AdminDeletionRequests from "./pages/admin/AdminDeletionRequests";
import AdminSubscriptionBilling from "./pages/admin/AdminSubscriptionBilling";
import AdminCreateBlog from "./pages/admin/AdminCreateBlog";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminCertificate from "./pages/admin/AdminCertificate";
import CertificateVerification from "./pages/CertificateVerification";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { googleClientId } from "./constants";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminCreateOrganization from "./pages/admin/AdminCreateOrganization";
import AdminOrganizationDetails from "./pages/admin/AdminOrganizationDetails";
import AdminOrganizationEnquiries from "./pages/admin/AdminOrganizationEnquiries";
import AdminOrgPlan from "./pages/admin/AdminOrgPlan";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminTickets from "./pages/admin/AdminTickets";
import SupportTickets from "./pages/SupportTickets";
import SubscriptionBillingPolicy from "./pages/SubscriptionBillingPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import QuizPage from "./pages/QuizPage";
import BlogPost from "./pages/BlogPost";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeView from "./pages/ResumeView";
import AINotebook from "./pages/AINotebook";
import StudentSupportTickets from "./pages/StudentSupportTickets";
import OrgStudentTickets from "./pages/OrgStudentTickets";
import DeptDashboard from "./pages/DeptDashboard";
import StaffDashboard from './pages/StaffDashboard';
import StudentAttendance from './pages/StudentAttendance';
import AdminGlobalNews from "./pages/admin/AdminGlobalNews";
import AdminKpiReports from "./pages/admin/AdminKpiReports";
import AdminLimitRequests from "./pages/admin/AdminLimitRequests";
import AdminQuizRetakeRequests from "./pages/admin/AdminQuizRetakeRequests";
import OrgMockInterview from "./pages/OrgMockInterview";
import InterviewTrainingHub from "./pages/InterviewTrainingHub";
import AiMockRoom from "@/pages/AiMockRoom";
import AIChatBot from "./pages/AIChatBot";
import MockReport from "./pages/MockReport";




// Staff Pages
import StaffClasses from './pages/staff/StaffClasses';
import StaffClassDetails from './pages/staff/StaffClassDetails';
import StaffClassAttendance from './pages/staff/StaffClassAttendance';
import StaffStudents from './pages/staff/StaffStudents';
import StaffGrading from './pages/staff/StaffGrading';
import CalendarScheduler from './pages/CalendarScheduler';
import StaffGlobalNews from "./pages/staff/StaffAnnouncements";
import StudentProfile from "./pages/StudentProfile";
import StaffResources from './pages/staff/StaffResources';
import StaffSupport from './pages/staff/StaffSupport';
import InterviewPreparation from "./pages/InterviewPreparation";
import TodoCenter from "./pages/TodoCenter";
import LandingPage from "./pages/LandingPage";
import OrgLandingPage from "./pages/OrgLandingPage";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import DepartmentsTab from "./pages/org-dashboard/DepartmentsTab";
import StaffTab from "./pages/org-dashboard/StaffTab";
import ApprovalsTab from "./pages/org-dashboard/ApprovalsTab";
import ActivityTab from "./pages/org-dashboard/ActivityTab";
import StudentsTab from "./pages/org-dashboard/StudentsTab";
import CoursesTab from "./pages/org-dashboard/CoursesTab";
import AssignmentsTab from "./pages/org-dashboard/AssignmentsTab";
import MeetingTab from "./pages/org-dashboard/MeetingsTab";
import ProjectTab from "./pages/org-dashboard/ProjectsTab";
import MaterialsTab from "./pages/org-dashboard/MaterialsTab";
import NoticesTab from "./pages/org-dashboard/NoticesTab";
import CareerTab from "./pages/org-dashboard/CareerTab";
import SkillBooster from "./pages/SkillBooster";
import LiveSupportWidget from "./components/support/LiveSupportWidget";
import ChatBotFloatingIcon from "./components/support/ChatBotFloatingIcon";
import LiveSupportTab from "./pages/org-dashboard/LiveSupportTab";

const PublicThemeGuard = () => {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, [location.pathname]);

  return null;
};

const queryClient = new QueryClient();

const OrganizationStudentGuard = () => {
  const role = sessionStorage.getItem("role");
  const orgId = sessionStorage.getItem("orgId");
  const isOrganizationStudent = role === "student" && Boolean(orgId);

  if (!isOrganizationStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <BrandingProvider>
            <TooltipProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <PublicThemeGuard />
                <Routes>
                  <Route path="/home1" element={<LandingPage />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />

                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="generate-course" element={<GenerateCourse />} />
                    <Route path="pricing" element={<ProfilePricing />} />
                    <Route path="payment/:planId" element={<PaymentDetails />} />
                    <Route path="profile" element={<Profile />} />
                      <Route path="analytics" element={<Analytics />} />
                    <Route path="org" element={<OrgDashboard />} />
                    <Route path="org/internship/:id" element={<OrgInternshipDetails />} />
                    <Route path="org/quiz-retake-requests" element={<AdminQuizRetakeRequests />} />
                    <Route path="org/career" element={<OrgCareerPlacement />} />
                    <Route path="org/mock-interview" element={<OrgMockInterview />} />
                    <Route path="interview-training" element={<InterviewTrainingHub />} />
                    <Route path="ai-chat-bot" element={<AIChatBot />} />
                    <Route path="ai-mock-room" element={<AiMockRoom />} />
                    <Route path="mock-report/:applicationId" element={<MockReport />} />
                    <Route path="org/reports" element={<OrgKpiReports />} />
                    <Route path="org-departments" element={<DepartmentsTab />} />
                     <Route path="org-staff" element={<StaffTab />} />
                     <Route path="org-approvals" element={<ApprovalsTab />} />
                     <Route path="org-activity" element={<ActivityTab />} />
                     <Route path="org-students" element={<StudentsTab />} />
                     <Route path="org-courses" element={<CoursesTab />} />
                     <Route path="org-assignments" element={<AssignmentsTab />} />
                     <Route path="org-meetings" element={<MeetingTab />} />
                     <Route path="org-projects" element={<ProjectTab />} />
                     <Route path="org-materials" element={<MaterialsTab />} />
                     <Route path="org-notices" element={<NoticesTab />} />
                     <Route path="org-career" element={<CareerTab />} />
                     <Route path="org-live-support" element={<LiveSupportTab />} />

                    <Route path="org/assignment/:assignmentId/submissions" element={<OrgAssignmentSubmissions />} />
                    <Route path="student" element={<OrganizationStudentGuard />}>
                      <Route index element={<StudentPortal />} />
                      <Route path="career" element={<StudentCareer />} />
                      <Route path="assignments" element={<StudentAssignments />} />
                      <Route path="assignment/certificate/:submissionId" element={<OrgAssignmentCertificate />} />
                      <Route path="notices" element={<StudentNotices />} />
                      <Route path="blogs" element={<StudentBlogs />} />
                      <Route path="news" element={<StudentNews />} />
                      <Route path="meetings" element={<StudentMeetings />} />
                      <Route path="projects" element={<StudentProjects />} />
                      <Route path="materials" element={<StudentMaterials />} />
                      <Route path="attendance" element={<StudentAttendance />} />
                      <Route path="internship" element={<StudentInternship />} />
                      <Route path="assignment/:assignmentId" element={<AssignmentPage />} />
                      <Route path="support-tickets" element={<StudentSupportTickets />} />
                      <Route path="profile" element={<StudentProfile />} />
                    </Route>
                    <Route path="news" element={<GlobalNews />} />

                    <Route path="notebook" element={<AINotebook />} />
                    <Route path="resume-builder" element={<ResumeBuilder />} />
                    <Route path="calendar" element={<CalendarScheduler />} />
                    <Route path="todo" element={<TodoCenter />} />
                    <Route path="skill-booster" element={<SkillBooster />} />
                 

                    <Route path="support" element={<SupportTickets />} />

                    <Route path="org/student-tickets" element={<OrgStudentTickets />} />
                    <Route path="dept" element={<DeptDashboard />} />
                    <Route path="interview-prep" element={<InterviewPreparation />} />
                  </Route>

                  {/* Course Routes */}
                  <Route path="/course/:courseId" element={<CoursePage />} />
                  <Route path="/course/:courseId/certificate" element={<Certificate />} />
                  <Route path="/course/:courseId/quiz" element={<QuizPage />} />

                  {/* Payment Routes */}
                  <Route path="/payment-success/:planId" element={<PaymentSuccess />} />
                  <Route path="/payment-pending" element={<PaymentPending />} />
                  <Route path="/payment-failed" element={<PaymentFailed />} />

                  {/* Static Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/organization-enquiry" element={<OrganizationEnquiry />} />
                  <Route path="/pricing/individual" element={<IndividualPricing />} />

                  <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/subscription-billing-policy" element={<SubscriptionBillingPolicy />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/resume/:userId" element={<ResumeView />} />
                  <Route path="/portfolio/:studentId" element={<StudentPublicPortfolio />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="deletion-requests" element={<AdminDeletionRequests />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="cookies" element={<AdminCookies />} />
                    <Route path="pricing" element={<AdminPricing />} />
                    <Route path="paid-users" element={<AdminPaidUsers />} />
                    <Route path="admins" element={<AdminAdmins />} />
                    <Route path="contacts" element={<AdminContacts />} />
                    <Route path="terms" element={<AdminTerms />} />
                    <Route path="privacy" element={<AdminPrivacy />} />
                    <Route path="refund" element={<AdminRefund />} />
                    <Route path="subscription-billing" element={<AdminSubscriptionBilling />} />
                    <Route path="subscribers" element={<AdminSubscribers />} />
                    <Route path="create-blog" element={<AdminCreateBlog />} />
                    <Route path="/admin/create-blog/:id" element={<AdminCreateBlog />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="certificate" element={<AdminCertificate />} />
                    <Route path="orgs" element={<AdminOrganizations />} />
                    <Route path="limit-requests" element={<AdminLimitRequests />} />
                    <Route path="quiz-retake-requests" element={<AdminQuizRetakeRequests />} />
                    <Route path="organization-enquiries" element={<AdminOrganizationEnquiries />} />
                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payment-settings" element={<AdminPaymentSettings />} />
                    <Route path="organizations" element={<AdminOrganizations />} />
                    <Route path="org-plans" element={<AdminOrgPlan />} />
                    <Route path="create-organization" element={<AdminCreateOrganization />} />
                    <Route path="organization/:id" element={<AdminOrganizationDetails />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="tickets" element={<AdminTickets />} />
                    <Route path="global-news" element={<AdminGlobalNews />} />
                    <Route path="kpi-reports" element={<AdminKpiReports />} />
                  </Route>
                  <Route path="/verify-certificate" element={<CertificateVerification />} />

                  {/* Org Landing Page - Catch-all for slugs */}
                  <Route path="/:slug" element={<OrgLandingPage />} />

                  <Route path="*" element={<NotFound />} />


                  {/* Staff Routes */}
                  <Route path="/dashboard/staff" element={<DashboardLayout />}>
                    <Route index element={<StaffDashboard />} />
                    <Route path="classes" element={<StaffClasses />} />
                    <Route path="classes/:id" element={<StaffClassDetails />} />
                    <Route path="classes/:id/attendance" element={<StaffClassAttendance />} />
                    <Route path="schedule" element={<CalendarScheduler />} />
                    <Route path="students" element={<StaffStudents />} />
                    <Route path="grading" element={<StaffGrading />} />
                    <Route path="resources" element={<StaffResources />} />
                    <Route path="support" element={<StaffSupport />} />
                    <Route path="*" element={<StaffDashboard />} /> {/* Fallback for demo */}
                  </Route>
                </Routes>
                <LiveSupportWidget />
                {/* <ChatBotFloatingIcon /> */}
                <CookiePopup />
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </TooltipProvider>
          </BrandingProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
