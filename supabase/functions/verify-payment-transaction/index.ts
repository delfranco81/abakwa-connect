import { withSupabase } from "npm:@supabase/server@^1";

interface VerifyPaymentRequest {
  transactionId?: unknown;
  providerReference?: unknown;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json(
        {
          success: false,
          message: "Only POST requests are allowed.",
        },
        { status: 405 },
      );
    }

    let payload: VerifyPaymentRequest;

    try {
      payload = await req.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    const userId = ctx.userClaims?.sub;
    const verifiedEmail = ctx.userClaims?.email;

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Authenticated user could not be identified.",
        },
        { status: 401 },
      );
    }

    if (!verifiedEmail) {
      return Response.json(
        {
          success: false,
          message: "Authenticated email could not be verified.",
        },
        { status: 401 },
      );
    }

    const transactionId =
      typeof payload.transactionId === "string"
        ? payload.transactionId.trim()
        : "";

    const suppliedProviderReference =
      typeof payload.providerReference === "string"
        ? payload.providerReference.trim()
        : "";

    if (!transactionId) {
      return Response.json(
        {
          success: false,
          message: "transactionId is required.",
        },
        { status: 400 },
      );
    }

    const { data: transaction, error: transactionError } =
      await ctx.supabaseAdmin
        .from("payment_transactions")
        .select(
          [
            "id",
            "user_id",
            "business_id",
            "subscription_id",
            "verified_email",
            "amount",
            "currency",
            "payment_method",
            "provider_reference",
            "status",
            "initiated_at",
            "payment_received_at",
            "verified_at",
            "failed_at",
            "cancelled_at",
            "metadata",
            "created_at",
            "updated_at",
          ].join(", "),
        )
        .eq("id", transactionId)
        .eq("user_id", userId)
        .maybeSingle();

    if (transactionError) {
      console.error(
        "Failed to retrieve payment transaction:",
        transactionError,
      );

      return Response.json(
        {
          success: false,
          message: "Unable to retrieve the payment transaction.",
        },
        { status: 500 },
      );
    }

    if (!transaction) {
      return Response.json(
        {
          success: false,
        message: "Payment transaction was not found.",
        },
        { status: 404 },
      );
    }

    if (transaction.verified_email !== verifiedEmail) {
      return Response.json(
        {
          success: false,
          message: "Payment transaction ownership could not be verified.",
        },
        { status: 403 },
      );
    }

    if (
      transaction.payment_method !== "mtn" &&
      transaction.payment_method !== "orange"
    ) {
      return Response.json(
        {
          success: false,
          message: "Unsupported payment provider.",
        },
        { status: 400 },
      );
    }

    const providerReference =
      suppliedProviderReference ||
      transaction.provider_reference ||
      null;

    /*
     * The database transaction is the authoritative source for:
     *
     * - payment method
     * - subscription
     * - business
     * - amount
     * - authenticated user
     * - transaction status
     *
     * The client cannot override those values.
     *
     * Provider API integration is intentionally not performed yet.
     *
     * MTN Mobile Money and Orange Money provider credentials,
     * endpoints, authentication methods, and verification contracts
     * have not yet been supplied.
     *
     * Therefore this function MUST NOT claim that the payment succeeded.
     */

    return Response.json({
      success: false,
      status: "provider_verification_pending",
      message:
        "Payment provider verification is not configured yet. No payment has been marked as verified.",
      transaction: {
        id: transaction.id,
        businessId: transaction.business_id,
        subscriptionId: transaction.subscription_id,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod: transaction.payment_method,
        providerReference,
        status: transaction.status,
        verifiedEmail: transaction.verified_email,
        initiatedAt: transaction.initiated_at,
        paymentReceivedAt: transaction.payment_received_at,
        verifiedAt: transaction.verified_at,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
      },
    });
  }),
};
