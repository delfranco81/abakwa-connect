import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import type { Department } from "../../types/department";

import DepartmentCard from "../../components/Departments/DepartmentCard";

import DepartmentStats from "../../components/Departments/DepartmentStats";

import DepartmentForm from "../../components/Departments/DepartmentForm";

import {
  createDepartment,
  getDepartments,
} from "../../services/employee/departmentService";

export default function Departments() {
  const [departments, setDepartments] =
    useState<Department[]>([]);

  useEffect(() => {
    void loadDepartments();
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

  async function loadDepartments() {
    const businessId =
      await getOwnerBusinessId();

    if (!businessId) {
      setDepartments([]);
      return;
    }

    const { data, error } =
      await getDepartments(businessId);

    if (error) {
      console.error(
        "DEPARTMENT LOAD ERROR:",
        error
      );

      return;
    }

    setDepartments(data || []);
  }

  async function handleCreate(
    department: Partial<Department>
  ) {
    const businessId =
      await getOwnerBusinessId();

    if (!businessId) {
      alert(
        "No business is associated with your account."
      );
      return;
    }

    const { error } =
      await createDepartment({
        ...department,
        business_id: businessId,
      });

    if (error) {
      console.error(
        "DEPARTMENT CREATE ERROR:",
        error
      );

      alert(error.message);
      return;
    }

    await loadDepartments();
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Departments</h1>

      <DepartmentStats
        departments={departments}
      />

      <DepartmentForm
        onSubmit={handleCreate}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(260px,1fr))",
          gap: 20,
          marginTop: 25,
        }}
      >
        {departments.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
          />
        ))}
      </div>
    </div>
  );
}
