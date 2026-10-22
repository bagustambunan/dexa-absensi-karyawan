const timeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export const renderTime = (value: string | null) =>
  value ? timeFormat.format(new Date(value)) : "—";
