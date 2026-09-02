export type PaymentProviderId = "mtn" | "orange";

export type PaymentProviderTransactionStatus =
  | "pending"
  | "successful"
  | "failed"
  | "cancelled"
  | "unknown";

export interface PaymentProviderInitiateRequest {
  transactionId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  description: string;
}

export interface PaymentProviderInitiateResult {
  success: boolean;
  status: PaymentProviderTransactionStatus;
  providerReference: string | null;
  message: string;
}

export interface PaymentProviderVerifyRequest {
  transactionId: string;
  providerReference: string;
}

export interface PaymentProviderVerifyResult {
  success: boolean;
  status: PaymentProviderTransactionStatus;
  providerReference: string | null;
  message: string;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  initiate(
    request: PaymentProviderInitiateRequest
  ): Promise<PaymentProviderInitiateResult>;
  verify(
    request: PaymentProviderVerifyRequest
  ): Promise<PaymentProviderVerifyResult>;
}
