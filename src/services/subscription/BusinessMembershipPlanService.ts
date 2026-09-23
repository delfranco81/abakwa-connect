import { supabase } from "@/core/database/supabase";

export type MembershipBillingType =
  | "free"
  | "monthly"
  | "yearly"
  | "one_time"
  | "invite_only";

export interface BusinessMembershipPlan {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  billingType: MembershipBillingType;
  amount: number;
  currency: string;
  active: boolean;
  approvalRequired: boolean;
  benefits: string[];
  settings: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessMembershipPlanInput {
  businessId: string;
  name: string;
  description?: string | null;
  billingType: MembershipBillingType;
  amount?: number;
  currency?: string;
  active?: boolean;
  approvalRequired?: boolean;
  benefits?: string[];
  settings?: Record<string, unknown>;
  sortOrder?: number;
}

export interface UpdateBusinessMembershipPlanInput {
  name?: string;
  description?: string | null;
  billingType?: MembershipBillingType;
  amount?: number;
  currency?: string;
  active?: boolean;
  approvalRequired?: boolean;
  benefits?: string[];
  settings?: Record<string, unknown>;
  sortOrder?: number;
}

class BusinessMembershipPlanService {
  private mapPlan(row: any): BusinessMembershipPlan {
    return {
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description ?? null,
      billingType: row.billing_type,
      amount: Number(row.amount ?? 0),
      currency: row.currency ?? "XAF",
      active: Boolean(row.active),
      approvalRequired: Boolean(row.approval_required),
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      settings:
        row.settings && typeof row.settings === "object"
          ? row.settings
          : {},
      sortOrder: Number(row.sort_order ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getPlansForBusiness(
    businessId: string
  ): Promise<BusinessMembershipPlan[]> {
    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    const { data, error } = await supabase
      .from("ecos_business_membership_plans")
      .select("*")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => this.mapPlan(row));
  }

  async getPlanById(
    planId: string
  ): Promise<BusinessMembershipPlan | null> {
    if (!planId) {
      throw new Error("Membership plan ID is required.");
    }

    const { data, error } = await supabase
      .from("ecos_business_membership_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? this.mapPlan(data) : null;
  }

  async createPlan(
    input: CreateBusinessMembershipPlanInput
  ): Promise<BusinessMembershipPlan> {
    if (!input.businessId) {
      throw new Error("Business ID is required.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("Membership plan name is required.");
    }

    const amount =
      input.billingType === "free" || input.billingType === "invite_only"
        ? 0
        : Math.max(0, Number(input.amount ?? 0));

    const { data, error } = await supabase
      .from("ecos_business_membership_plans")
      .insert({
        business_id: input.businessId,
        name,
        description: input.description?.trim() || null,
        billing_type: input.billingType,
        amount,
        currency: input.currency ?? "XAF",
        active: input.active ?? false,
        approval_required: input.approvalRequired ?? false,
        benefits: input.benefits ?? [],
        settings: input.settings ?? {},
        sort_order: input.sortOrder ?? 0,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapPlan(data);
  }

  async updatePlan(
    planId: string,
    input: UpdateBusinessMembershipPlanInput
  ): Promise<BusinessMembershipPlan> {
    if (!planId) {
      throw new Error("Membership plan ID is required.");
    }

    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw new Error("Membership plan name is required.");
      }

      payload.name = name;
    }

    if (input.description !== undefined) {
      payload.description = input.description?.trim() || null;
    }

    if (input.billingType !== undefined) {
      payload.billing_type = input.billingType;

      if (
        input.billingType === "free" ||
        input.billingType === "invite_only"
      ) {
        payload.amount = 0;
      }
    }

    if (input.amount !== undefined) {
      payload.amount = Math.max(0, Number(input.amount));
    }

    if (input.currency !== undefined) {
      payload.currency = input.currency;
    }

    if (input.active !== undefined) {
      payload.active = input.active;
    }

    if (input.approvalRequired !== undefined) {
      payload.approval_required = input.approvalRequired;
    }

    if (input.benefits !== undefined) {
      payload.benefits = input.benefits;
    }

    if (input.settings !== undefined) {
      payload.settings = input.settings;
    }

    if (input.sortOrder !== undefined) {
      payload.sort_order = input.sortOrder;
    }

    const { data, error } = await supabase
      .from("ecos_business_membership_plans")
      .update(payload)
      .eq("id", planId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapPlan(data);
  }

  async deletePlan(planId: string): Promise<void> {
    if (!planId) {
      throw new Error("MEMBERSHIP_PLAN_ID_REQUIRED");
    }

    const { count, error: membershipError } = await supabase
      .from("ecos_business_memberships")
      .select("id", { count: "exact", head: true })
      .eq("membership_plan_id", planId);

    if (membershipError) {
      throw new Error(membershipError.message);
    }

    if ((count ?? 0) > 0) {
      throw new Error("MEMBERSHIP_PLAN_HAS_MEMBERS");
    }

    const { error } = await supabase
      .from("ecos_business_membership_plans")
      .delete()
      .eq("id", planId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const businessMembershipPlanService =
  new BusinessMembershipPlanService();
