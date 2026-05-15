import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { RoleGuard } from "@/app/routes/RoleGuard";
import { RootRedirect } from "@/app/routes/RootRedirect";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import ChooseRole from "@/pages/onboarding/ChooseRole";
import CreateOrganizationOnboarding from "@/pages/onboarding/CreateOrganization";
import Programs from "@/pages/developer/Programs";
import ProgramDetails from "@/pages/developer/ProgramDetails";
import SubmitReport from "@/pages/developer/SubmitReport";
import Reports from "@/pages/developer/Reports";
import Profile from "@/pages/Profile";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import { DeveloperDashboard, OrganizationDashboard } from "@/features/dashboard";
import DeveloperFeatureRequests from "@/pages/developer/FeatureRequests";
import OrganizationPrograms from "@/pages/organization/OrganizationPrograms";
import CreateProgram from "@/pages/organization/CreateProgram";
import OrganizationReports from "@/pages/organization/OrganizationReports";
import OrganizationFeatureRequests from "@/pages/organization/OrganizationFeatureRequests";
import CreateFeatureRequest from "@/pages/organization/CreateFeatureRequest";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/dashboard", element: <RootRedirect /> },
  { path: "/programs", element: <Navigate to="/researcher/programs" replace /> },
  { path: "/reports", element: <Navigate to="/researcher/reports" replace /> },
  { path: "/submit-report", element: <Navigate to="/researcher/submit-report" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <ChooseRole />
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/organization",
    element: (
      <ProtectedRoute>
        <CreateOrganizationOnboarding />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/researcher",
        element: (
          <RoleGuard allow={["developer"]}>
            <RootRedirect />
          </RoleGuard>
        ),
      },
      {
        path: "/researcher/dashboard",
        element: (
          <RoleGuard allow={["developer"]}>
            <DeveloperDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "/researcher/programs",
        element: (
          <RoleGuard allow={["developer"]}>
            <Programs />
          </RoleGuard>
        ),
      },
      {
        path: "/researcher/programs/:programId",
        element: (
          <RoleGuard allow={["developer"]}>
            <ProgramDetails />
          </RoleGuard>
        ),
      },
      {
        path: "/researcher/submit-report",
        element: (
          <RoleGuard allow={["developer"]}>
            <SubmitReport />
          </RoleGuard>
        ),
      },
      {
        path: "/researcher/reports",
        element: (
          <RoleGuard allow={["developer"]}>
            <Reports />
          </RoleGuard>
        ),
      },
      {
        path: "/researcher/feature-requests",
        element: (
          <RoleGuard allow={["developer"]}>
            <DeveloperFeatureRequests />
          </RoleGuard>
        ),
      },
      {
        path: "/developer",
        element: (
          <RoleGuard allow={["developer"]}>
            <RootRedirect />
          </RoleGuard>
        ),
      },
      {
        path: "/developer/dashboard",
        element: (
          <RoleGuard allow={["developer"]}>
            <DeveloperDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "/developer/programs",
        element: (
          <RoleGuard allow={["developer"]}>
            <Programs />
          </RoleGuard>
        ),
      },
      {
        path: "/developer/programs/:programId",
        element: (
          <RoleGuard allow={["developer"]}>
            <ProgramDetails />
          </RoleGuard>
        ),
      },
      {
        path: "/developer/submit-report",
        element: (
          <RoleGuard allow={["developer"]}>
            <SubmitReport />
          </RoleGuard>
        ),
      },
      {
        path: "/developer/reports",
        element: (
          <RoleGuard allow={["developer"]}>
            <Reports />
          </RoleGuard>
        ),
      },
      {
        path: "/developer/feature-requests",
        element: (
          <RoleGuard allow={["developer"]}>
            <DeveloperFeatureRequests />
          </RoleGuard>
        ),
      },
      {
        path: "/organization",
        element: (
          <RoleGuard allow={["organization"]}>
            <RootRedirect />
          </RoleGuard>
        ),
      },
      {
        path: "/organization/dashboard",
        element: (
          <RoleGuard allow={["organization"]}>
            <OrganizationDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "/organization/programs",
        element: (
          <RoleGuard allow={["organization"]}>
            <OrganizationPrograms />
          </RoleGuard>
        ),
      },
      {
        path: "/organization/programs/new",
        element: (
          <RoleGuard allow={["organization"]}>
            <CreateProgram />
          </RoleGuard>
        ),
      },
      {
        path: "/organization/reports",
        element: (
          <RoleGuard allow={["organization"]}>
            <OrganizationReports />
          </RoleGuard>
        ),
      },
      {
        path: "/organization/feature-requests",
        element: (
          <RoleGuard allow={["organization"]}>
            <OrganizationFeatureRequests />
          </RoleGuard>
        ),
      },
      {
        path: "/organization/feature-requests/new",
        element: (
          <RoleGuard allow={["organization"]}>
            <CreateFeatureRequest />
          </RoleGuard>
        ),
      },
      { path: "/profile", element: <Profile /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
