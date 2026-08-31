export interface Position {
  id: string;

  business_id: string;

  branch_id: string | null;

  department_id: string | null;

  title: string;

  description?: string;

  employment_type:
    | "full_time"
    | "part_time"
    | "contract"
    | "internship"
    | "temporary";

  minimum_salary?: number;

  maximum_salary?: number;

  retirement_age: number;

  probation_days: number;

  max_absences?: number;

  query_after?: number;

  warning_after?: number;

  dismissal_after?: number;

  created_at?: string;

  updated_at?: string;
}