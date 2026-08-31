type Props = {
  onSelect: (
    role: "customer" | "business"
  ) => void;
};

function AccountType({ onSelect }: Props) {
  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "30px 20px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "35px",
        }}
      >
        <img
          src="/branding/everyday-connect-logo.png"
          alt="Every Day Connect"
          style={{
            width: "110px",
            height: "110px",
            objectFit: "contain",
            marginBottom: "18px",
          }}
        />

        <h2
          style={{
            margin: 0,
            color: "#063b3f",
            fontSize: "30px",
          }}
        >
          Join Every Day Connect
        </h2>

        <p
          style={{
            color: "#64748b",
            fontSize: "16px",
            marginTop: "10px",
          }}
        >
          Making Every Day Worth Living
        </p>
      </div>

      <h3
        style={{
          textAlign: "center",
          color: "#0f172a",
          marginBottom: "10px",
        }}
      >
        How would you like to use the platform?
      </h3>

      <p
        style={{
          textAlign: "center",
          color: "#64748b",
          marginBottom: "25px",
        }}
      >
        Customers can discover services, while
        businesses can reach new customers across
        the Everyday Connect ecosystem.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        {/* CUSTOMER */}
        <button
          type="button"
          onClick={() => onSelect("customer")}
          style={accountCardStyle}
        >
          <div style={iconStyle}>👤</div>

          <h3 style={cardTitleStyle}>
            I am a Customer
          </h3>

          <p style={cardTextStyle}>
            Discover trusted businesses, cleaning
            services, car washes, food, transport,
            hotels, news and places around you.
          </p>

          <span style={cardActionStyle}>
            Continue as Customer →
          </span>
        </button>

        {/* BUSINESS */}
        <button
          type="button"
          onClick={() => onSelect("business")}
          style={accountCardStyle}
        >
          <div style={iconStyle}>🏪</div>

          <h3 style={cardTitleStyle}>
            I own a Business
          </h3>

          <p style={cardTextStyle}>
            Register your business and offer your
            services through Everyday Connect.
            Cleaning companies and car washes can
            operate together in the same ecosystem.
          </p>

          <span style={cardActionStyle}>
            Register My Business →
          </span>
        </button>
      </div>
    </div>
  );
}

const accountCardStyle = {
  border: "1px solid #dbe4e7",
  background: "white",
  borderRadius: "18px",
  padding: "28px",
  textAlign: "left" as const,
  cursor: "pointer",
  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
  transition:
    "transform 0.2s ease, box-shadow 0.2s ease",
};

const iconStyle = {
  fontSize: "42px",
  marginBottom: "12px",
};

const cardTitleStyle = {
  color: "#063b3f",
  margin: "0 0 10px",
  fontSize: "21px",
};

const cardTextStyle = {
  color: "#64748b",
  lineHeight: 1.6,
  margin: "0 0 20px",
};

const cardActionStyle = {
  color: "#087f85",
  fontWeight: 700,
};

export default AccountType;