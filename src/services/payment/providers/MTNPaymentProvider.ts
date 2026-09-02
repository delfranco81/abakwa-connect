import type {
  PaymentProvider,
  PaymentProviderInitiateRequest,
  PaymentProviderInitiateResult,
  PaymentProviderVerifyRequest,
  PaymentProviderVerifyResult,
} from "../PaymentProvider.types";

export class MTNPaymentProvider implements PaymentProvider {
  readonly id = "mtn" as const;

  async initiate(
    _request: PaymentProviderInitiateRequest
  ): Promise<PaymentProviderInitiateResult> {
    return {
      success: false,
      status: "pending",
      providerReference: null,
      message:
        "MTN Mobile Money payment integration is not configured yet.",
    };
  }

  async verify(
    request: PaymentProviderVerifyRequest
  ): Promise<PaymentProviderVerifyResult> {
    return {
      success: false,
      status: "pending",
      providerReference: request.providerReference,
      message:
        "MTN Mobile Money payment verification is not configured yet.",
    };
  }
}
