import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

import {
  getOwnedBusiness,
  getOwnedBusinessById,
  type OwnedBusiness,
} from "../../services/business/BusinessOwnerService";

function Dashboard() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const businessId =
    searchParams.get("businessId")?.trim() || "";

  const [business, setBusiness] =
    useState<OwnedBusiness | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    try {
      setLoading(true);
      setError("");

      const ownedBusiness = businessId
        ? await getOwnedBusinessById(businessId)
        : await getOwnedBusiness();

      setBusiness(ownedBusiness);
    } catch (err) {
      console.error("Business dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : t.businessDashboardLoadErrorTitle
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        background: "#f5f7f7",
        padding: "40px 24px 70px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={loadBusiness}
          />
        ) : !business ? (
          <NoBusinessState />
        ) : (
          <>
            {/* HEADER */}
            <section
              style={{
                background:
                  "linear-gradient(135deg, #003b36, #00695c)",
                color: "white",
                borderRadius: "18px",
                padding: "32px",
                marginBottom: "28px",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "#9de8df",
                    }}
                  >
                    {t.businessDashboardEcosBusiness}
                  </p>

                  <h1
                    style={{
                      margin: "0 0 10px",
                      fontSize:
                        "clamp(28px, 5vw, 42px)",
                    }}
                  >
                    {business.name ||
                      t.businessDashboardTitle}
                  </h1>

                  <p
                    style={{
                      margin: "0 0 10px",
                      color:
                        "rgba(255,255,255,0.9)",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {business.category ||
                      t.businessDashboardDefaultCategory}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "rgba(255,255,255,0.85)",
                      maxWidth: "650px",
                      lineHeight: 1.6,
                    }}
                  >
                    {business.description ||
                      t.businessDashboardDescription}
                  </p>
                </div>

                <Link
                  to={`/business-dashboard/profile?businessId=${business.id}`}
                  style={{
                    color: "#003b36",
                    background: "white",
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    fontWeight: 700,
                  }}
                >
                  {t.businessDashboardEditBusiness}
                </Link>
              </div>
            </section>

            {/* BUSINESS INFORMATION */}
            <section
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "28px",
                border:
                  "1px solid #e5e7eb",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  flexWrap: "wrap",
                }}
              >
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={`${business.name} logo`}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 14,
                      border:
                        "1px solid #e5e7eb",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 14,
                      background: "#e8f3f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#00695c",
                      fontSize: 30,
                      fontWeight: 800,
                    }}
                  >
                    {(business.name || "B")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h2
                    style={{
                      margin: "0 0 7px",
                      color: "#172033",
                    }}
                  >
                    {business.name}
                  </h2>

                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#667085",
                    }}
                  >
                    {business.area ||
                      business.address ||
                      t.businessDashboardLocationNotProvided}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#667085",
                    }}
                  >
                    {business.phone ||
                      business.email ||
                      t.businessDashboardContactNotProvided}
                  </p>
                </div>
              </div>
            </section>

            {/* STATISTICS */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
                marginBottom: "28px",
              }}
            >
              <DashboardCard
                title={t.businessDashboardBookings}
                value="0"
                description={
                  t.businessDashboardUpcomingBookings
                }
              />

              <DashboardCard
                title={t.businessDashboardCustomers}
                value="0"
                description={
                  t.businessDashboardCustomersServed
                }
              />

              <DashboardCard
                title={t.businessDashboardServices}
                value="0"
                description={
                  t.businessDashboardActiveServices
                }
              />

              <DashboardCard
                title={t.businessDashboardRevenue}
                value="0 FCFA"
                description={
                  t.businessDashboardTotalRecordedRevenue
                }
              />
            </section>

            {/* MANAGEMENT */}
            <section>
              <h2
                style={{
                  margin: "0 0 16px",
                  color: "#172033",
                }}
              >
                {t.businessDashboardManageTitle}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "18px",
                }}
              >
                <ManagementCard
                  title={t.businessDashboardServices}
                  description={
                    t.businessDashboardManageServices
                  }
                  href={`/business-dashboard/services?businessId=${business.id}`}
                  action={
                    t.businessDashboardManageServicesAction
                  }
                />

                <ManagementCard
                  title={t.businessDashboardBookings}
                  description={
                    t.businessDashboardManageBookings
                  }
                  href={`/business-dashboard/bookings?businessId=${business.id}`}
                  action={
                    t.businessDashboardBookingsAction
                  }
                />

                <ManagementCard
                  title={t.businessDashboardCustomers}
                  description={
                    t.businessDashboardManageCustomers
                  }
                  href={`/business-dashboard/customers?businessId=${business.id}`}
                  action={
                    t.businessDashboardCustomersAction
                  }
                />

                <ManagementCard
                  title={t.businessDashboardProfile}
                  description={
                    t.businessDashboardManageProfile
                  }
                  href={`/business-dashboard/profile?businessId=${business.id}`}
                  action={
                    t.businessDashboardEditProfile
                  }
                />

                <ManagementCard
                  title={t.businessDashboardEmployees}
                  description={
                    t.businessDashboardManageEmployees
                  }
                  href={`/business-dashboard/employees?businessId=${business.id}`}
                  action={
                    t.businessDashboardEmployeesAction
                  }
                />

                <ManagementCard
                  title={t.businessDashboardDepartments}
                  description={
                    t.businessDashboardManageDepartments
                  }
                  href={`/business-dashboard/departments?businessId=${business.id}`}
                  action={
                    t.businessDashboardDepartmentsAction
                  }
                />

                <ManagementCard
                  title={t.businessDashboardGallery}
                  description={
                    t.businessDashboardManageGallery
                  }
                  href={`/business-dashboard/gallery?businessId=${business.id}`}
                  action={
                    t.businessDashboardGalleryAction
                  }
                />

                <ManagementCard
                  title={t.businessDashboardReviews}
                  description={
                    t.businessDashboardManageReviews
                  }
                  href={`/business-dashboard/reviews?businessId=${business.id}`}
                  action={
                    t.businessDashboardReviewsAction
                  }
                />

                <ManagementCard
                  title={
                    t.businessDashboardSubscription
                  }
                  description={
                    t.businessDashboardManageSubscription
                  }
                  href={`/business-dashboard/subscription?businessId=${business.id}`}
                  action={
                    t.businessDashboardManageSubscriptionAction
                  }
                />
              </div>
            </section>

            {/* ECOS MESSAGE */}
            <section
              style={{
                marginTop: "35px",
                textAlign: "center",
                padding: "28px",
                background: "white",
                borderRadius: "16px",
                border:
                  "1px solid #e5e7eb",
              }}
            >
              <img
                src="/branding/everyday-connect-logo.png"
                alt="Everyday Connect"
                style={{
                  width: "190px",
                  maxWidth: "80%",
                  height: "auto",
                  marginBottom: "12px",
                }}
              />

              <p
                style={{
                  margin: 0,
                  color: "#00695c",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                {t.businessDashboardMakingLifeWorthLiving}
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function LoadingState() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 50,
        textAlign: "center",
        color: "#667085",
      }}
    >
      <h2
        style={{
          color: "#003b36",
          marginBottom: 10,
        }}
      >
        {t.businessDashboardLoadingTitle}
      </h2>

      <p style={{ margin: 0 }}>
        {t.businessDashboardLoadingDescription}
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 40,
        textAlign: "center",
        border: "1px solid #f1caca",
      }}
    >
      <h2
        style={{
          color: "#991b1b",
          marginBottom: 10,
        }}
      >
        {t.businessDashboardLoadErrorTitle}
      </h2>

      <p
        style={{
          color: "#667085",
          marginBottom: 20,
        }}
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        style={{
          border: "none",
          background: "#003b36",
          color: "white",
          padding: "11px 18px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {t.businessDashboardTryAgain}
      </button>
    </div>
  );
}

function NoBusinessState() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: 50,
        textAlign: "center",
        border: "1px solid #e5e7eb",
      }}
    >
      <h1
        style={{
          color: "#003b36",
          marginBottom: 12,
        }}
      >
        {t.businessDashboardNoBusinessTitle}
      </h1>

      <p
        style={{
          color: "#667085",
          lineHeight: 1.6,
          maxWidth: 600,
          margin: "0 auto 25px",
        }}
      >
        {t.businessDashboardNoBusinessDescription}
      </p>

      <Link
        to="/register-business"
        style={{
          display: "inline-block",
          background: "#003b36",
          color: "white",
          textDecoration: "none",
          padding: "13px 20px",
          borderRadius: 9,
          fontWeight: 700,
        }}
      >
        {t.businessDashboardRegisterBusiness}
      </Link>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow:
          "0 4px 18px rgba(0,0,0,0.06)",
        border:
          "1px solid #e8eceb",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          color: "#667085",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {title}
      </p>

      <div
        style={{
          fontSize: "30px",
          fontWeight: 800,
          color: "#003b36",
          marginBottom: "8px",
        }}
      >
        {value}
      </div>

      <p
        style={{
          margin: 0,
          color: "#98a2b3",
          fontSize: "13px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function ManagementCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        border:
          "1px solid #e5e7eb",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px",
          color: "#172033",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "0 0 20px",
          color: "#667085",
          lineHeight: 1.6,
          fontSize: "14px",
        }}
      >
        {description}
      </p>

      <Link
        to={href}
        style={{
          display: "inline-block",
          background: "#003b36",
          color: "white",
          textDecoration: "none",
          padding: "10px 15px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {action}
      </Link>
    </div>
  );
}

export default Dashboard;
