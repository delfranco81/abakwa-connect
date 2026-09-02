import { supabase } from "@/core/database/supabase";

import type { Employee } from "@/types/employee";

export async function getEmployees(
  businessId: string
): Promise<{
  data: Employee[];
}> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getEmployees:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to load employees."
    );
  }

  return {
    data: (data ?? []) as Employee[],
  };
}


export class EmployeeService {
  async getEmployees(
    businessId: string
  ): Promise<{
    data: Employee[];
  }> {
    return getEmployees(businessId);
  }

  async inviteEmployee(
    email: string
  ) {
    console.log(
      "Invite employee:",
      email
    );
  }

  async suspendEmployee(
    id: string
  ) {
    console.log(
      "Suspend employee:",
      id
    );
  }

  async removeEmployee(
    id: string
  ) {
    console.log(
      "Remove employee:",
      id
    );
  }
}
