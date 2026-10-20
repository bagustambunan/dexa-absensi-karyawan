import LoginPage from "./pages/Login";
import Error404Page from "./pages/Error404";
import AuthLayout from "./components/AuthLayout";
import { createBrowserRouter } from "react-router";
import EmployeeAttendance from "./pages/EmployeePortal/EmployeeAttendance";
import EmployeeAttendanceSummary from "./pages/EmployeePortal/EmployeeAttendanceSummary";
import EmployeeProfile from "./pages/EmployeePortal/EmployeeProfile";
import EmployeeManagement from "./pages/HrdPortal/EmployeeManagement";
import AttendanceMonitoring from "./pages/HrdPortal/AttendanceMonitoring";
import EmployeeForm from "./pages/HrdPortal/EmployeeForm";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <></> },
      { path: "login", element: <LoginPage /> },
      {
        path: "employee-portal",
        element: <AuthLayout />,
        children: [
          { index: true, element: <EmployeeAttendance /> },
          { path: "attendance", element: <EmployeeAttendance /> },
          { path: "attendance-summary", element: <EmployeeAttendanceSummary /> },
          { path: "profile", element: <EmployeeProfile /> },
        ],
      },
      {
        path: "hrd-portal",
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
        ],
      },
      { path: "*", element: <Error404Page /> },
    ],
  },
]);
