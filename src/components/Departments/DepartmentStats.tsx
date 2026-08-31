import type { Department } from "../../types/department";

interface Props {
  departments: Department[];
}

export default function DepartmentStats({
  departments,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        marginBottom: 25,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h2>{departments.length}</h2>
        <p>Total Departments</p>
      </div>
    </div>
  );
}