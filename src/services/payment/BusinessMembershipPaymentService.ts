import type {
  PaymentMethod,
  PaymentResult,
} from "./PaymentTypes";
import { supabase } from "@/core/database/supabase";

interface CreateMembershipPaymentResponse {
  success: boolean;
  message?: string;
  transaction?: {
    id: string;
    userId: string;
    businessId: string;
    subscriptionId: string | null;
    membershipId: string;
    businessPaymentAccountId: string;
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

export interface MembershipPaymentRequest {
  membershipId: string;
  businessPaymentAccountId: string;
  paymentMethod: PaymentMethod;
  customerPhoneNumber: string;
}

export interface MembershipPaymentTransaction {
  id: string;
  userId: string;
  businessId: string;
  membershipId: string;
  businessPaymentAccountId: string;
  verifiedEmail: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  providerReference: string | null;
  status: string;
  initiatedAt: string;
  createdAt: string;
}

export class BusinessMembershipPaymentService {
  async initiatePayment(
    request: MembershipPaymentRequest
  ): Promise<PaymentResult & {
    membershipId?: string | null;
    businessPaymentAccountId?: string | null;
  }> {
    try {
      const membershipId =
        request.membershipId.trim();

      const businessPaymentAccountId =
        request.businessPaymentAccountId.trim();

      const customerPhoneNumber =
        request.customerPhoneNumber.trim();

      if (!membershipId) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            "A membership ID is required.",
        };
      }

      if (!businessPaymentAccountId) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            "A business payment account is required.",
        };
      }

      if (!customerPhoneNumber) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            "A customer phone number is required.",
        };
      }

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            "Unable to verify your account session.",
        };
      }

      if (!sessionData.session) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            "Please sign in before starting a membership payment.",
        };
      }

      const {
        data,
        error,
      } =
        await supabase.functions.invoke<CreateMembershipPaymentResponse>(
          "create-membership-payment",
          {
            body: {
              membershipId,
              businessPaymentAccountId,
              paymentMethod:
                request.paymentMethod,
              customerPhoneNumber,
            },
          }
        );

      if (error) {
        console.error(
          "BusinessMembershipPaymentService.initiatePayment:",
          error
        );

        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            error.message ||
            "Unable to create membership payment transaction.",
        };
      }

      if (
        !data?.success ||
        !data.transaction
      ) {
        return {
          success: false,
          status: "failed",
          paymentReference: null,
          transactionId: null,
          message:
            data?.message ||
            "Unable to create membership payment transaction.",
        };
      }

      return {
        success: true,
        status: "pending",
        paymentReference:
          data.transaction
            .providerReference,
        transactionId:
          data.transaction.id,
        membershipId:
          data.transaction.membershipId,
        businessPaymentAccountId:
          data.transaction
            .businessPaymentAccountId,
        message:
          "Membership payment transaction created. Waiting for payment provider processing.",
      };
    } catch (error) {
      console.error(
        "Unexpected membership payment error:",
        error
      );

      return {
        success: false,
        status: "failed",
        paymentReference: null,
        transactionId: null,
        message:
          error instanceof Error
            ? error.message
            : "Unable to start membership payment.",
      };
    }
  }
}

export const businessMembershipPaymentService =
  new BusinessMembershipPaymentService();
