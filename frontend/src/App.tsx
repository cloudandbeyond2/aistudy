import CookiePopup from "./components/CookiePopup";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Admin imports
import AdminLayout from "./components/layouts/AdminLayout";
import OrgDashboard from "./pages/OrgDashboard";
import OrgAssignmentSubmissions from "./pages/OrgAssignmentSubmissions";
import StudentPortal from "./pages/StudentPortal";
import StudentAssignments from "./pages/StudentAssignments";
import OrgAssignmentCertificate from "./pages/OrgAssignmentCertificate";
import StudentNotices from "./pages/StudentNotices";
import StudentBlogs from "./pages/StudentBlogs";
import StudentNews from "./pages/StudentNews";
import StudentMeetings from "./pages/StudentMeetings";
import StudentProjects from "./pages/StudentProjects";
import StudentMaterials from "./pages/StudentMaterials";
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
import AdminCancellation from "./pages/admin/AdminCancellation";
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

const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId={googleClientId}>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <BrandingProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
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
                    <Route path="org" element={<OrgDashboard />} />
                    <Route path="org/assignment/:assignmentId/submissions" element={<OrgAssignmentSubmissions />} />
                    <Route path="student" element={<StudentPortal />} />
                    <Route path="student/assignments" element={<StudentAssignments />} />
                    <Route path="student/assignment/certificate/:submissionId" element={<OrgAssignmentCertificate />} />
                    <Route path="student/notices" element={<StudentNotices />} />
                    <Route path="student/blogs" element={<StudentBlogs />} />
                    <Route path="student/news" element={<StudentNews />} />
                    <Route path="student/meetings" element={<StudentMeetings />} />
                    <Route path="student/projects" element={<StudentProjects />} />
                    <Route path="student/materials" element={<StudentMaterials />} />
                    <Route path="student/assignment/:assignmentId" element={<AssignmentPage />} />

                    <Route path="notebook" element={<AINotebook />} />
                    <Route path="resume-builder" element={<ResumeBuilder />} />

                    <Route path="support" element={<SupportTickets />} />


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

                  <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/subscription-billing-policy" element={<SubscriptionBillingPolicy />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/resume/:userId" element={<ResumeView />} />

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
                    <Route path="cancellation" element={<AdminCancellation />} />
                    <Route path="refund" element={<AdminRefund />} />
                    <Route path="subscription-billing" element={<AdminSubscriptionBilling />} />
                    <Route path="subscribers" element={<AdminSubscribers />} />
                    <Route path="create-blog" element={<AdminCreateBlog />} />
                    <Route path="/admin/create-blog/:id" element={<AdminCreateBlog />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="certificate" element={<AdminCertificate />} />
                    <Route path="orgs" element={<AdminOrganizations />} />
                    <Route path="organization-enquiries" element={<AdminOrganizationEnquiries />} />

                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payment-settings" element={<AdminPaymentSettings />} />
                    <Route path="organizations" element={<AdminOrganizations />} />
                    <Route path="create-organization" element={<AdminCreateOrganization />} />
                    <Route path="organization/:id" element={<AdminOrganizationDetails />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="tickets" element={<AdminTickets />} />
                  </Route>
                  <Route path="/verify-certificate" element={<CertificateVerification />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
