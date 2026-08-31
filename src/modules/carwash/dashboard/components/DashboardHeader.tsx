import { useNavigate } from "react-router-dom";

import { useAuth } from "@/core/auth";

export default function DashboardHeader() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  const firstName =
    fullName
      ? fullName.split(" ")[0]
      : user?.email?.split("@")[0] || "Customer";

  async function handleLogout() {
    try {
      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Unable to log out:",
        error
      );
    }
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        padding: "10px 0 25px",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 6px",
            color: "#667085",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Customer Dashboard
        </p>

        <h1
          style={{
            margin: 0,
            color: "#172033",
            fontSize: "clamp(28px, 5vw, 38px)",
            lineHeight: 1.15,
          }}
        >
          Welcome back, {firstName}
        </h1>

        <p
          style={{
            margin: "8px 0 0",
            color: "#667085",
            lineHeight: 1.5,
          }}
        >
          Manage your washes, bookings and
          vehicle care from one place.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/booking")}
          style={{
            padding: "11px 16px",
            border: "none",
            borderRadius: 9,
            background: "#003b36",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Book a Wash
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "11px 16px",
            border: "1px solid #d0d5dd",
            borderRadius: 9,
            background: "#fff",
            color: "#344054",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
