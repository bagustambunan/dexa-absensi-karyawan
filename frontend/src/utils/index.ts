const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});
export const workDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export const dateFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  dateStyle: "full",
});
export const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  timeStyle: "medium",
});

export const renderTime = (value: string | null) =>
  value ? timeFormat.format(new Date(value)) : "—";

export const renderDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return `${workDateFormat.format(date)} ${timeFormat.format(date)}`;
};
