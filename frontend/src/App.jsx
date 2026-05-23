import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, AuthProvider, PageChromeProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import { ADMIN_BASE, ADMIN_LOGIN } from './lib/adminPaths';

const About = lazy(() => import('./pages/About'));
const AboutFieldDetail = lazy(() => import('./pages/AboutFieldDetail'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() =>
  import('./pages/Services').then((m) => ({ default: m.ServiceDetail }))
);
const CaseStudiesList = lazy(() =>
  import('./pages/CaseStudies').then((m) => ({ default: m.CaseStudiesList }))
);
const CaseStudyDetail = lazy(() =>
  import('./pages/CaseStudies').then((m) => ({ default: m.CaseStudyDetail }))
);
const BlogList = lazy(() =>
  import('./pages/Blog').then((m) => ({ default: m.BlogList }))
);
const BlogPostDetail = lazy(() =>
  import('./pages/Blog').then((m) => ({ default: m.BlogPostDetail }))
);
const Education = lazy(() => import('./pages/Education'));
const CourseDetail = lazy(() =>
  import('./pages/Education').then((m) => ({ default: m.CourseDetail }))
);
const CourseApplication = lazy(() => import('./pages/CourseApplication'));
const StudentPortal = lazy(() => import('./pages/StudentPortal'));
const StudentAccessSetup = lazy(() => import('./pages/StudentAccessSetup'));
const ApplicationSecurityChecker = lazy(() => import('./pages/ApplicationSecurityChecker'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const WebDevelopment = lazy(() => import('./pages/WebDevelopment'));
const EducationConsultant = lazy(() => import('./pages/EducationConsultant'));
const ScholarshipDetail = lazy(() => import('./pages/ScholarshipDetail'));
const ScholarshipsList = lazy(() => import('./pages/ScholarshipsList'));
const AgentRegistration = lazy(() => import('./pages/AgentRegistration'));
const StudentApplication = lazy(() => import('./pages/StudentApplication'));
const UniversityCourses = lazy(() => import('./pages/UniversityCourses'));
const AgentPortal = lazy(() => import('./pages/AgentPortal'));
const AgentLogin = lazy(() => import('./pages/AgentLogin'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminCaseStudies = lazy(() => import('./pages/admin/AdminCaseStudies'));
const AdminLmsContent = lazy(() => import('./pages/admin/AdminLmsContent'));

const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPenTestResults = lazy(() => import('./pages/admin/AdminPenTestResults'));
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'));
const AdminUniversities = lazy(() => import('./pages/admin/AdminUniversities'));
const AdminScholarships = lazy(() => import('./pages/admin/AdminScholarships'));
const AdminScholarshipForm = lazy(() => import('./pages/admin/AdminScholarshipForm'));
const AdminScholarshipDetail = lazy(() => import('./pages/admin/AdminScholarshipDetail'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));

function StandaloneFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060d18] text-white/50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2FA084]/30 border-t-[#2FA084]" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<StandaloneFallback />}>{children}</Suspense>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PageChromeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="about/field/:slug" element={<AboutFieldDetail />} />
                <Route path="services" element={<Services />} />
                <Route path="services/:slug" element={<ServiceDetail />} />
                <Route path="education" element={<Education />} />
                <Route path="education/:slug" element={<CourseDetail />} />
                <Route path="education/:slug/apply" element={<CourseApplication />} />
                <Route path="student" element={<StudentPortal />} />
                <Route path="student/access" element={<StudentAccessSetup />} />
                <Route path="checker" element={<Navigate to="/application-security-checker" replace />} />
                <Route path="application-security-checker" element={<ApplicationSecurityChecker />} />
                <Route path="case-studies" element={<CaseStudiesList />} />
                <Route path="case-studies/:slug" element={<CaseStudyDetail />} />
                <Route path="blog" element={<BlogList />} />
                <Route path="blog/:slug" element={<BlogPostDetail />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="cookies" element={<CookiePolicy />} />
                <Route path="web-development" element={<WebDevelopment />} />
                <Route path="education-consultant" element={<EducationConsultant />} />
                <Route path="education-consultant/scholarships" element={<ScholarshipsList />} />
                <Route path="education-consultant/scholarships/:id" element={<ScholarshipDetail />} />
                <Route path="agent-registration" element={<AgentRegistration />} />
                <Route path="agent-login" element={<LazyPage><AgentLogin /></LazyPage>} />
                <Route path="agent-portal" element={<LazyPage><AgentPortal /></LazyPage>} />
                <Route path="student-application" element={<StudentApplication />} />
                <Route path="university/:id/courses" element={<UniversityCourses />} />
              </Route>
              <Route path={ADMIN_LOGIN} element={<LazyPage><AdminLogin /></LazyPage>} />
              <Route
                path={ADMIN_BASE}
                element={
                  <ProtectedRoute>
                    <LazyPage>
                      <AdminLayout />
                    </LazyPage>
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="case-studies" element={<AdminCaseStudies />} />
                <Route path="lms" element={<AdminLmsContent />} />
                <Route path="students" element={<Navigate to={`${ADMIN_BASE}/scholarships`} replace />} />
                <Route path="students/:id" element={<Navigate to={`${ADMIN_BASE}/scholarships`} replace />} />

                <Route path="contacts" element={<AdminContacts />} />
                <Route path="pentest-results" element={<AdminPenTestResults />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="agents" element={<AdminAgents />} />
                <Route path="universities" element={<AdminUniversities />} />
                <Route path="scholarships" element={<AdminScholarships />} />
                <Route path="scholarships/new" element={<AdminScholarshipForm />} />
                <Route path="scholarships/:id/edit" element={<AdminScholarshipForm />} />
                <Route path="scholarships/:id" element={<AdminScholarshipDetail />} />
                <Route path="scholarships/:id/applications/:appId" element={<AdminScholarshipDetail />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/admin/*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
        </PageChromeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
