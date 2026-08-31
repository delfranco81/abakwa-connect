import { useEffect, useState } from "react";

import EmployeeCard from "../../components/Employee/EmployeeCard";
import EmployeeStats from "../../components/Employee/EmployeeStats";

import { supabase } from "../../lib/supabase";

import { getEmployees } from "../../services/employee/employeeService";

import type { Employee } from "../../types/employee";

export default function Employees() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  useEffect(() => {
    void loadEmployees();
  }, []);

  async function getOwnerBusinessId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: business, error } =
      await supabase
        .from("business")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();

    if (error) {
      console.error(
        "OWNER BUSINESS LOOKUP ERROR:",
        error
      );

      return null;
    }

    return business?.id ?? null;
  }

  async function loadEmployees() {
    const businessId =
      await getOwnerBusinessId();

    if (!businessId) {
      setEmployees([]);
      return;
    }

    try {
      const { data } =
        await getEmployees(businessId);

      setEmployees(data || []);
    } catch (error) {
      console.error(
        "EMPLOYEE LOAD ERROR:",
        error
      );

      setEmployees([]);
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Employees</h1>

      <EmployeeStats
        employees={employees}
      />

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
    </div>
  );
}
