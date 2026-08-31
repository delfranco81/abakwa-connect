import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside
      style={{
        width: 250,
        background: "#0f172a",
        color: "white",
        padding: 20,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
          }}
        >
          Everyday Connect
        </h2>

        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          Making everyday worth living.
        </p>
      </div>

      <nav style={{ marginTop: 30 }}>
        <Link to="/admin" style={linkStyle}>
          📊 Dashboard
        </Link>

        <Link to="/admin/places" style={linkStyle}>
          📍 Places
        </Link>

        <Link to="/admin/businesses" style={linkStyle}>
          🏢 Businesses
        </Link>

        <Link to="/admin/media" style={linkStyle}>
          🖼️ Media
        </Link>
      </nav>
    </aside>
  );
}

const linkStyle = {
  display: "block",
  color: "white",
  textDecoration: "none",
  marginBottom: "15px",
};

export default Sidebar;