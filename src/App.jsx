import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import RequireRole from "@/components/RequireRole";
import AppLayout from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { homeForRole } from "@/lib/roles";

// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// App pages
import Dashboard from "@/pages/Dashboard";
import CohortDashboard from "@/pages/CohortDashboard";
import EnterpriseList from "@/pages/EnterpriseList";
import EnterpriseDetail from "@/pages/EnterpriseDetail";
import DiagnosticList from "@/pages/DiagnosticList";
import DiagnosticFormPage from "@/pages/DiagnosticFormPage";
import DevelopmentPlan from "@/pages/DevelopmentPlan";
import Interventions from "@/pages/Interventions";
import Milestones from "@/pages/Milestones";
import Mentorship from "@/pages/Mentorship";
import Readiness from "@/pages/Readiness";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";

function RoleHome() {
  const { user } = useAuth();
  if (user?.role === "entrepreneur") return <Dashboard />;
  return <Navigate to="/cohort" replace />;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ErrorBoundary>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected app routes */}
              <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<RoleHome />} />
                  <Route path="/cohort" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "funder"]}><CohortDashboard /></RequireRole>} />
                  <Route path="/enterprises" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "entrepreneur"]}><EnterpriseList /></RequireRole>} />
                  <Route path="/enterprises/:id" element={<EnterpriseDetail />} />
                  <Route path="/diagnostics" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor"]}><DiagnosticList /></RequireRole>} />
                  <Route path="/diagnostics/new" element={<RequireRole allowedRoles={["admin", "practitioner"]}><DiagnosticFormPage /></RequireRole>} />
                  <Route path="/actions" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "entrepreneur"]}><DevelopmentPlan /></RequireRole>} />
                  <Route path="/interventions" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "entrepreneur"]}><Interventions /></RequireRole>} />
                  <Route path="/milestones" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "entrepreneur"]}><Milestones /></RequireRole>} />
                  <Route path="/mentorship" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "entrepreneur"]}><Mentorship /></RequireRole>} />
                  <Route path="/readiness" element={<RequireRole allowedRoles={["admin", "practitioner", "mentor", "entrepreneur"]}><Readiness /></RequireRole>} />
                  <Route path="/users" element={<RequireRole allowedRoles={["admin"]}><Users /></RequireRole>} />
                  <Route path="/settings" element={<RequireRole allowedRoles={["admin"]}><Settings /></RequireRole>} />
                </Route>
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;