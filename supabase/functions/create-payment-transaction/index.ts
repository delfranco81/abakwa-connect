import { withSupabase } from "npm:@supabase/server@^1";

type PaymentMethod = "mtn" | "orange";

interface CreatePaymentTransactionRequest {
  businessId: string;
  subscriptionId: string;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
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

      try {
        const userId = ctx.userClaims?.sub;
        const verifiedEmail = ctx.userClaims?.email;

        if (!userId) {
          return Response.json(
            {
              success: false,
              message: "Authenticated user could not be determined.",
            },
            { status: 401 },
          );
        }

        if (!verifiedEmail) {
          return Response.json(
            {
              success: false,
              message: "A verified account email is required for payment.",
            },
            { status: 400 },
          );
        }

        const body =
          (await req.json()) as CreatePaymentTransactionRequest;

        const {
          businessId,
          subscriptionId,
          paymentMethod,
          phoneNumber,
        } = body;

        if (!businessId) {
          return Response.json(
            {
              success: false,
              message: "Business ID is required.",
            },
            { status: 400 },
          );
        }

        if (!subscriptionId) {
          return Response.json(
            {
              success: false,
              message: "Subscription ID is required.",
            },
            { status: 400 },
          );
        }

        if (!["mtn", "orange"].includes(paymentMethod)) {
          return Response.json(
            {
              success: false,
              message: "A valid payment method is required.",
            },
            { status: 400 },
          );
        }

        if (!phoneNumber || phoneNumber.trim().length < 6) {
          return Response.json(
            {
              success: false,
              message: "A valid payment phone number is required.",
            },
            { status: 400 },
          );
        }

        /*
         * SECURITY CHECK 1
         *
         * Confirm that the authenticated user owns the business.
         */
        const { data: business, error: businessError } =
          await ctx.supabaseAdmin
            .from("business")
            .select("id, owner_id, name")
            .eq("id", businessId)
            .eq("owner_id", userId)
            .maybeSingle();

        if (businessError) {
          console.error("Business lookup failed:", businessError);

          return Response.json(
            {
              success: false,
              message: "Unable to verify business ownership.",
            },
            { status: 500 },
          );
        }

        if (!business) {
          return Response.json(
            {
              success: false,
              message:
                "You are not authorized to pay for this business.",
            },
            { status: 403 },
          );
        }

        /*
         * SECURITY CHECK 2
         *
         * Confirm that the subscription belongs to the business.
         *
         * The amount is deliberately NOT accepted from the browser.
         */
        const { data: subscription, error: subscriptionError } =
          await ctx.supabaseAdmin
            .from("agency_subscriptions")
            .select(
              "id, business_id, plan, amount, status, payment_method, payment_reference",
            )
            .eq("id", subscriptionId)
            .eq("business_id", businessId)
            .maybeSingle();

        if (subscriptionError) {
          console.error(
            "Subscription lookup failed:",
            subscriptionError,
          );

          return Response.json(
            {
              success: false,
              message: "Unable to verify subscription.",
            },
            { status: 500 },
          );
        }

        if (!subscription) {
          return Response.json(
            {
              success: false,
              message: "Subscription could not be verified.",
            },
            { status: 404 },
          );
        }

        if (subscription.status !== "pending") {
          return Response.json(
            {
              success: false,
              message:
                "This subscription is not available for payment.",
            },
            { status: 409 },
          );
        }

        /*
         * CREATE PAYMENT TRANSACTION
         *
         * Identity and email come from Supabase Auth.
         * Business ownership comes from the database.
         * Subscription amount comes from the database.
         */
        const { data: transaction, error: transactionError } =
          await ctx.supabaseAdmin
            .from("payment_transactions")
            .insert({
              user_id: userId,
              business_id: businessId,
              subscription_id: subscription.id,
              verified_email: verifiedEmail,
              amount: subscription.amount,
              currency: "XAF",
              payment_method: paymentMethod,
              provider_reference: null,
              status: "initiated",
              initiated_at: new Date().toISOString(),
              metadata: {
                source: "everyday_connect_payment_flow",
                business_name: business.name,
                subscription_plan: subscription.plan,
                customer_phone_number: phoneNumber.trim(),
              },
            })
            .select(
              "id, user_id, business_id, subscription_id, verified_email, amount, currency, payment_method, provider_reference, status, initiated_at, created_at",
            )
            .single();

        if (transactionError) {
          console.error(
            "Payment transaction creation failed:",
            transactionError,
          );

          return Response.json(
            {
              success: false,
              message:
                "Unable to create payment transaction.",
            },
            { status: 500 },
          );
        }

        return Response.json({
          success: true,
          transaction: {
            id: transaction.id,
            userId: transaction.user_id,
            businessId: transaction.business_id,
            subscriptionId: transaction.subscription_id,
            verifiedEmail: transaction.verified_email,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentMethod: transaction.payment_method,
            providerReference: transaction.provider_reference,
            status: transaction.status,
            initiatedAt: transaction.initiated_at,
            createdAt: transaction.created_at,
          },
        });
      } catch (error) {
        console.error(
          "Unexpected payment transaction error:",
          error,
        );

        return Response.json(
          {
            success: false,
            message: "An unexpected payment error occurred.",
          },
          { status: 500 },
        );
      }
    },
  ),
};
