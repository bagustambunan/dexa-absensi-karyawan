export type Employee = {
  id: string;
  fullName: string;
  email: string;
  position: string;
  phone: string;
  isActive: boolean;
};

export type EmployeeFormValues = Pick<
  Employee,
  "fullName" | "email" | "position" | "phone"
> & {
  initialPassword?: string;
};
