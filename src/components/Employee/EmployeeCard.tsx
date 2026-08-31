import type { Employee } from "../../types/employee";

type Props = {
  employee: Employee;
};

export default function EmployeeCard({ employee }: Props) {
  return (
    <div className="employee-card">

      <h3>{employee.full_name}</h3>

      <p>{employee.phone}</p>

      <p>{employee.email}</p>

      <p>{employee.status}</p>

      <p>
        Salary: {employee.salary.toLocaleString()} FCFA
      </p>

    </div>
  );
}