import type { DatePicker, GetProps } from "antd";

export type AttendanceDay = {
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
};

export type AttendanceFilters = { from?: string; to?: string };

export type AttendanceFilterValues = {
  dates?: GetProps<typeof DatePicker.RangePicker>["value"];
};
