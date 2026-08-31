import { supabase } from "../../lib/supabase";
import type { Department } from "../../types/department";

export async function getDepartments(businessId: string) {
  return supabase
    .from("departments")
    .select("*")
    .eq("business_id", businessId)
    .order("name");
}

export async function createDepartment(
  department: Partial<Department>
) {
  return supabase
    .from("departments")
    .insert(department);
}

export async function updateDepartment(
  id: string,
  department: Partial<Department>
) {
  return supabase
    .from("departments")
    .update(department)
    .eq("id", id);
}

export async function deleteDepartment(id: string) {
  return supabase
    .from("departments")
    .delete()
    .eq("id", id);
}