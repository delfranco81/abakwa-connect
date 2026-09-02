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

export class PaymentService {
  /**
   * Creates the authoritative payment transaction
   * through the server-side Supabase Edge Function.
   *
   * The browser does NOT determine:
   * - the authenticated user
   * - the verified email
   * - the subscription amount
   * - business ownership
   *
   * Those values are verified server-side.
   */
  async initiatePayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Unable to retrieve payment session:",
          sessionError
        );

        return {
          success: false,
          status: "failed",
          paymentReference: null,
          message:
            "Unable to verify your account session.",
        };
      }

      if (!sessionData.session) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          message:
            "Please sign in before starting a payment.",
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
        console.error(
          "Payment transaction function error:",
          error
        );

        return {
          success: false,
          status: "failed",
          paymentReference: null,
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
          message:
            data?.message ||
            "Unable to create payment transaction.",
        };
      }

      /*
       * The transaction has only been created.
       *
       * It has NOT been verified by MTN or Orange.
       */
      return {
        success: true,
        status: "pending",
        paymentReference:
          data.transaction.providerReference,
        message:
          "Payment transaction created. Waiting for payment provider processing.",
      };
    } catch (error) {
      console.error(
        "Unexpected payment service error:",
        error
      );

      return {
        success: false,
        status: "failed",
        paymentReference: null,
        message:
          error instanceof Error
            ? error.message
            : "Unable to start payment.",
      };
    }
  }

  /**
   * Provider verification will be connected here
   * after the official MTN and Orange API credentials
   * and documentation are available.
   */
  async verifyPayment(
    _paymentReference: string,
    _paymentMethod: PaymentMethod,
    _subscriptionId?: string
  ): Promise<PaymentResult> {
    return {
      success: false,
      status: "pending",
      paymentReference: _paymentReference,
      message:
        "Payment provider verification is not configured yet.",
    };
  }
}

export const paymentService =
  new PaymentService();
