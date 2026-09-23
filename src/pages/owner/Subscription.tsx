import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/core/database/supabase";
import { businessMembershipService } from "@/services/business/BusinessMembershipService";
import { businessPaymentAccountService } from "@/services/business/BusinessPaymentAccountService";
import {
  businessMembershipPaymentService,
} from "@/services/payment/BusinessMembershipPaymentService";
import {
  businessMembershipPlanService,
  type BusinessMembershipPlan,
} from "@/services/subscription/BusinessMembershipPlanService";
import type { PaymentMethod } from "@/services/payment/PaymentTypes";
import "./BusinessSubscription.css";

type BusinessRecord = {
  id: string;
  name: string;
};

type MembershipRecord = {
  id: string;
  status: string;
  expiresAt?: string | null;
};

export default function Subscription() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const businessId = searchParams.get("businessId")?.trim() ?? "";

  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [plans, setPlans] = useState<BusinessMembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] =
    useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [membership, setMembership] = useState<MembershipRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const selectedPaymentAccount = useMemo(
    () =>
      paymentAccounts.find(
        (account) => account.id === selectedPaymentAccountId
      ) ?? null,
    [paymentAccounts, selectedPaymentAccountId]
  );

  const billingLabel = (plan: BusinessMembershipPlan) => {
    if (plan.billingType === "free") {
      return t.businessSubscriptionFree;
    }

    if (plan.billingType === "monthly") {
      return t.businessSubscriptionMonthly;
    }

    if (plan.billingType === "yearly") {
      return t.businessSubscriptionYearly;
    }

    if (plan.billingType === "one_time") {
      return t.businessSubscriptionOneTime;
    }

    return t.businessSubscriptionInviteOnly;
  };

  const billingSuffix = (plan: BusinessMembershipPlan) => {
    if (plan.billingType === "monthly") {
      return t.businessSubscriptionPerMonth;
    }

    if (plan.billingType === "yearly") {
      return t.businessSubscriptionPerYear;
    }

    return "";
  };

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      if (!businessId) {
        throw new Error("BUSINESS_REQUIRED");
      }

      const [{ data: businessData, error: businessError }, availablePlans] =
        await Promise.all([
          supabase
            .from("business")
            .select("id, name")
            .eq("id", businessId)
            .maybeSingle(),
          businessMembershipPlanService.getPlansForBusiness(businessId),
        ]);

      if (businessError) {
        throw businessError;
      }

      if (!businessData) {
        throw new Error("BUSINESS_REQUIRED");
      }

      const accounts =
        await businessPaymentAccountService.getCustomerPaymentAccounts(
          businessId
        );

      let currentMembership: MembershipRecord | null = null;

      try {
        const current =
          await businessMembershipService.getMyMembershipForBusiness(
            businessId
          );

        if (current) {
          currentMembership = {
            id: String(current.id),
            status: String(current.status),
            expiresAt:
              "expiresAt" in current
                ? (current as any).expiresAt ?? null
                : null,
          };
        }
      } catch (membershipError) {
        console.warn(
          "Unable to load current business membership:",
          membershipError
        );
      }

      setBusiness({
        id: String(businessData.id),
        name: String(businessData.name),
      });

      setPlans(availablePlans);
      setPaymentAccounts(
        accounts.filter(
          (account) =>
            account.provider === "mtn" || account.provider === "orange"
        )
      );
      setMembership(currentMembership);

      if (availablePlans.length > 0) {
        setSelectedPlanId((current) =>
          current && availablePlans.some((plan) => plan.id === current)
            ? current
            : availablePlans[0].id
        );
      } else {
        setSelectedPlanId(null);
      }

      if (accounts.length > 0) {
        setSelectedPaymentAccountId((current) =>
          current && accounts.some((account) => account.id === current)
            ? current
            : accounts[0].id
        );
      } else {
        setSelectedPaymentAccountId(null);
      }
    } catch (error) {
      console.error("Business subscription load error:", error);

      setMessage(
        error instanceof Error && error.message === "BUSINESS_REQUIRED"
          ? t.businessSubscriptionBusinessRequired
          : t.businessSubscriptionLoadError
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [businessId]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setMessage("");
    setMessageType("");

    window.setTimeout(() => {
      document
        .getElementById("membership-payment")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleContinue = async () => {
    setMessage("");
    setMessageType("");

    if (!businessId) {
      setMessage(t.businessSubscriptionBusinessRequired);
      setMessageType("error");
      return;
    }

    if (!selectedPlan) {
      setMessage(t.businessSubscriptionPlanRequired);
      setMessageType("error");
      return;
    }

    if (!selectedPaymentAccount) {
      setMessage(t.businessSubscriptionPaymentAccountRequired);
      setMessageType("error");
      return;
    }

    if (!phoneNumber.trim()) {
      setMessage(t.businessSubscriptionPhoneRequired);
      setMessageType("error");
      return;
    }

    setProcessing(true);

    try {
      const membershipId =
        await businessMembershipService.requestMembership(
          businessId,
          selectedPlan.id
        );

      const payment =
        await businessMembershipPaymentService.initiatePayment({
          membershipId,
          businessPaymentAccountId: selectedPaymentAccount.id,
          paymentMethod,
          customerPhoneNumber: phoneNumber.trim(),
        });

      if (!payment.success) {
        setMessage(t.businessSubscriptionPaymentFailed);
        setMessageType("error");
        return;
      }

      setMessage(t.businessSubscriptionPaymentCreated);
      setMessageType("success");

      await loadData();
    } catch (error) {
      console.error("Business subscription payment error:", error);

      setMessage(t.businessSubscriptionUnableToSubscribe);
      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="ec-subscription-page">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400" />
          <h1 className="text-2xl font-bold">
            {t.businessSubscriptionLoadingTitle}
          </h1>
          <p className="mt-2 text-gray-400">
            {t.businessSubscriptionLoadingDescription}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="ec-subscription-page">
      <div className="ec-subscription-shell">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t.businessSubscriptionTitle}
          </h1>

          {business && (
            <p className="mt-3 text-sm font-medium text-emerald-400">
              {business.name}
            </p>
          )}

          <p className="mt-3 text-xl font-semibold text-gray-200">
            {t.businessSubscriptionChoosePlan}
          </p>
        </header>

        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {membership && (
          <section className="mb-6 rounded-2xl border border-emerald-500/30 bg-[#17191f] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">
                  {t.businessSubscriptionCurrentMembership}
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {membership.status}
                </p>
              </div>

              {membership.expiresAt && (
                <p className="text-sm text-gray-400">
                  {t.businessSubscriptionExpires}:{" "}
                  {new Date(membership.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </section>
        )}

        {plans.length === 0 ? (
          <section className="rounded-2xl border border-gray-700 bg-[#17191f] p-10 text-center">
            <h2 className="text-xl font-bold">
              {t.businessSubscriptionNoPlansTitle}
            </h2>
            <p className="mt-2 text-gray-400">
              {t.businessSubscriptionNoPlansDescription}
            </p>
          </section>
        ) : (
          <>
            <section className="space-y-5">
              {plans.map((plan, index) => {
                const selected = plan.id === selectedPlanId;

                return (
                  <article
                    key={plan.id}
                    className={`rounded-2xl border bg-[#17191f] p-6 shadow-2xl transition sm:p-7 ${
                      selected
                        ? "border-emerald-400/70 shadow-emerald-950/30"
                        : "border-gray-700"
                    }`}
                  >
                    <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
                      <div>
                        {index === 0 && (
                          <span className="inline-flex rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                            {t.businessSubscriptionPopular}
                          </span>
                        )}

                        <h2 className="mt-4 text-3xl font-extrabold text-white">
                          {plan.name}
                        </h2>

                        {plan.description && (
                          <p className="mt-3 text-sm leading-6 text-gray-300">
                            {plan.description}
                          </p>
                        )}

                        {plan.benefits.length > 0 && (
                          <ul className="mt-6 space-y-3">
                            {plan.benefits.map((benefit, benefitIndex) => (
                              <li
                                key={`${plan.id}-${benefitIndex}`}
                                className="flex items-start gap-3 text-sm text-gray-200"
                              >
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-black text-[#07130f]">
                                  
                                </span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="border-t border-gray-700 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                          {billingLabel(plan)}
                        </p>

                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-4xl font-extrabold text-white">
                            {plan.amount.toLocaleString()}
                          </span>
                          <span className="pb-1 text-sm text-gray-300">
                            {plan.currency}
                            {billingSuffix(plan) && (
                              <> {billingSuffix(plan)}</>
                            )}
                          </span>
                        </div>

                        {plan.approvalRequired && (
                          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500/15 px-3 py-2 text-sm font-semibold text-blue-200">
                            <span></span>
                            {t.businessSubscriptionApprovalRequired}
                          </div>
                        )}

                        {plan.approvalRequired && (
                          <p className="mt-3 text-sm leading-6 text-gray-400">
                            {t.businessSubscriptionApprovalDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`mt-7 w-full rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                        selected
                          ? "bg-emerald-500 text-[#07130f] hover:bg-emerald-400"
                          : "border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                    >
                      {selected
                        ? t.businessSubscriptionSelectedPlan
                        : t.businessSubscriptionSelectPlan}
                    </button>
                  </article>
                );
              })}
            </section>

            <section
              id="membership-payment"
              className="mt-7 rounded-2xl border border-gray-700 bg-[#17191f] p-6 sm:p-7"
            >
              <div className="text-center">
                <h2 className="text-2xl font-extrabold">
                  {t.businessSubscriptionPaymentTitle}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  {t.businessSubscriptionSecurePayment}
                </p>
              </div>

              {paymentAccounts.length === 0 ? (
                <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
                  {t.businessSubscriptionNoPaymentAccounts}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {paymentAccounts.map((account) => {
                      const provider = account.provider as PaymentMethod;
                      const selected =
                        account.id === selectedPaymentAccountId;

                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => {
                            setSelectedPaymentAccountId(account.id);
                            setPaymentMethod(provider);
                          }}
                          className={`rounded-xl border p-5 text-left transition ${
                            selected
                              ? "border-emerald-400 bg-emerald-500/10"
                              : "border-gray-600 bg-[#111217] hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xs font-black text-gray-900">
                              {provider === "mtn" ? "MTN" : "OM"}
                            </span>

                            <div>
                              <p className="font-bold text-white">
                                {provider === "mtn"
                                  ? t.businessSubscriptionMtnMobileMoney
                                  : t.businessSubscriptionOrangeMoney}
                              </p>

                              {account.displayName && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {account.displayName}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-gray-200">
                      {t.businessSubscriptionPhoneNumber}
                    </label>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) =>
                        setPhoneNumber(event.target.value)
                      }
                      placeholder={t.businessSubscriptionPhonePlaceholder}
                      className="w-full rounded-xl border border-gray-600 bg-[#111217] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-emerald-400"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => void handleContinue()}
                    className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-4 text-sm font-extrabold text-[#07130f] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing
                      ? t.businessSubscriptionProcessing
                      : t.businessSubscriptionContinue}
                  </button>
                </>
              )}
            </section>

            <section className="mt-5 grid gap-3 rounded-xl border border-gray-700 bg-[#15171c] p-4 sm:grid-cols-3">
              <div className="rounded-lg p-3 text-center">
                <div className="ec-feature-icon">+</div><p className="mt-1 text-sm font-bold">
                  {t.businessSubscriptionSecurePaymentTitle}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t.businessSubscriptionSecurePaymentDescription}
                </p>
              </div>

              <div className="rounded-lg p-3 text-center">
                <div className="ec-feature-icon">+</div><p className="mt-1 text-sm font-bold">
                  {t.businessSubscriptionQuickApprovalTitle}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t.businessSubscriptionQuickApprovalDescription}
                </p>
              </div>

              <div className="rounded-lg p-3 text-center">
                <div className="ec-feature-icon">+</div><p className="mt-1 text-sm font-bold">
                  {t.businessSubscriptionSupportTitle}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t.businessSubscriptionSupportDescription}
                </p>
              </div>
            </section>

            <p className="ec-activation-note">{t.businessSubscriptionActivationNote}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
