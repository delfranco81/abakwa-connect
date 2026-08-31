import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


import {
  getOwnedBusiness,
  type OwnedBusiness,
} from "../../services/business/BusinessOwnerService";

function Dashboard() {
  const [business, setBusiness] =
    useState<OwnedBusiness | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    try {
      setLoading(true);
      setError("");

      const ownedBusiness =
        await getOwnedBusiness();

      setBusiness(ownedBusiness);
    } catch (err) {
      console.error(
        "Business dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your business."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

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
                      ECOS Business
                    </p>

                    <h1
                      style={{
                        margin: "0 0 10px",
                        fontSize:
                          "clamp(28px, 5vw, 42px)",
                      }}
                    >
                      {business.name ||
                        "Business Dashboard"}
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
                        "Business"}
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
                        "Manage your business, services, bookings and customers from one place."}
                    </p>
                  </div>

                  <Link
                    to="/business-dashboard/profile"
                    style={{
                      color: "#003b36",
                      background: "white",
                      textDecoration: "none",
                      padding: "12px 18px",
                      borderRadius: "10px",
                      fontWeight: 700,
                    }}
                  >
                    Edit Business
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
                      {(business.name ||
                        "B")
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
                        "Location not provided"}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#667085",
                      }}
                    >
                      {business.phone ||
                        business.email ||
                        "Contact information not provided"}
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
                  title="Bookings"
                  value="0"
                  description="Upcoming customer bookings"
                />

                <DashboardCard
                  title="Customers"
                  value="0"
                  description="Customers served"
                />

                <DashboardCard
                  title="Services"
                  value="0"
                  description="Active services"
                />

                <DashboardCard
                  title="Revenue"
                  value="0 FCFA"
                  description="Total recorded revenue"
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
                  Manage your business
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
                    title="Services"
                    description="Create and manage the services your business offers."
                    href="/business-dashboard/services"
                    action="Manage Services"
                  />

                  <ManagementCard
                    title="Bookings"
                    description="View and manage customer bookings."
                    href="/business-dashboard/bookings"
                    action="View Bookings"
                  />

                  <ManagementCard
                    title="Customers"
                    description="Keep track of customers and their activity."
                    href="/business-dashboard/customers"
                    action="View Customers"
                  />

                  <ManagementCard
                    title="Business Profile"
                    description="Update your business information, logo and contact details."
                    href="/business-dashboard/profile"
                    action="Edit Profile"
                  />

                  <ManagementCard
                    title="Employees"
                    description="Manage employees working for your business."
                    href="/business-dashboard/employees"
                    action="Manage Employees"
                  />

                  <ManagementCard
                    title="Departments"
                    description="Organize your business into departments."
                    href="/business-dashboard/departments"
                    action="Manage Departments"
                  />

                  <ManagementCard
                    title="Gallery"
                    description="Manage photos and media for your business."
                    href="/business-dashboard/gallery"
                    action="Manage Gallery"
                  />

                  <ManagementCard
                    title="Reviews"
                    description="View and manage customer reviews."
                    href="/business-dashboard/reviews"
                    action="View Reviews"
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
                  Making Life Worth Living
                </p>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function LoadingState() {
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
        Loading your business...
      </h2>

      <p style={{ margin: 0 }}>
        Please wait while we load your business
        account.
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
        Unable to load your business
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
        Try Again
      </button>
    </div>
  );
}

function NoBusinessState() {
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
        You don't have a business yet
      </h1>

      <p
        style={{
          color: "#667085",
          lineHeight: 1.6,
          maxWidth: 600,
          margin: "0 auto 25px",
        }}
      >
        Register your business to start using
        the ECOS business management dashboard.
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
        Register My Business
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
