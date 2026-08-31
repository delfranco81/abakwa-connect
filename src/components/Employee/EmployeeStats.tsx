import type { Employee } from "../../types/employee";

type Props = {
  employees: Employee[];
};

export default function EmployeeStats({ employees }: Props) {
  const active = employees.filter(
    (e) => e.status === "Active"
  ).length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 20,
      }}
    >
      <div>
        <h2>{employees.length}</h2>
        <p>Total Employees</p>
      </div>

      <div>
        <h2>{active}</h2>
        <p>Active</p>
      </div>

      <div>
        <h2>{employees.length - active}</h2>
        <p>Inactive</p>
      </div>
    </div>
  );
}