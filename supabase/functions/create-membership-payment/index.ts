import { withSupabase } from "npm:@supabase/server@^1";

interface CreateMembershipPaymentRequest {
  membershipId?: unknown;
  businessPaymentAccountId?: unknown;
  paymentMethod?: unknown;
  customerPhoneNumber?: unknown;
}

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          {
            success: false,
            message: "Only POST requests are allowed.",
          },
          { status: 405 },
        );
      }

      let payload: CreateMembershipPaymentRequest;

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
            message:
              "Authenticated user could not be identified.",
          },
          { status: 401 },
        );
      }

      if (!verifiedEmail) {
        return Response.json(
          {
            success: false,
            message:
              "Authenticated email could not be verified.",
          },
          { status: 401 },
        );
      }

      const membershipId =
        typeof payload.membershipId === "string"
          ? payload.membershipId.trim()
          : "";

      const businessPaymentAccountId =
        typeof payload.businessPaymentAccountId ===
        "string"
          ? payload.businessPaymentAccountId.trim()
          : "";

      const paymentMethod =
        typeof payload.paymentMethod === "string"
          ? payload.paymentMethod.trim().toLowerCase()
          : "";

      const customerPhoneNumber =
        typeof payload.customerPhoneNumber === "string"
          ? payload.customerPhoneNumber.trim()
          : "";

      if (!membershipId) {
        return Response.json(
          {
            success: false,
            message: "Membership ID is required.",
          },
          { status: 400 },
        );
      }

      if (!businessPaymentAccountId) {
        return Response.json(
          {
            success: false,
            message:
              "Business payment account ID is required.",
          },
          { status: 400 },
        );
      }

      if (
        paymentMethod !== "mtn" &&
        paymentMethod !== "orange"
      ) {
        return Response.json(
          {
            success: false,
            message:
              "A valid payment method is required.",
          },
          { status: 400 },
        );
      }

      if (customerPhoneNumber.length < 6) {
        return Response.json(
          {
            success: false,
            message:
              "A valid customer phone number is required.",
          },
          { status: 400 },
        );
      }

      /*
       * The authenticated Supabase context is deliberately used
       * for this RPC.
       *
       * The database function uses auth.uid() and therefore knows
       * the real customer identity from the authenticated request.
       *
       * The RPC itself is responsible for resolving:
       *
       * - customer
       * - business
       * - membership
       * - membership plan
       * - authoritative amount
       * - currency
       * - verified business payment account
       * - payment provider
       */
      const { data, error } = await ctx.supabase.rpc(
        "create_business_membership_payment_transaction",
        {
          p_membership_id: membershipId,
          p_business_payment_account_id:
            businessPaymentAccountId,
          p_payment_method: paymentMethod,
          p_customer_phone_number:
            customerPhoneNumber,
        },
      );

      if (error) {
        console.error(
          "Membership payment transaction RPC failed:",
          error,
        );

        return Response.json(
          {
            success: false,
            message:
              error.message ||
              "Unable to create membership payment transaction.",
          },
          { status: 400 },
        );
      }

      if (!data) {
        return Response.json(
          {
            success: false,
            message:
              "Membership payment transaction was not created.",
          },
          { status: 500 },
        );
      }

      const transactionId = String(data);

      /*
       * Fetch only the newly-created transaction using the
       * authenticated user's identity.
       *
       * This provides the client with the authoritative transaction
       * information without accepting financial values from the
       * browser.
       */
      const { data: transaction, error: transactionError } =
        await ctx.supabase
          .from("payment_transactions")
          .select(
            [
              "id",
              "user_id",
              "business_id",
              "subscription_id",
              "membership_id",
              "business_payment_account_id",
              "verified_email",
              "amount",
              "currency",
              "payment_method",
              "provider_reference",
              "status",
              "initiated_at",
              "created_at",
            ].join(", "),
          )
          .eq("id", transactionId)
          .eq("user_id", userId)
          .maybeSingle();

      if (transactionError) {
        console.error(
          "Membership payment transaction lookup failed:",
          transactionError,
        );

        return Response.json(
          {
            success: false,
            message:
              "Payment transaction was created but could not be retrieved.",
          },
          { status: 500 },
        );
      }

      if (!transaction) {
        return Response.json(
          {
            success: false,
            message:
              "Payment transaction could not be found.",
          },
          { status: 404 },
        );
      }

      if (
        transaction.verified_email !==
        verifiedEmail
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Payment transaction ownership could not be verified.",
          },
          { status: 403 },
        );
      }

      return Response.json({
        success: true,
        transaction: {
          id: transaction.id,
          userId: transaction.user_id,
          businessId: transaction.business_id,
          subscriptionId:
            transaction.subscription_id,
          membershipId:
            transaction.membership_id,
          businessPaymentAccountId:
            transaction.business_payment_account_id,
          verifiedEmail:
            transaction.verified_email,
          amount: transaction.amount,
          currency: transaction.currency,
          paymentMethod:
            transaction.payment_method,
          providerReference:
            transaction.provider_reference,
          status: transaction.status,
          initiatedAt:
            transaction.initiated_at,
          createdAt:
            transaction.created_at,
        },
      });
    },
  ),
};
