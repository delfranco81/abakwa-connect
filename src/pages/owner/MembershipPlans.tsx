import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import {
  getOwnedBusiness,
  getOwnedBusinessById,
} from "@/services/business/BusinessOwnerService";
import {
  businessMembershipPlanService,
  type BusinessMembershipPlan,
  type MembershipBillingType,
} from "@/services/subscription/BusinessMembershipPlanService";

const BILLING_TYPES: MembershipBillingType[] = [
  "free",
  "monthly",
  "yearly",
  "one_time",
  "invite_only",
];

export default function MembershipPlans() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const requestedBusinessId = searchParams.get("businessId");

  const [business, setBusiness] = useState<any>(null);
  const [plans, setPlans] = useState<BusinessMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [billingType, setBillingType] =
    useState<MembershipBillingType>("monthly");
  const [amount, setAmount] = useState("0");
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [benefits, setBenefits] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const isEditing = Boolean(editingPlanId);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const ownedBusiness = requestedBusinessId
        ? await getOwnedBusinessById(requestedBusinessId)
        : await getOwnedBusiness();

      if (!ownedBusiness) {
        setBusiness(null);
        setPlans([]);
        return;
      }

      setBusiness(ownedBusiness);

      const businessPlans =
        await businessMembershipPlanService.getPlansForBusiness(
          ownedBusiness.id
        );

      setPlans(businessPlans);
    } catch (err) {
      console.error("Membership plans error:", err);

      setError(
        err instanceof Error
          ? err.message
          : t.businessMembershipPlansLoadError
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [requestedBusinessId]);

  const resetForm = () => {
    setEditingPlanId(null);
    setName("");
    setDescription("");
    setBillingType("monthly");
    setAmount("0");
    setApprovalRequired(false);
    setBenefits("");
    setSortOrder("0");
    setError("");
    setSuccess("");
  };

  const beginEdit = (plan: BusinessMembershipPlan) => {
    setEditingPlanId(plan.id);
    setName(plan.name);
    setDescription(plan.description ?? "");
    setBillingType(plan.billingType);
    setAmount(String(plan.amount));
    setApprovalRequired(plan.approvalRequired);
    setBenefits(plan.benefits.join("\n"));
    setSortOrder(String(plan.sortOrder));
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (plan: BusinessMembershipPlan) => {
    const confirmed = window.confirm(
      t.businessMembershipPlansDeleteConfirm
    );

    if (!confirmed) {
      return;
    }

    setDeletingPlanId(plan.id);
    setError("");
    setSuccess("");

    try {
      await businessMembershipPlanService.deletePlan(plan.id);
      setSuccess(t.businessMembershipPlansDeleted);

      if (editingPlanId === plan.id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      console.error("Membership plan delete error:", err);

      if (err instanceof Error && err.message === "MEMBERSHIP_PLAN_HAS_MEMBERS") {
        setError(t.businessMembershipPlansDeleteHasMembers);
      } else {
        setError(t.businessMembershipPlansDeleteError);
      }
    } finally {
      setDeletingPlanId(null);
    }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!business) {
      setError(t.businessMembershipPlansBusinessRequired);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const parsedBenefits = benefits
        .split("\n")
        .map((benefit) => benefit.trim())
        .filter(Boolean);

      const numericAmount =
        billingType === "free" || billingType === "invite_only"
          ? 0
          : Math.max(0, Number(amount || 0));

      if (isEditing && editingPlanId) {
        await businessMembershipPlanService.updatePlan(editingPlanId, {
          name,
          description,
          billingType,
          amount: numericAmount,
          currency: "XAF",
          approvalRequired,
          benefits: parsedBenefits,
          sortOrder: Number(sortOrder || 0),
        });

        setSuccess(t.businessMembershipPlansUpdated);
      } else {
        await businessMembershipPlanService.createPlan({
          businessId: business.id,
          name,
          description,
          billingType,
          amount: numericAmount,
          currency: "XAF",
          active: false,
          approvalRequired,
          benefits: parsedBenefits,
          sortOrder: Number(sortOrder || 0),
        });

        setSuccess(t.businessMembershipPlansCreated);
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Membership plan save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : t.businessMembershipPlansSaveError
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (plan: BusinessMembershipPlan) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await businessMembershipPlanService.updatePlan(plan.id, {
        active: true,
      });

      setSuccess(t.businessMembershipPlansPublishedSuccess);
      await loadData();
    } catch (err) {
      console.error("Membership plan publish error:", err);

      setError(
        err instanceof Error
          ? err.message
          : t.businessMembershipPlansPublishError
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="ec-membership-admin">
        <p className="text-sm text-gray-600">
          {t.businessMembershipPlansLoading}
        </p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="ec-membership-admin">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-gray-900">
            {t.businessMembershipPlansTitle}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {t.businessMembershipPlansBusinessRequired}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ec-membership-admin">
      <div className="ec-admin-shell">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.businessMembershipPlansTitle}
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            {t.businessMembershipPlansDescription}
          </p>

          <p className="mt-2 text-sm font-medium text-gray-800">
            {business.name}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing
                  ? t.businessMembershipPlansEdit
                  : t.businessMembershipPlansCreate}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {t.businessMembershipPlansFormDescription}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t.businessMembershipPlansCancel}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.businessMembershipPlansName}
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder={t.businessMembershipPlansNamePlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.businessMembershipPlansBillingType}
                </label>

                <select
                  value={billingType}
                  onChange={(event) =>
                    setBillingType(
                      event.target.value as MembershipBillingType
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {BILLING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === "free"
                        ? t.businessMembershipPlansBillingFree
                        : type === "monthly"
                          ? t.businessMembershipPlansBillingMonthly
                          : type === "yearly"
                            ? t.businessMembershipPlansBillingYearly
                            : type === "one_time"
                              ? t.businessMembershipPlansBillingOneTime
                              : t.businessMembershipPlansBillingInviteOnly}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t.businessMembershipPlansDescriptionField}
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder={
                  t.businessMembershipPlansDescriptionPlaceholder
                }
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.businessMembershipPlansPrice}
                </label>

                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    disabled={
                      billingType === "free" ||
                      billingType === "invite_only"
                    }
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full rounded-l-lg border border-gray-300 px-3 py-2.5 text-sm outline-none disabled:bg-gray-100"
                  />

                  <span className="flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-4 text-sm text-gray-600">
                    XAF
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.businessMembershipPlansSortOrder}
                </label>

                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t.businessMembershipPlansBenefits}
              </label>

              <textarea
                value={benefits}
                onChange={(event) => setBenefits(event.target.value)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder={t.businessMembershipPlansBenefitsPlaceholder}
              />

              <p className="mt-1 text-xs text-gray-500">
                {t.businessMembershipPlansBenefitsHelp}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={approvalRequired}
                  onChange={(event) =>
                    setApprovalRequired(event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span>
                  <span className="block font-medium">
                    {t.businessMembershipPlansApproval}
                  </span>

                  <span className="block text-xs text-gray-500">
                    {t.businessMembershipPlansApprovalHelp}
                  </span>
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? t.businessMembershipPlansSaving
                  : isEditing
                    ? t.businessMembershipPlansSaveChanges
                    : t.businessMembershipPlansCreateButton}
              </button>
            </div>
          </form>
        </div>

        {plans.some((plan) => !plan.active) && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  !
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {t.businessMembershipPlansPublish}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {t.businessMembershipPlansPublish}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm text-gray-600">
                    {t.businessMembershipPlansPublishHelp}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-blue-200">
                  {t.businessMembershipPlansInactive}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const unpublishedPlan = plans.find((plan) => !plan.active);

                    if (unpublishedPlan) {
                      void handlePublish(unpublishedPlan);
                    }
                  }}
                  disabled={saving}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? t.businessMembershipPlansSaving
                    : t.businessMembershipPlansPublish}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t.businessMembershipPlansExisting}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {t.businessMembershipPlansExistingDescription}
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">
                {t.businessMembershipPlansEmpty}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {plan.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          plan.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plan.active
                          ? t.businessMembershipPlansPublished
                          : t.businessMembershipPlansInactive}
                      </span>
                    </div>

                    {plan.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>
                        {plan.billingType === "free"
                          ? t.businessMembershipPlansBillingFree
                          : plan.billingType === "monthly"
                            ? t.businessMembershipPlansBillingMonthly
                            : plan.billingType === "yearly"
                              ? t.businessMembershipPlansBillingYearly
                              : plan.billingType === "one_time"
                                ? t.businessMembershipPlansBillingOneTime
                                : t.businessMembershipPlansBillingInviteOnly}
                      </span>

                      <span>
                        {plan.amount.toLocaleString()} {plan.currency}
                      </span>

                      {plan.approvalRequired && (
                        <span>
                          {t.businessMembershipPlansApprovalRequired}
                        </span>
                      )}
                    </div>

                    {plan.benefits.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                        {plan.benefits.map((benefit, index) => (
                          <li key={`${plan.id}-benefit-${index}`}>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(plan)}
                      disabled={deletingPlanId === plan.id}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t.businessMembershipPlansEditButton}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(plan)}
                      disabled={deletingPlanId === plan.id}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingPlanId === plan.id
                        ? t.businessMembershipPlansDeleting
                        : t.businessMembershipPlansDeleteButton}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
