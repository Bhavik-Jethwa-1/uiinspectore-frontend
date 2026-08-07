import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfirmProvider } from './hooks/useConfirm';
import { InspectorAuthProvider } from './contexts/InspectorAuthContext';
import { ToastProvider } from './app/inspector/components/Toast';

// ─── Layouts (static — needed on every page) ─────────────────────────────
import LandingLayout from './layouts/LandingLayout';
import AuthLayout    from './layouts/AuthLayout';
import UserLayout   from './layouts/UserLayout';

// ─── Guards ─────────────────────────────────────────────────────────────────
import UserGuard  from './guards/UserGuard';
import AuthGuard  from './guards/AuthGuard';
import AdminGuard from './guards/AdminGuard';
import InspectorAuthGuard from './guards/InspectorAuthGuard';

// ─── Landing (static — always needed) ────────────────────────────────────
import LandingPage from './pages/LandingPage';

// ─── Auth (static — needed immediately) ───────────────────────────────────
import LoginPage    from './app/auth/LoginPage';
import RegisterPage from './app/auth/RegisterPage';

// ─── Lazy-loaded pages — code-split per route ─────────────────────────────
// Heavy AI pages
const AIChatPage               = lazy(() => import('./pages/AIChatPage'));
const AIResearchPage           = lazy(() => import('./pages/AIResearchPage'));
const AIRedesignPage           = lazy(() => import('./pages/AIRedesignPage'));
const AIDetectPage             = lazy(() => import('./pages/AIDetectPage'));
const AutodesignerPage         = lazy(() => import('./pages/AutodesignerPage'));
const PremiumAutoDesignerPage  = lazy(() => import('./pages/PremiumAutoDesignerPage'));
const ProductConsultantPage    = lazy(() => import('./pages/ProductConsultantPage'));

// Core pages
const DashboardPage            = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage             = lazy(() => import('./pages/ProjectsPage'));
const EditorPage               = lazy(() => import('./pages/EditorPage'));
const AnalysisPage             = lazy(() => import('./pages/AnalysisPage'));
const TemplatesPage            = lazy(() => import('./pages/TemplatesPage'));
const SettingsPage             = lazy(() => import('./pages/SettingsPage'));
const ProfilePage              = lazy(() => import('./pages/ProfilePage'));
const BillingPage              = lazy(() => import('./pages/BillingPage'));
const UsagePage                = lazy(() => import('./pages/UsagePage'));
const PricingPage              = lazy(() => import('./pages/PricingPage'));
const ReportsPage              = lazy(() => import('./pages/ReportsPage'));
const AnalyticsPage            = lazy(() => import('./pages/AnalyticsPage'));
const TeamPage                 = lazy(() => import('./pages/TeamPage'));
const TasksPage                = lazy(() => import('./pages/TasksPage'));
const IntegrationsPage         = lazy(() => import('./pages/IntegrationsPage'));
const PrototypingPage          = lazy(() => import('./pages/PrototypingPage'));

// Legacy Admin pages (for /admin/* routes)
const AdminDashboardPage       = lazy(() => import('./app/admin/AdminDashboardPage'));
const AdminUsersPage           = lazy(() => import('./app/admin/AdminUsersPage'));
const AdminSubscriptionsPage   = lazy(() => import('./app/admin/AdminSubscriptionsPage'));
const AdminPaymentsPage        = lazy(() => import('./app/admin/AdminPaymentsPage'));
const AdminPlansPage           = lazy(() => import('./app/admin/AdminPlansPage'));
const AdminBillingPage         = lazy(() => import('./pages/AdminBillingPage'));
const AdminAISettingsPage      = lazy(() => import('./pages/admin/AdminAISettingsPage'));
const AdminAIModelsPage        = lazy(() => import('./app/admin/AdminAIModelsPage'));
const AdminCouponPage          = lazy(() => import('./app/admin/AdminCouponPage'));

// ─── Inspector pages ───────────────────────────────────────────────────────
import InspectorDashboard from './app/inspector/InspectorDashboard';
import InspectorProjectsPage from './app/inspector/ProjectsPage';
import InspectorCreateProjectPage from './app/inspector/CreateProjectPage';
import InspectorReviewWorkspace from './app/inspector/ReviewWorkspace';
import InspectorLoginPage from './app/inspector/LoginPage';
import InspectorRegisterPage from './app/inspector/RegisterPage';
import InspectorLandingPage from './app/inspector/LandingPage';
import InspectorSettingsPage from './app/inspector/SettingsPage';
import InspectorLayout from './app/inspector/layouts/InspectorLayout';

// ─── Inspector Admin pages ───────────────────────────────────────────────
import InspectorAdminLayout from './app/inspector/admin/AdminLayout';
import InspectorAdminDashboard from './app/inspector/admin/pages/AdminDashboard';
import InspectorAdminUsersPage from './app/inspector/admin/pages/AdminUsersPage';
import InspectorAdminProjectsPage from './app/inspector/admin/pages/AdminProjectsPage';
import InspectorAdminReviewsPage from './app/inspector/admin/pages/AdminReviewsPage';
import InspectorAdminSettingsPage from './app/inspector/admin/pages/AdminSettingsPage';

// ─── Loading fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#07070f' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }} />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  );
}

// ─── Stub for pages not yet created ──────────────────────────────────────
function AdminStub({ title }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(20px)', borderColor: 'rgba(239,68,68,0.15)' }}>
        <h1 className="text-[18px] font-black text-white">{title}</h1>
      </div>
      <div className="p-6 flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-[14px] text-gray-400">Page being built…</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConfirmProvider>
      <InspectorAuthProvider>
      <Suspense fallback={<PageLoader />}>
        <ToastProvider>
        <Routes>
          {/* ── Landing ─────────────────────────────────────────────────── */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={
              <AuthGuard><LandingPage /></AuthGuard>
            } />
          </Route>

          {/* ── Auth ────────────────────────────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login"    element={
              <AuthGuard><LoginPage /></AuthGuard>
            } />
            <Route path="/auth/register" element={
              <AuthGuard><RegisterPage /></AuthGuard>
            } />
          </Route>

          {/* ── User Panel ─────────────────────────────────────────────── */}
          <Route element={<UserLayout />}>
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

            <Route path="/app/dashboard"             element={<DashboardPage />} />
            <Route path="/app/editor/:id"           element={<EditorPage />} />
            <Route path="/app/autodesigner"          element={<AutodesignerPage />} />
            <Route path="/app/premium-autodesigner"   element={<PremiumAutoDesignerPage />} />
            <Route path="/app/projects"              element={<InspectorProjectsPage />} />
            <Route path="/app/analysis"              element={<AnalysisPage />} />
            <Route path="/app/product-consultant"    element={<ProductConsultantPage />} />
            <Route path="/app/ai/research"           element={<AIResearchPage />} />
            <Route path="/app/ai/chat"              element={<AIChatPage />} />
            <Route path="/app/ai/redesign"          element={<AIRedesignPage />} />
            <Route path="/app/ai/detect"             element={<AIDetectPage />} />
            <Route path="/app/templates"             element={<TemplatesPage />} />
            <Route path="/app/billing"              element={<BillingPage />} />
            <Route path="/app/usage"                element={<UsagePage />} />
            <Route path="/app/pricing"              element={<PricingPage />} />
            <Route path="/app/settings"             element={<SettingsPage />} />
            <Route path="/app/profile"              element={<ProfilePage />} />
            <Route path="/app/reports"              element={<ReportsPage />} />
            <Route path="/app/analytics"            element={<AnalyticsPage />} />
            <Route path="/app/team"                element={<TeamPage />} />
            <Route path="/app/tasks"               element={<TasksPage />} />
            <Route path="/app/integrations"         element={<IntegrationsPage />} />
            <Route path="/app/prototyping"          element={<PrototypingPage />} />
            <Route path="/app/admin"               element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* ── Legacy Admin Panel (uses different auth) ────────────────── */}
          <Route element={<AdminGuard />}>
            <Route path="/admin"                  element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard"        element={<AdminDashboardPage />} />
            <Route path="/admin/users"            element={<AdminUsersPage />} />
            <Route path="/admin/subscriptions"   element={<AdminSubscriptionsPage />} />
            <Route path="/admin/billing"         element={<AdminBillingPage />} />
            <Route path="/admin/payments"        element={<AdminPaymentsPage />} />
            <Route path="/admin/plans"            element={<AdminPlansPage />} />
            <Route path="/admin/coupons"         element={<AdminCouponPage />} />
            <Route path="/admin/transactions"     element={<AdminStub title="Transactions" />} />
            <Route path="/admin/ai-providers"    element={<AdminAISettingsPage />} />
            <Route path="/admin/ai-models"        element={<AdminAIModelsPage />} />
            <Route path="/admin/prompt-library"  element={<AdminStub title="Prompt Library" />} />
            <Route path="/admin/templates"       element={<AdminStub title="Templates" />} />
            <Route path="/admin/projects"        element={<AdminStub title="Projects" />} />
            <Route path="/admin/analytics"       element={<AdminStub title="Analytics" />} />
            <Route path="/admin/reports"         element={<AdminStub title="Reports" />} />
            <Route path="/admin/support"         element={<AdminStub title="Support Tickets" />} />
            <Route path="/admin/notifications"   element={<AdminStub title="Notifications" />} />
            <Route path="/admin/feature-flags"  element={<AdminStub title="Feature Flags" />} />
            <Route path="/admin/audit-logs"      element={<AdminStub title="Audit Logs" />} />
            <Route path="/admin/server"          element={<AdminStub title="Server Monitor" />} />
            <Route path="/admin/queue"           element={<AdminStub title="Queue Monitor" />} />
            <Route path="/admin/database"        element={<AdminStub title="Database" />} />
            <Route path="/admin/backups"         element={<AdminStub title="Backups" />} />
            <Route path="/admin/admin-users"     element={<AdminStub title="Admin Users" />} />
            <Route path="/admin/roles"           element={<AdminStub title="Roles & Permissions" />} />
            <Route path="/admin/settings"        element={<AdminStub title="Settings" />} />
          </Route>

          {/* ── Inspector: public ──────────────────────────────────────────── */}
          <Route path="/inspector/landing" element={<InspectorLandingPage />} />
          <Route path="/inspector/login" element={<InspectorLoginPage />} />
          <Route path="/inspector/register" element={<InspectorRegisterPage />} />

          {/* ── Inspector: auth required ─────────────────────────────────── */}
          <Route path="/inspector" element={<InspectorAuthGuard><InspectorLayout /></InspectorAuthGuard>}>
            <Route path="/inspector" index element={<InspectorDashboard />} />
            <Route path="/inspector/projects" element={<InspectorProjectsPage />} />
            <Route path="/inspector/projects/new" element={<InspectorCreateProjectPage />} />
            <Route path="/inspector/projects/:id" element={<InspectorReviewWorkspace />} />
            <Route path="/inspector/settings" element={<InspectorSettingsPage />} />
          </Route>

          {/* ── Inspector Admin Panel ────────────────────────────────────────── */}
          <Route path="/inspector/admin" element={<InspectorAuthGuard adminOnly><InspectorAdminLayout /></InspectorAuthGuard>}>
            <Route path="/inspector/admin" index element={<InspectorAdminDashboard />} />
            <Route path="/inspector/admin/users" element={<InspectorAdminUsersPage />} />
            <Route path="/inspector/admin/projects" element={<InspectorAdminProjectsPage />} />
            <Route path="/inspector/admin/reviews" element={<InspectorAdminReviewsPage />} />
            <Route path="/inspector/admin/settings" element={<InspectorAdminSettingsPage />} />
          </Route>

          {/* ── Root redirect to landing ──────────────────────────────── */}
          <Route path="/" element={<Navigate to="/inspector/landing" replace />} />
        </Routes>
        </ToastProvider>
      </Suspense>
      </InspectorAuthProvider>
    </ConfirmProvider>
  );
}
