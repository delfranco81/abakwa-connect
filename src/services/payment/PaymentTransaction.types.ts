export type PaymentTransactionStatus =
  | "initiated"
  | "payment_pending"
  | "payment_received"
  | "provider_verification_pending"
  | "verified"
  | "failed"
  | "cancelled"
  | "under_review"
  | "refunded"
  | "disputed";

export interface PaymentTransaction {
  id: string;
  businessId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  paymentMethod: "mtn" | "orange";
  customerPhoneNumber: string;
  providerReference: string | null;
  status: PaymentTransactionStatus;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentTransactionRequest {
  businessId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  paymentMethod: "mtn" | "orange";
  phoneNumber: string;
  metadata?: Record<string, unknown>;
}
