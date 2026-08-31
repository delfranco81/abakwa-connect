import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <section
      style={{
        padding: 20,
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
      }}
    >
      <h2
        style={{
          margin: "0 0 15px",
          fontSize: 20,
          color: "#172033",
        }}
      >
        Quick Actions
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() =>
            navigate("/booking")
          }
          style={actionStyle}
        >
          <strong>Book Wash</strong>
          <span>
            Schedule a new service
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/cleaning-services")
          }
          style={actionStyle}
        >
          <strong>Cleaning Services</strong>
          <span>
            Explore available providers
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/businesses")
          }
          style={actionStyle}
        >
          <strong>Find Businesses</strong>
          <span>
            Browse local businesses
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            scrollTo("wallet-card")
          }
          style={actionStyle}
        >
          <strong>Wallet</strong>
          <span>
            View wallet status
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            scrollTo("booking-history")
          }
          style={actionStyle}
        >
          <strong>History</strong>
          <span>
            View previous bookings
          </span>
        </button>
      </div>
    </section>
  );
}

const actionStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "flex-start",
  gap: 5,
  padding: "15px 16px",
  border: "1px solid #d0d5dd",
  borderRadius: 10,
  background: "#fff",
  color: "#172033",
  cursor: "pointer",
  textAlign: "left" as const,
};
