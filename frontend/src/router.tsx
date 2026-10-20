import LoginPage from "./pages/Login";
import Error404Page from "./pages/Error404";
import AuthLayout from "./components/AuthLayout";
import { createBrowserRouter } from "react-router";
import EmployeeAttendance from "./pages/EmployeePortal/EmployeeAttendance";
import EmployeeAttendanceSummary from "./pages/EmployeePortal/EmployeeAttendanceSummary";

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
        ],
      },
      { path: "*", element: <Error404Page /> },
    ],
  },
]);
