import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { ConfigProvider } from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider locale={idID}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
);
