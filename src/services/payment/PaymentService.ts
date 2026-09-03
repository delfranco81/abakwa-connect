import type {
  PaymentMethod,
  PaymentRequest,
  PaymentResult,
} from "./PaymentTypes";
import { supabase } from "@/core/database/supabase";

interface CreatePaymentTransactionResponse {
  success: boolean;
  message?: string;
  transaction?: {
    id: string;
    userId: string;
    businessId: string;
    subscriptionId: string | null;
    verifiedEmail: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    providerReference: string | null;
    status: string;
    initiatedAt: string;
    createdAt: string;
  };
}

interface VerifyPaymentTransactionResponse {
  success: boolean;
  status?: string;
  message?: string;
  transaction?: {
    id: string;
    businessId: string;
    subscriptionId: string | null;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    providerReference: string | null;
    status: string;
    verifiedAt?: string | null;
  };
}

export class PaymentService {
  async initiatePayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message: "Unable to verify your account session.",
        };
      }

      if (!sessionData.session) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message: "Please sign in before starting a payment.",
        };
      }

      const { data, error } =
        await supabase.functions.invoke<CreatePaymentTransactionResponse>(
          "create-payment-transaction",
          {
            body: {
              businessId: request.businessId,
              subscriptionId: request.subscriptionId,
              paymentMethod: request.paymentMethod,
              phoneNumber: request.phoneNumber,
            },
          }
        );

      if (error) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            error.message ||
            "Unable to create payment transaction.",
        };
      }

      if (!data?.success || !data.transaction) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            data?.message ||
            "Unable to create payment transaction.",
        };
      }

      return {
        success: true,
        status: "pending",
        paymentReference:
          data.transaction.providerReference,
        transactionId: data.transaction.id,
        message:
          "Payment transaction created. Waiting for payment provider processing.",
      };
    } catch (error) {
      return {
        success: false,
        status: "failed",
        paymentReference: null,
        transactionId: null,
        message:
          error instanceof Error
            ? error.message
            : "Unable to start payment.",
      };
    }
  }

  async verifyPayment(
    paymentReference: string,
    transactionId?: string
  ): Promise<PaymentResult> {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        return {
          success: false,
          status: "failed",
          paymentReference,
          transactionId: transactionId ?? null,
          message: "Unable to verify your account session.",
        };
      }

      if (!sessionData.session) {
        return {
          success: false,
          status: "failed",
          paymentReference,
          transactionId: transactionId ?? null,
          message: "Please sign in before verifying a payment.",
        };
      }

      if (!transactionId?.trim()) {
        return {
          success: false,
          status: "failed",
          paymentReference,
          transactionId: null,
          message: "A payment transaction ID is required.",
        };
      }

      if (!paymentReference.trim()) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId,
          message: "A payment reference is required.",
        };
      }

      const { data, error } =
        await supabase.functions.invoke<VerifyPaymentTransactionResponse>(
          "verify-payment-transaction",
          {
            body: {
              transactionId: transactionId.trim(),
              providerReference: paymentReference.trim(),
            },
          }
        );

      if (error) {
        return {
          success: false,
          status: "failed",
          paymentReference,
          transactionId,
          message:
            error.message ||
            "Unable to verify payment transaction.",
        };
      }

      if (!data) {
        return {
          success: false,
          status: "pending",
          paymentReference,
          transactionId,
          message:
            "Payment verification is still pending.",
        };
      }

      const providerReference =
        data.transaction?.providerReference ??
        paymentReference;

      switch (data.status) {
        case "verified":
        case "already_verified":
        case "activated":
          return {
            success: true,
            status: "successful",
            paymentReference: providerReference,
            transactionId:
              data.transaction?.id ?? transactionId,
            message:
              data.message ||
              "Payment verified successfully.",
          };

        case "failed":
        case "cancelled":
        case "refunded":
        case "disputed":
          return {
            success: false,
            status:
              data.status === "cancelled"
                ? "cancelled"
                : "failed",
            paymentReference: providerReference,
            transactionId:
              data.transaction?.id ?? transactionId,
            message:
              data.message ||
              "Payment verification failed.",
          };

        default:
          return {
            success: false,
            status: "pending",
            paymentReference: providerReference,
            transactionId:
              data.transaction?.id ?? transactionId,
            message:
              data.message ||
              "Payment verification is still pending.",
          };
      }
    } catch (error) {
      return {
        success: false,
        status: "failed",
        paymentReference,
        transactionId: transactionId ?? null,
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      };
    }
  }
}

export const paymentService = new PaymentService();
