import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EmployeeCard from "../../components/Employee/EmployeeCard";
import EmployeeStats from "../../components/Employee/EmployeeStats";

import { getEmployees } from "../../services/employee/employeeService";
import { getOwnedBusinessById } from "../../services/business/BusinessOwnerService";

import type { Employee } from "../../types/employee";

export default function Employees() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
      setErrorMessage("");

      if (!businessId) {
        setEmployees([]);
        setErrorMessage("No business was selected.");
        setLoading(false);
        return;
      }

      try {
        const ownedBusiness = await getOwnedBusinessById(businessId);

        if (!ownedBusiness) {
          setEmployees([]);
          setErrorMessage(
            "Business not found or you do not have permission to manage it."
          );
          return;
        }

        const { data } = await getEmployees(ownedBusiness.id);
        setEmployees(data ?? []);
      } catch (error) {
        console.error("EMPLOYEE LOAD ERROR:", error);
        setEmployees([]);
        setErrorMessage("Unable to load employees.");
      } finally {
        setLoading(false);
      }
    }

    void loadEmployees();
  }, [businessId]);

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        <h1>Employees</h1>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Employees</h1>

      {errorMessage && (
        <p style={{ color: "#b91c1c" }}>
          {errorMessage}
        </p>
      )}

      <EmployeeStats employees={employees} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
          />
        ))}
      </div>

      {!errorMessage && employees.length === 0 && (
        <p style={{ marginTop: 24 }}>
          No employees have been added to this business yet.
        </p>
      )}
    </div>
  );
}
