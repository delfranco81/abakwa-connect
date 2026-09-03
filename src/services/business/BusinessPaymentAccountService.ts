import { supabase } from "@/core/database/supabase";

export type BusinessPaymentProvider =
  | "mtn"
  | "orange"
  | "bank"
  | "other";

export interface BusinessPaymentAccount {
  id: string;
  businessId: string;
  provider: BusinessPaymentProvider;
  accountName: string | null;
  accountIdentifier: string;
  displayName: string | null;
  isEnabled: boolean;
  isVerified: boolean;
  isDefault: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessPaymentAccountInput {
  businessId: string;
  provider: BusinessPaymentProvider;
  accountName?: string | null;
  accountIdentifier: string;
  displayName?: string | null;
  isEnabled?: boolean;
  isVerified?: boolean;
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
}

function mapPaymentAccount(
  row: Record<string, unknown>
): BusinessPaymentAccount {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    provider: row.provider as BusinessPaymentProvider,
    accountName: row.account_name
      ? String(row.account_name)
      : null,
    accountIdentifier: String(
      row.account_identifier ?? ""
    ),
    displayName: row.display_name
      ? String(row.display_name)
      : null,
    isEnabled: Boolean(row.is_enabled),
    isVerified: Boolean(row.is_verified),
    isDefault: Boolean(row.is_default),
    metadata:
      row.metadata &&
      typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export class BusinessPaymentAccountService {
  async getBusinessPaymentAccounts(
    businessId: string
  ): Promise<BusinessPaymentAccount[]> {
    const normalizedBusinessId =
      businessId.trim();

    if (!normalizedBusinessId) {
      throw new Error(
        "A business ID is required."
      );
    }

    const { data, error } = await supabase
      .from("ecos_business_payment_accounts")
      .select("*")
      .eq("business_id", normalizedBusinessId)
      .order("is_default", {
        ascending: false,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "BusinessPaymentAccountService.getBusinessPaymentAccounts:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load business payment accounts."
      );
    }

    return (data ?? []).map((row) =>
      mapPaymentAccount(
        row as Record<string, unknown>
      )
    );
  }

  async getCustomerPaymentAccounts(
    businessId: string
  ): Promise<BusinessPaymentAccount[]> {
    const normalizedBusinessId =
      businessId.trim();

    if (!normalizedBusinessId) {
      return [];
    }

    const { data, error } = await supabase
      .from("ecos_business_payment_accounts")
      .select("*")
      .eq("business_id", normalizedBusinessId)
      .eq("is_enabled", true)
      .eq("is_verified", true)
      .order("is_default", {
        ascending: false,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "BusinessPaymentAccountService.getCustomerPaymentAccounts:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load available payment methods."
      );
    }

    return (data ?? []).map((row) =>
      mapPaymentAccount(
        row as Record<string, unknown>
      )
    );
  }

  async addPaymentAccount(
    input: CreateBusinessPaymentAccountInput
  ): Promise<BusinessPaymentAccount> {
    const businessId = input.businessId.trim();
    const accountIdentifier =
      input.accountIdentifier.trim();

    if (!businessId) {
      throw new Error(
        "A business ID is required."
      );
    }

    if (!accountIdentifier) {
      throw new Error(
        "A payment account identifier is required."
      );
    }

    const { data, error } = await supabase
      .from("ecos_business_payment_accounts")
      .insert({
        business_id: businessId,
        provider: input.provider,
        account_name:
          input.accountName ?? null,
        account_identifier:
          accountIdentifier,
        display_name:
          input.displayName ?? null,
        is_enabled:
          input.isEnabled ?? true,
        is_verified:
          input.isVerified ?? false,
        is_default:
          input.isDefault ?? false,
        metadata:
          input.metadata ?? {},
      })
      .select()
      .single();

    if (error) {
      console.error(
        "BusinessPaymentAccountService.addPaymentAccount:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to add payment account."
      );
    }

    return mapPaymentAccount(
      data as Record<string, unknown>
    );
  }

  async updatePaymentAccount(
    accountId: string,
    updates: Partial<
      Pick<
        BusinessPaymentAccount,
        | "accountName"
        | "accountIdentifier"
        | "displayName"
        | "isEnabled"
        | "isDefault"
        | "metadata"
      >
    >
  ): Promise<BusinessPaymentAccount> {
    const normalizedAccountId =
      accountId.trim();

    if (!normalizedAccountId) {
      throw new Error(
        "A payment account ID is required."
      );
    }

    const payload: Record<string, unknown> = {};

    if (
      updates.accountName !== undefined
    ) {
      payload.account_name =
        updates.accountName;
    }

    if (
      updates.accountIdentifier !== undefined
    ) {
      payload.account_identifier =
        updates.accountIdentifier.trim();
    }

    if (
      updates.displayName !== undefined
    ) {
      payload.display_name =
        updates.displayName;
    }

    if (
      updates.isEnabled !== undefined
    ) {
      payload.is_enabled =
        updates.isEnabled;
    }

    if (
      updates.isDefault !== undefined
    ) {
      payload.is_default =
        updates.isDefault;
    }

    if (updates.metadata !== undefined) {
      payload.metadata = updates.metadata;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error(
        "No payment account changes were provided."
      );
    }

    const { data, error } = await supabase
      .from("ecos_business_payment_accounts")
      .update(payload)
      .eq("id", normalizedAccountId)
      .select()
      .single();

    if (error) {
      console.error(
        "BusinessPaymentAccountService.updatePaymentAccount:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to update payment account."
      );
    }

    return mapPaymentAccount(
      data as Record<string, unknown>
    );
  }

  async setDefaultPaymentAccount(
    accountId: string
  ): Promise<BusinessPaymentAccount> {
    const normalizedAccountId =
      accountId.trim();

    if (!normalizedAccountId) {
      throw new Error(
        "A payment account ID is required."
      );
    }

    const { data: account, error: accountError } =
      await supabase
        .from("ecos_business_payment_accounts")
        .select("id, business_id")
        .eq("id", normalizedAccountId)
        .maybeSingle();

    if (accountError) {
      throw new Error(
        accountError.message ||
          "Unable to find payment account."
      );
    }

    if (!account) {
      throw new Error(
        "Payment account was not found."
      );
    }

    const { error: clearError } =
      await supabase
        .from(
          "ecos_business_payment_accounts"
        )
        .update({
          is_default: false,
        })
        .eq(
          "business_id",
          account.business_id
        );

    if (clearError) {
      throw new Error(
        clearError.message ||
          "Unable to update default payment account."
      );
    }

    const { data, error } = await supabase
      .from("ecos_business_payment_accounts")
      .update({
        is_default: true,
        is_enabled: true,
      })
      .eq("id", normalizedAccountId)
      .select()
      .single();

    if (error) {
      console.error(
        "BusinessPaymentAccountService.setDefaultPaymentAccount:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to set default payment account."
      );
    }

    return mapPaymentAccount(
      data as Record<string, unknown>
    );
  }

  async removePaymentAccount(
    accountId: string
  ): Promise<void> {
    const normalizedAccountId =
      accountId.trim();

    if (!normalizedAccountId) {
      throw new Error(
        "A payment account ID is required."
      );
    }

    const { error } = await supabase
      .from("ecos_business_payment_accounts")
      .delete()
      .eq("id", normalizedAccountId);

    if (error) {
      console.error(
        "BusinessPaymentAccountService.removePaymentAccount:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to remove payment account."
      );
    }
  }
}

export const businessPaymentAccountService =
  new BusinessPaymentAccountService();
