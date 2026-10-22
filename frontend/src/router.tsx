import LoginPage from "./pages/Login";
import Error404Page from "./pages/Error404";
import AuthLayout from "./components/AuthLayout";
import { createBrowserRouter, redirect } from "react-router";
import { getSessionRole, portalPath, type Role } from "./auth/session";
import EmployeeAttendance from "./pages/EmployeePortal/EmployeeAttendance";
import EmployeeAttendanceSummary from "./pages/EmployeePortal/EmployeeAttendanceSummary";
import EmployeeProfile from "./pages/EmployeePortal/EmployeeProfile";
import EmployeeManagement from "./pages/HrdPortal/EmployeeManagement";
import AttendanceMonitoring from "./pages/HrdPortal/AttendanceMonitoring";
import EmployeeForm from "./pages/HrdPortal/EmployeeForm";

function requireRole(requiredRole: Role) {
  return () => {
    const role = getSessionRole();
    if (!role) return redirect("/login");
    if (role !== requiredRole) return redirect(portalPath(role));
    return null;
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        loader: () => {
          const role = getSessionRole();
          return redirect(role ? portalPath(role) : "/login");
        },
      },
      {
        path: "login",
        element: <LoginPage />,
        loader: () => {
          const role = getSessionRole();
          return role ? redirect(portalPath(role)) : null;
        },
      },
      {
        path: "employee-portal",
        loader: requireRole("EMPLOYEE"),
        shouldRevalidate: () => true,
        element: <AuthLayout />,
        children: [
          { index: true, element: <EmployeeAttendance /> },
          { path: "attendance", element: <EmployeeAttendance /> },
          {
            path: "attendance-summary",
            element: <EmployeeAttendanceSummary />,
          },
          { path: "profile", element: <EmployeeProfile /> },
          { path: "*", element: <Error404Page /> },
        ],
      },
      {
        path: "hrd-portal",
        loader: requireRole("ADMIN"),
        shouldRevalidate: () => true,
        element: <AuthLayout portal="hrd" />,
        children: [
          { index: true, element: <EmployeeManagement /> },
          { path: "employees", element: <EmployeeManagement /> },
          { path: "employees/new", element: <EmployeeForm mode="create" /> },
          {
            path: "employees/:employeeId/edit",
            element: <EmployeeForm mode="edit" />,
          },
          { path: "attendance", element: <AttendanceMonitoring /> },
          { path: "*", element: <Error404Page /> },
        ],
      },
      { path: "*", element: <Error404Page /> },
    ],
  },
]);
