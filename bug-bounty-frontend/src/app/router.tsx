import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { RoleGuard } from "@/app/routes/RoleGuard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Programs from "@/pages/Programs";
import ProgramDetails from "@/pages/ProgramDetails";
import SubmitReport from "@/pages/SubmitReport";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/programs", element: <Programs /> },
      { path: "/programs/:programId", element: <ProgramDetails /> },
      {
        path: "/submit-report",
        element: (
          <RoleGuard allow={["researcher"]}>
            <SubmitReport />
          </RoleGuard>
        ),
      },
      { path: "/reports", element: <Reports /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
