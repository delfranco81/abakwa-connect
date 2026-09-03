import { supabase } from "@/core/database/supabase";

export type BusinessMembershipBillingType =
  | "free"
  | "monthly"
  | "yearly"
  | "one_time"
  | "invite_only";

export type BusinessMembershipStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled"
  | "suspended"
  | "rejected";

export interface BusinessMembershipPlan {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  billingType: BusinessMembershipBillingType;
  amount: number;
  currency: string;
  active: boolean;
  approvalRequired: boolean;
  benefits: unknown[];
  settings: Record<string, unknown>;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMembership {
  id: string;
  businessId: string;
  customerId: string;
  membershipPlanId: string;
  status: BusinessMembershipStatus;
  paymentTransactionId: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipPlanInput {
  businessId: string;
  name: string;
  description?: string | null;
  billingType?: BusinessMembershipBillingType;
  amount?: number;
  currency?: string;
  active?: boolean;
  approvalRequired?: boolean;
  benefits?: unknown[];
  settings?: Record<string, unknown>;
  sortOrder?: number;
}

function mapMembershipPlan(
  row: Record<string, unknown>
): BusinessMembershipPlan {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    name: String(row.name),
    description: row.description
      ? String(row.description)
      : null,
    billingType:
      row.billing_type as BusinessMembershipBillingType,
    amount: Number(row.amount ?? 0),
    currency: String(
      row.currency ?? "XAF"
    ),
    active: Boolean(row.active),
    approvalRequired: Boolean(
      row.approval_required
    ),
    benefits: Array.isArray(row.benefits)
      ? row.benefits
      : [],
    settings:
      row.settings &&
      typeof row.settings === "object"
        ? (row.settings as Record<string, unknown>)
        : {},
    sortOrder: Number(
      row.sort_order ?? 0
    ),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMembership(
  row: Record<string, unknown>
): BusinessMembership {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    customerId: String(row.customer_id),
    membershipPlanId: String(
      row.membership_plan_id
    ),
    status:
      row.status as BusinessMembershipStatus,
    paymentTransactionId:
      row.payment_transaction_id
        ? String(
            row.payment_transaction_id
          )
        : null,
    startedAt: row.started_at
      ? String(row.started_at)
      : null,
    expiresAt: row.expires_at
      ? String(row.expires_at)
      : null,
    cancelledAt: row.cancelled_at
      ? String(row.cancelled_at)
      : null,
    metadata:
      row.metadata &&
      typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class BusinessMembershipService {
  async getBusinessMembershipPlans(
    businessId: string,
    includeInactive = false
  ): Promise<BusinessMembershipPlan[]> {
    const normalizedBusinessId =
      businessId.trim();

    if (!normalizedBusinessId) {
      return [];
    }

    let query = supabase
      .from("ecos_business_membership_plans")
      .select("*")
      .eq("business_id", normalizedBusinessId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (!includeInactive) {
      query = query.eq("active", true);
    }

    const { data, error } =
      await query;

    if (error) {
      console.error(
        "BusinessMembershipService.getBusinessMembershipPlans:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load membership plans."
      );
    }

    return (data ?? []).map((row) =>
      mapMembershipPlan(
        row as Record<string, unknown>
      )
    );
  }

  async createMembershipPlan(
    input: CreateMembershipPlanInput
  ): Promise<BusinessMembershipPlan> {
    const businessId =
      input.businessId.trim();
    const name = input.name.trim();
    const amount = input.amount ?? 0;

    if (!businessId) {
      throw new Error(
        "A business ID is required."
      );
    }

    if (!name) {
      throw new Error(
        "A membership plan name is required."
      );
    }

    if (amount < 0) {
      throw new Error(
        "Membership amount cannot be negative."
      );
    }

    const billingType =
      input.billingType ?? "monthly";

    const { data, error } = await supabase
      .from(
        "ecos_business_membership_plans"
      )
      .insert({
        business_id: businessId,
        name,
        description:
          input.description ?? null,
        billing_type: billingType,
        amount,
        currency:
          input.currency ?? "XAF",
        active:
          input.active ?? true,
        approval_required:
          input.approvalRequired ?? false,
        benefits:
          input.benefits ?? [],
        settings:
          input.settings ?? {},
        sort_order:
          input.sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "BusinessMembershipService.createMembershipPlan:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to create membership plan."
      );
    }

    return mapMembershipPlan(
      data as Record<string, unknown>
    );
  }

  async updateMembershipPlan(
    planId: string,
    updates: Partial<
      Pick<
        BusinessMembershipPlan,
        | "name"
        | "description"
        | "billingType"
        | "amount"
        | "active"
        | "approvalRequired"
        | "benefits"
        | "settings"
        | "sortOrder"
      >
    >
  ): Promise<BusinessMembershipPlan> {
    const normalizedPlanId =
      planId.trim();

    if (!normalizedPlanId) {
      throw new Error(
        "A membership plan ID is required."
      );
    }

    const payload: Record<string, unknown> = {};

    if (updates.name !== undefined) {
      const name = updates.name.trim();

      if (!name) {
        throw new Error(
          "Membership plan name cannot be empty."
        );
      }

      payload.name = name;
    }

    if (
      updates.description !== undefined
    ) {
      payload.description =
        updates.description;
    }

    if (
      updates.billingType !== undefined
    ) {
      payload.billing_type =
        updates.billingType;
    }

    if (updates.amount !== undefined) {
      if (updates.amount < 0) {
        throw new Error(
          "Membership amount cannot be negative."
        );
      }

      payload.amount = updates.amount;
    }

    if (updates.active !== undefined) {
      payload.active = updates.active;
    }

    if (
      updates.approvalRequired !== undefined
    ) {
      payload.approval_required =
        updates.approvalRequired;
    }

    if (updates.benefits !== undefined) {
      payload.benefits = updates.benefits;
    }

    if (updates.settings !== undefined) {
      payload.settings = updates.settings;
    }

    if (
      updates.sortOrder !== undefined
    ) {
      payload.sort_order =
        updates.sortOrder;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error(
        "No membership plan changes were provided."
      );
    }

    const { data, error } = await supabase
      .from(
        "ecos_business_membership_plans"
      )
      .update(payload)
      .eq("id", normalizedPlanId)
      .select()
      .single();

    if (error) {
      console.error(
        "BusinessMembershipService.updateMembershipPlan:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update membership plan."
      );
    }

    return mapMembershipPlan(
      data as Record<string, unknown>
    );
  }

  async deactivateMembershipPlan(
    planId: string
  ): Promise<BusinessMembershipPlan> {
    return this.updateMembershipPlan(
      planId,
      {
        active: false,
      }
    );
  }

  async getBusinessMemberships(
    businessId: string
  ): Promise<BusinessMembership[]> {
    const normalizedBusinessId =
      businessId.trim();

    if (!normalizedBusinessId) {
      return [];
    }

    const { data, error } = await supabase
      .from("ecos_business_memberships")
      .select("*")
      .eq("business_id", normalizedBusinessId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "BusinessMembershipService.getBusinessMemberships:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load business memberships."
      );
    }

    return (data ?? []).map((row) =>
      mapMembership(
        row as Record<string, unknown>
      )
    );
  }

  async getCustomerMemberships(
    customerId?: string
  ): Promise<BusinessMembership[]> {
    let query = supabase
      .from("ecos_business_memberships")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (customerId?.trim()) {
      query = query.eq(
        "customer_id",
        customerId.trim()
      );
    }

    const { data, error } =
      await query;

    if (error) {
      console.error(
        "BusinessMembershipService.getCustomerMemberships:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load customer memberships."
      );
    }

    return (data ?? []).map((row) =>
      mapMembership(
        row as Record<string, unknown>
      )
    );
  }

  async getMyMembershipForBusiness(
    businessId: string
  ): Promise<BusinessMembership | null> {
    const normalizedBusinessId =
      businessId.trim();

    if (!normalizedBusinessId) {
      return null;
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(
        authError.message
      );
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("ecos_business_memberships")
      .select("*")
      .eq("business_id", normalizedBusinessId)
      .eq("customer_id", user.id)
      .in("status", [
        "pending",
        "active",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "BusinessMembershipService.getMyMembershipForBusiness:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load your business membership."
      );
    }

    if (!data) {
      return null;
    }

    return mapMembership(
      data as Record<string, unknown>
    );
  }

  async requestMembership(
    businessId: string,
    membershipPlanId: string
  ): Promise<string> {
    const normalizedBusinessId =
      businessId.trim();
    const normalizedPlanId =
      membershipPlanId.trim();

    if (!normalizedBusinessId) {
      throw new Error(
        "A business ID is required."
      );
    }

    if (!normalizedPlanId) {
      throw new Error(
        "A membership plan ID is required."
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(
        authError.message
      );
    }

    if (!user) {
      throw new Error(
        "Please sign in before joining a business."
      );
    }

    const { data, error } =
      await supabase.rpc(
        "create_pending_business_membership",
        {
          p_business_id:
            normalizedBusinessId,
          p_membership_plan_id:
            normalizedPlanId,
        }
      );

    if (error) {
      console.error(
        "BusinessMembershipService.requestMembership:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to request business membership."
      );
    }

    if (!data) {
      throw new Error(
        "The membership request did not return an ID."
      );
    }

    return String(data);
  }

  async getMembershipById(
    membershipId: string
  ): Promise<BusinessMembership | null> {
    const normalizedMembershipId =
      membershipId.trim();

    if (!normalizedMembershipId) {
      return null;
    }

    const { data, error } = await supabase
      .from("ecos_business_memberships")
      .select("*")
      .eq("id", normalizedMembershipId)
      .maybeSingle();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load membership."
      );
    }

    if (!data) {
      return null;
    }

    return mapMembership(
      data as Record<string, unknown>
    );
  }
}

export const businessMembershipService =
  new BusinessMembershipService();
