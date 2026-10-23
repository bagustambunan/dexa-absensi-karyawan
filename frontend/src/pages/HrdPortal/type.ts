import type { DatePicker, GetProps } from "antd";

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  position: string;
  phone: string;
  isActive: boolean;
  avatarUrl: string | null;
};

export type EmployeeFormValues = Pick<
  Employee,
  "fullName" | "email" | "position" | "phone"
> & {
  initialPassword?: string;
};

export type Attendance = {
  employeeId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
};

export type AttendanceMonitoringFilters = {
  from?: string;
  to?: string;
  employeeId?: string;
};

export type AttendanceMonitoringFormValues = {
  dates?: GetProps<typeof DatePicker.RangePicker>["value"];
  employeeId?: string;
};
