import { supabase } from "@/core/database/supabase";

export type SubscriptionPlan = "monthly" | "yearly";

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled";

export interface AgencySubscription {
  id: string;
  businessId: string;
  plan: SubscriptionPlan;
  amount: number;
  status: SubscriptionStatus;
  startedAt: string | null;
  expiresAt: string | null;
  paymentReference: string | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  monthly: 3000,
  yearly: 32400,
};

function mapSubscription(
  row: Record<string, unknown>
): AgencySubscription {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    plan: row.plan as SubscriptionPlan,
    amount: Number(row.amount ?? 0),
    status: row.status as SubscriptionStatus,
    startedAt: row.started_at
      ? String(row.started_at)
      : null,
    expiresAt: row.expires_at
      ? String(row.expires_at)
      : null,
    paymentReference: row.payment_reference
      ? String(row.payment_reference)
      : null,
    paymentMethod: row.payment_method
      ? String(row.payment_method)
      : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class AgencySubscriptionService {
  getPlanPrice(plan: SubscriptionPlan): number {
    return PLAN_PRICES[plan];
  }

  async createPendingSubscription(
    businessId: string,
    plan: SubscriptionPlan
  ): Promise<AgencySubscription> {
    const amount = this.getPlanPrice(plan);

    const { data, error } = await supabase
      .from("agency_subscriptions")
      .insert({
        business_id: businessId,
        plan,
        amount,
        status: "pending",
        payment_reference: null,
        payment_method: null,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "AgencySubscriptionService.createPendingSubscription:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to create subscription."
      );
    }

    return mapSubscription(data);
  }

  async getCurrentSubscription(
    businessId: string
  ): Promise<AgencySubscription | null> {
    const { data, error } = await supabase
      .from("agency_subscriptions")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "AgencySubscriptionService.getCurrentSubscription:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load subscription."
      );
    }

    if (!data) {
      return null;
    }

    return mapSubscription(data);
  }

  async activateSubscription(
    subscriptionId: string,
    paymentReference: string,
    paymentMethod: string
  ): Promise<AgencySubscription> {
    const subscription =
      await this.getSubscriptionById(
        subscriptionId
      );

    if (!subscription) {
      throw new Error(
        "Subscription was not found."
      );
    }

    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt
    );

    if (subscription.plan === "monthly") {
      expiresAt.setMonth(
        expiresAt.getMonth() + 1
      );
    } else {
      expiresAt.setFullYear(
        expiresAt.getFullYear() + 1
      );
    }

    const { data, error } = await supabase
      .from("agency_subscriptions")
      .update({
        status: "active",
        started_at:
          startedAt.toISOString(),
        expires_at:
          expiresAt.toISOString(),

        start_date:
          startedAt
            .toISOString()
            .split("T")[0],

        end_date:
          expiresAt
            .toISOString()
            .split("T")[0],

        payment_reference:
          paymentReference,

        payment_method:
          paymentMethod,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error(
        "AgencySubscriptionService.activateSubscription:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to activate subscription."
      );
    }

    return mapSubscription(data);
  }

  async getSubscriptionById(
    subscriptionId: string
  ): Promise<AgencySubscription | null> {
    const { data, error } = await supabase
      .from("agency_subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .maybeSingle();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load subscription."
      );
    }

    if (!data) {
      return null;
    }

    return mapSubscription(data);
  }

  async isSubscriptionActive(
    businessId: string
  ): Promise<boolean> {
    const subscription =
      await this.getCurrentSubscription(
        businessId
      );

    if (!subscription) {
      return false;
    }

    if (subscription.status !== "active") {
      return false;
    }

    if (!subscription.expiresAt) {
      return false;
    }

    return (
      new Date(subscription.expiresAt).getTime() >
      Date.now()
    );
  }

  async markExpiredSubscriptions(): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("agency_subscriptions")
      .update({
        status: "expired",
        updated_at: now,
      })
      .eq("status", "active")
      .lt("expires_at", now);

    if (error) {
      console.error(
        "AgencySubscriptionService.markExpiredSubscriptions:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update expired subscriptions."
      );
    }
  }
}

export const agencySubscriptionService =
  new AgencySubscriptionService();