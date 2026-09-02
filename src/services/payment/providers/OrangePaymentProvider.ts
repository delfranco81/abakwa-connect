import type {
  PaymentProvider,
  PaymentProviderInitiateRequest,
  PaymentProviderInitiateResult,
  PaymentProviderVerifyRequest,
  PaymentProviderVerifyResult,
} from "../PaymentProvider.types";

export class OrangePaymentProvider implements PaymentProvider {
  readonly id = "orange" as const;

  async initiate(
    _request: PaymentProviderInitiateRequest
  ): Promise<PaymentProviderInitiateResult> {
    return {
      success: false,
      status: "pending",
      providerReference: null,
      message:
        "Orange Money payment integration is not configured yet.",
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
        "Orange Money payment verification is not configured yet.",
    };
  }
}
