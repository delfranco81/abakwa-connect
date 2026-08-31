export interface Employee {
  id: string;

  business_id: string;

  role_id: string | null;

  full_name: string;

  phone: string | null;

  email: string | null;

  address: string | null;

  salary: number;

  status: string;

  avatar: string | null;

  hired_at: string;

  created_at: string;
}

export interface EmployeeRole {
  id: string;

  name: string;

  description: string;
}