export type LoginValues = { email: string; password: string };

export type LoginResponse = {
  accessToken: string;
  user: { id: string; fullName: string; role: "ADMIN" | "EMPLOYEE" };
};
