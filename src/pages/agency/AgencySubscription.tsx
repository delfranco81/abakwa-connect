import { useState } from "react";
import { PAYMENT_CONFIG } from "@/config/payments";
import type { PaymentMethod } from "@/services/payment/PaymentTypes";
import { agencySubscriptionService } from "@/services/subscription/AgencySubscriptionService";
import { paymentService } from "@/services/payment/PaymentService";

interface Props {
  businessId: string;
}

type Plan = "monthly" | "yearly";

export default function AgencySubscription({
  businessId,
}: Props) {
  const [plan, setPlan] =
    useState<Plan>("monthly");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mtn");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const amount =
    PAYMENT_CONFIG.plans[plan].amount;

  async function handleContinue() {
    setMessage("");

    if (!businessId) {
      setMessage(
        "Your agency account could not be identified."
      );
      return;
    }

    if (!phoneNumber.trim()) {
      setMessage(
        "Please enter the mobile-money number you will use for payment."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Step 1:
       * Create a pending subscription.
       */
      const subscription =
        await agencySubscriptionService
          .createPendingSubscription(
            businessId,
            plan
          );

      /*
       * Step 2:
       * Initiate payment.
       *
       * The actual MTN/Orange gateway will
       * be connected here.
       */
      const payment =
        await paymentService.initiatePayment({
          businessId,
          subscriptionId:
            subscription.id,
          amount,
          paymentMethod,
          phoneNumber:
            phoneNumber.trim(),
        });

      if (!payment.success) {
        setMessage(payment.message);
        return;
      }

      setMessage(
        "Payment request sent. Please complete the payment on your phone."
      );
    } catch (error) {
      console.error(
        "Subscription payment error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "40px auto",
        padding: 24,
      }}
    >
      <h1>
        Washing Agency Subscription
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: 30,
        }}
      >
        Choose a subscription plan to make
        your washing agency available to
        customers.
      </p>

      {/* Plans */}

      <div
        style={{
          display: "grid",
          gap: 15,
        }}
      >
        <button
          type="button"
          onClick={() =>
            setPlan("monthly")
          }
          style={{
            textAlign: "left",
            padding: 20,
            borderRadius: 12,
            border:
              plan === "monthly"
                ? "2px solid #0B8F4D"
                : "1px solid #ddd",
            background:
              plan === "monthly"
                ? "#eef8f2"
                : "#fff",
            cursor: "pointer",
          }}
        >
          <strong>
            Monthly
          </strong>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            3,000 FCFA
          </div>

          <small>
            Valid for one month
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            setPlan("yearly")
          }
          style={{
            textAlign: "left",
            padding: 20,
            borderRadius: 12,
            border:
              plan === "yearly"
                ? "2px solid #0B8F4D"
                : "1px solid #ddd",
            background:
              plan === "yearly"
                ? "#eef8f2"
                : "#fff",
            cursor: "pointer",
          }}
        >
          <strong>
            Yearly
          </strong>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            32,400 FCFA
          </div>

          <small>
            Save 3,600 FCFA â€” 10% discount
          </small>
        </button>
      </div>

      {/* Payment method */}

      <div style={{ marginTop: 30 }}>
        <h3>
          Payment Method
        </h3>

        <label
          style={{
            display: "block",
            padding: 15,
            border: "1px solid #ddd",
            borderRadius: 10,
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="mtn"
            checked={
              paymentMethod === "mtn"
            }
            onChange={() =>
              setPaymentMethod("mtn")
            }
          />

          {" "}MTN Mobile Money
        </label>

        <label
          style={{
            display: "block",
            padding: 15,
            border: "1px solid #ddd",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="orange"
            checked={
              paymentMethod === "orange"
            }
            onChange={() =>
              setPaymentMethod("orange")
            }
          />

          {" "}Orange Money
        </label>
      </div>

      {/* Payment number */}

      <div style={{ marginTop: 25 }}>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Mobile Money Number
        </label>

        <input
          type="tel"
          value={phoneNumber}
          onChange={(event) =>
            setPhoneNumber(
              event.target.value
            )
          }
          placeholder={
            paymentMethod === "mtn"
              ? "MTN number"
              : "Orange number"
          }
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 8,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Summary */}

      <div
        style={{
          marginTop: 25,
          padding: 18,
          borderRadius: 10,
          background: "#f5f7fa",
        }}
      >
        <strong>
          Payment Summary
        </strong>

        <div style={{ marginTop: 10 }}>
          Plan:{" "}
          {plan === "monthly"
            ? "Monthly"
            : "Yearly"}
        </div>

        <div>
          Payment:
          {" "}
          {paymentMethod === "mtn"
            ? "MTN Mobile Money"
            : "Orange Money"}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {amount.toLocaleString()} FCFA
        </div>
      </div>

      {/* Message */}

      {message && (
        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 8,
            background: "#eef8f2",
            color: "#176b3d",
          }}
        >
          {message}
        </div>
      )}

      {/* Pay */}

      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 25,
          padding: 16,
          border: "none",
          borderRadius: 10,
          background: "#0B8F4D",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: loading
            ? "not-allowed"
            : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading
          ? "Starting payment..."
          : `Pay ${amount.toLocaleString()} FCFA`}
      </button>
    </div>
  );
}