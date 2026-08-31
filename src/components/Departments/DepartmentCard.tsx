import type { Department } from "../../types/department";

interface Props {
  department: Department;
}

export default function DepartmentCard({
  department,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          width: 15,
          height: 15,
          borderRadius: "50%",
          background: department.color,
          marginBottom: 10,
        }}
      />

      <h3>{department.name}</h3>

      <p>{department.description}</p>
    </div>
  );
}