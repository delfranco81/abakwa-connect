export type PaymentMethod =
  | "mtn"
  | "orange";

export type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "cancelled";

export interface PaymentRequest {
  businessId: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  paymentReference: string | null;
  message: string;
}