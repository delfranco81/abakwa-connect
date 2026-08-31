import type {
  PaymentMethod,
  PaymentRequest,
  PaymentResult,
} from "./PaymentTypes";

export class PaymentService {
  async initiatePayment(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    /*
     * The actual MTN/Orange API call will be
     * implemented once the payment provider/API
     * credentials are available.
     */

    console.log(
      "Payment request:",
      request
    );

    return {
      success: false,
      status: "pending",
      paymentReference: null,
      message:
        `Payment gateway integration for ${request.paymentMethod} is not configured yet.`,
    };
  }

  async verifyPayment(
    paymentReference: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult> {
    /*
     * This will call the payment provider's
     * verification endpoint.
     */

    console.log(
      "Verifying payment:",
      paymentReference,
      paymentMethod
    );

    return {
      success: false,
      status: "pending",
      paymentReference,
      message:
        "Payment verification is not configured yet.",
    };
  }
}

export const paymentService =
  new PaymentService();