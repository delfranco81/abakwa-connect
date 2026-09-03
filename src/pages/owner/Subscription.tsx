import { useEffect, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

import {
  businessMembershipService,
  type BusinessMembershipPlan,
  type BusinessMembership,
} from "@/services/business/BusinessMembershipService";

import {
  businessPaymentAccountService,
  type BusinessPaymentAccount,
} from "@/services/business/BusinessPaymentAccountService";

import { businessMembershipPaymentService } from "@/services/payment/BusinessMembershipPaymentService";
import type { PaymentMethod } from "@/services/payment/PaymentTypes";

export default function Subscription() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  const businessId = searchParams.get("businessId")?.trim() ?? "";

  const [plans, setPlans] = useState<BusinessMembershipPlan[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<
    BusinessPaymentAccount[]
  >([]);
  const [membership, setMembership] =
    useState<BusinessMembership | null>(null);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mtn");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    void loadSubscriptionData();
  }, [businessId]);

  async function loadSubscriptionData() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [
        loadedPlans,
        loadedPaymentAccounts,
        currentMembership,
      ] = await Promise.all([
        businessMembershipService.getBusinessMembershipPlans(
          businessId
        ),
        businessPaymentAccountService.getCustomerPaymentAccounts(
          businessId
        ),
        businessMembershipService.getMyMembershipForBusiness(
          businessId
        ),
      ]);

      const supportedPaymentAccounts =
        loadedPaymentAccounts.filter(
          (account) =>
            account.provider === "mtn" ||
            account.provider === "orange"
        );

      setPlans(loadedPlans);
      setPaymentAccounts(supportedPaymentAccounts);
      setMembership(currentMembership);

      if (loadedPlans.length > 0) {
        setSelectedPlanId(loadedPlans[0].id);
      }

      if (supportedPaymentAccounts.length > 0) {
        setSelectedPaymentAccountId(
          supportedPaymentAccounts[0].id
        );

        setPaymentMethod(
          supportedPaymentAccounts[0].provider === "orange"
            ? "orange"
            : "mtn"
        );
      }
    } catch (err) {
      console.error(
        "Subscription page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : t.businessSubscriptionLoadError
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan =
    plans.find(
      (plan) => plan.id === selectedPlanId
    ) ?? null;

  const isPaidPlan =
    selectedPlan !== null &&
    selectedPlan.amount > 0 &&
    selectedPlan.billingType !== "free";

  function getBillingLabel(
    billingType: BusinessMembershipPlan["billingType"]
  ) {
    switch (billingType) {
      case "monthly":
        return t.businessSubscriptionMonthly;

      case "yearly":
        return t.businessSubscriptionYearly;

      case "one_time":
        return t.businessSubscriptionOneTime;

      case "invite_only":
        return t.businessSubscriptionInviteOnly;

      case "free":
      default:
        return t.businessSubscriptionFree;
    }
  }

  function getPaymentMethodLabel(
    provider: BusinessPaymentAccount["provider"]
  ) {
    switch (provider) {
      case "orange":
        return t.businessSubscriptionOrangeMoney;

      case "mtn":
      default:
        return t.businessSubscriptionMtnMobileMoney;
    }
  }

  async function handleSubscribe() {
    setError("");
    setMessage("");

    if (!businessId) {
      setError(
        t.businessSubscriptionBusinessRequired
      );
      return;
    }

    if (!selectedPlan) {
      setError(
        t.businessSubscriptionPlanRequired
      );
      return;
    }

    if (!selectedPlan.active) {
      setError(
        t.businessSubscriptionPlanUnavailable
      );
      return;
    }

    setProcessing(true);

    try {
      const membershipId =
        await businessMembershipService.requestMembership(
          businessId,
          selectedPlan.id
        );

      const requestedMembership =
        await businessMembershipService.getMembershipById(
          membershipId
        );

      if (!requestedMembership) {
        throw new Error(
          t.businessSubscriptionUnableToSubscribe
        );
      }

      setMembership(requestedMembership);

      if (
        selectedPlan.amount <= 0 ||
        selectedPlan.billingType === "free"
      ) {
        setMessage(
          t.businessSubscriptionActivated
        );
        return;
      }

      if (!selectedPaymentAccountId) {
        setError(
          t.businessSubscriptionPaymentAccountRequired
        );
        return;
      }

      if (!phoneNumber.trim()) {
        setError(
          t.businessSubscriptionPhoneRequired
        );
        return;
      }

      const result =
        await businessMembershipPaymentService.initiatePayment(
          {
            membershipId:
              requestedMembership.id,
            businessPaymentAccountId:
              selectedPaymentAccountId,
            paymentMethod,
            customerPhoneNumber:
              phoneNumber.trim(),
          }
        );

      if (!result.success) {
        setError(
          result.message ||
            t.businessSubscriptionPaymentFailed
        );
        return;
      }

      setMessage(
        result.message ||
          t.businessSubscriptionPaymentCreated
      );
    } catch (err) {
      console.error(
        "Membership subscription error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : t.businessSubscriptionUnableToSubscribe
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <section style={styles.loadingCard}>
          <h1>{t.businessSubscriptionLoadingTitle}</h1>
          <p>
            {t.businessSubscriptionLoadingDescription}
          </p>
        </section>
      </PageShell>
    );
  }

  if (!businessId) {
    return (
      <PageShell>
        <section style={styles.errorCard}>
          <h1>
            {t.businessSubscriptionBusinessRequired}
          </h1>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section style={styles.header}>
        <h1>{t.businessSubscriptionTitle}</h1>

        {membership && (
          <div style={styles.currentMembership}>
            <strong>
              {t.businessSubscriptionCurrentMembership}
            </strong>

            <p>
              {t.businessSubscriptionStatus}:{" "}
              {membership.status}
            </p>

            {membership.expiresAt && (
              <p>
                {t.businessSubscriptionExpires}:{" "}
                {new Date(
                  membership.expiresAt
                ).toLocaleDateString(
                  language === "fr"
                    ? "fr-FR"
                    : "en-US"
                )}
              </p>
            )}
          </div>
        )}
      </section>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {message && (
        <div style={styles.successMessage}>
          {message}
        </div>
      )}

      {plans.length === 0 ? (
        <section style={styles.emptyCard}>
          <h2>
            {t.businessSubscriptionNoPlansTitle}
          </h2>

          <p>
            {t.businessSubscriptionNoPlansDescription}
          </p>
        </section>
      ) : (
        <>
          <section>
            <h2>
              {t.businessSubscriptionChoosePlan}
            </h2>

            <div style={styles.planGrid}>
              {plans.map((plan) => {
                const selected =
                  plan.id === selectedPlanId;

                return (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() =>
                      setSelectedPlanId(plan.id)
                    }
                    style={{
                      ...styles.planCard,
                      ...(selected
                        ? styles.selectedPlanCard
                        : {}),
                    }}
                  >
                    <h3>{plan.name}</h3>

                    {plan.description && (
                      <p>{plan.description}</p>
                    )}

                    <strong style={styles.price}>
                      {plan.amount.toLocaleString()}{" "}
                      {plan.currency}
                    </strong>

                    <span>
                      {getBillingLabel(
                        plan.billingType
                      )}
                    </span>

                    {plan.approvalRequired && (
                      <small>
                        {t.businessSubscriptionApprovalRequired}
                      </small>
                    )}

                    {plan.benefits.length > 0 && (
                      <ul style={styles.benefits}>
                        {plan.benefits.map(
                          (benefit, index) => (
                            <li key={index}>
                              {String(benefit)}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {selectedPlan && isPaidPlan && (
            <section style={styles.paymentCard}>
              <h2>
                {t.businessSubscriptionPaymentTitle}
              </h2>

              {paymentAccounts.length === 0 ? (
                <p>
                  {
                    t.businessSubscriptionNoPaymentAccounts
                  }
                </p>
              ) : (
                <>
                  <label style={styles.label}>
                    {
                      t.businessSubscriptionPaymentMethod
                    }
                  </label>

                  <div style={styles.paymentOptions}>
                    {paymentAccounts.map(
                      (account) => (
                        <button
                          type="button"
                          key={account.id}
                          onClick={() => {
                            setSelectedPaymentAccountId(
                              account.id
                            );

                            setPaymentMethod(
                              account.provider ===
                                "orange"
                                ? "orange"
                                : "mtn"
                            );
                          }}
                          style={{
                            ...styles.paymentOption,
                            ...(selectedPaymentAccountId ===
                            account.id
                              ? styles.selectedPaymentOption
                              : {}),
                          }}
                        >
                          {getPaymentMethodLabel(
                            account.provider
                          )}

                          {account.displayName && (
                            <small>
                              {account.displayName}
                            </small>
                          )}
                        </button>
                      )
                    )}
                  </div>

                  <label
                    htmlFor="membership-phone"
                    style={styles.label}
                  >
                    {
                      t.businessSubscriptionPhoneNumber
                    }
                  </label>

                  <input
                    id="membership-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(
                        event.target.value
                      )
                    }
                    placeholder={
                      t.businessSubscriptionPhonePlaceholder
                    }
                    style={styles.input}
                  />

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() =>
                      void handleSubscribe()
                    }
                    style={styles.primaryButton}
                  >
                    {processing
                      ? t.businessSubscriptionProcessing
                      : t.businessSubscriptionContinue}
                  </button>
                </>
              )}
            </section>
          )}

          {selectedPlan && !isPaidPlan && (
            <section style={styles.paymentCard}>
              <button
                type="button"
                disabled={processing}
                onClick={() =>
                  void handleSubscribe()
                }
                style={styles.primaryButton}
              >
                {processing
                  ? t.businessSubscriptionProcessing
                  : t.businessSubscriptionContinue}
              </button>
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.page}>
      {children}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px",
  },

  header: {
    marginBottom: 30,
  },

  loadingCard: {
    padding: 30,
    textAlign: "center",
  },

  errorCard: {
    padding: 30,
    textAlign: "center",
  },

  currentMembership: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    border: "1px solid #ddd",
  },

  errorMessage: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    background: "#fee2e2",
  },

  successMessage: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    background: "#dcfce7",
  },

  emptyCard: {
    padding: 30,
    borderRadius: 12,
    border: "1px solid #ddd",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    marginTop: 20,
  },

  planCard: {
    textAlign: "left",
    padding: 24,
    borderRadius: 14,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },

  selectedPlanCard: {
    border: "2px solid #1d4ed8",
  },

  price: {
    display: "block",
    fontSize: 24,
    margin: "15px 0 8px",
  },

  benefits: {
    marginTop: 15,
    paddingLeft: 20,
  },

  paymentCard: {
    marginTop: 35,
    padding: 25,
    borderRadius: 14,
    border: "1px solid #ddd",
  },

  label: {
    display: "block",
    fontWeight: 600,
    marginTop: 20,
    marginBottom: 8,
  },

  paymentOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },

  paymentOption: {
    padding: 14,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },

  selectedPaymentOption: {
    border: "2px solid #1d4ed8",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  primaryButton: {
    marginTop: 20,
    padding: "13px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
};
