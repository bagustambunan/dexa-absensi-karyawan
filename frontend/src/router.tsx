import LoginPage from "./pages/Login"
import Error404Page from "./pages/Error404";
import AuthLayout from "./components/AuthLayout";
import AppLayout from "./components/AppLayout"
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <AppLayout /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "dashboard",
        element: (
          <AuthLayout />
        ),
      },
      { path: "*", element: <Error404Page /> },
    ],
  },
]);
