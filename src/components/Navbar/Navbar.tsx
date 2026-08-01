import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close the mobile sidebar drawer when a user switches routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  // Style helper to handle active states dynamically
  const getLinkStyle = (path: string) => ({
    color: "white",
    textDecoration: isActive(path) ? "underline" : "none",
    fontWeight: isActive(path) ? 700 : 500,
    fontSize: "14px",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000, // Floats safely over leaflet maps
        background: "#003366",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
          boxSizing: "border-box"
        }}
      >
        {/* BRAND IDENTITY */}
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>Abakwa Connect</h2>
        </Link>

        {/* DESKTOP LINK SYSTEM (Collapses automatically on mobile) */}
        <nav 
          className="desktop-nav" 
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center"
          }}
        >
          <Link style={getLinkStyle("/")} to="/">Home</Link>
          <Link style={getLinkStyle("/cleaning services")} to="/cleaning services">Carwash</Link>
          <Link style={getLinkStyle("/explore")} to="/explore">Explore</Link>
          <Link style={getLinkStyle("/taxi")} to="/taxi">Taxi</Link>
          <Link style={getLinkStyle("/bike")} to="/bike">Bike</Link>
          <Link style={getLinkStyle("/food")} to="/food">Food</Link>
          <Link style={getLinkStyle("/hotels")} to="/hotels">Hotels</Link>
          <Link style={getLinkStyle("/contact")} to="/contact">Contact</Link>
          <Link style={getLinkStyle("/map")} to="/map">Map</Link>
        </nav>

        {/* MOBILE BURGER TOGGLE UTILITY BUTTON */}
        <button
          className="mobile-burger-btn"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "none", // Toggled active under max-width 768px in global stylesheet
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <div style={{ width: "22px", height: "2px", background: "white", transition: "0.2s", transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <div style={{ width: "22px", height: "2px", background: "white", transition: "0.2s", opacity: mobileMenuOpen ? 0 : 1 }} />
          <div style={{ width: "22px", height: "2px", background: "white", transition: "0.2s", transform: mobileMenuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </div>

      {/* MOBILE DRAWER FLYOUT CONTAINER */}
      <div
        style={{
          position: "fixed",
          top: "64px",
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          opacity: mobileMenuOpen ? 1 : 0,
          visibility: mobileMenuOpen ? "visible" : "hidden",
          transition: "opacity 0.25s ease, visibility 0.25s",
          zIndex: 999,
        }}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "260px",
            height: "100%",
            background: "#002244", // Slightly darker shade of blue for distinct slide layer background depth
            boxShadow: "-4px 0 24px rgba(0,0,0,0.2)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxSizing: "border-box",
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#6699cc", letterSpacing: "1px", marginBottom: "8px" }}>
            Categories & Tools
          </span>

          <Link to="/" style={mobileLinkStyle}>🏠 Home</Link>
          <Link to="/cleaning services" style={mobileLinkStyle}>🧼 Carwash Hub</Link>
          <Link to="/explore" style={mobileLinkStyle}>🔍 Explore Places</Link>
          <Link to="/taxi" style={mobileLinkStyle}>🚖 Taxi Booking</Link>
          <Link to="/bike" style={mobileLinkStyle}>🏍️ Moto Bike Hire</Link>
          <Link to="/food" style={mobileLinkStyle}>🍲 Food Delivery</Link>
          <Link to="/hotels" style={mobileLinkStyle}>🏨 Hotels & Lodging</Link>
          <Link to="/contact" style={mobileLinkStyle}>📞 Contact Support</Link>
          <Link to="/map" style={mobileLinkStyle}>🗺️ Interactive Map</Link>
        </div>
      </div>
    </header>
  );
}

// Sidebar Drawer specific styles
const mobileLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 500,
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "block",
};

export default Navbar;