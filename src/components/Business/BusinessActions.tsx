import {
  FaPhone,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkerAlt,
  FaHeart,
  FaShareAlt,
} from "react-icons/fa";

type Props = {
  phone?: string;
  whatsapp?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
};

export default function BusinessActions({
  phone,
  whatsapp,
  website,
  latitude,
  longitude,
}: Props) {
  const openDirections = () => {
    if (!latitude || !longitude) return;

    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  const shareBusiness = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Business link copied to clipboard.");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 15,
        marginTop: 30,
      }}
    >
      {phone && (
        <a href={`tel:${phone}`} style={cardStyle}>
          <FaPhone size={24} />
          <span>Call</span>
        </a>
      )}

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          style={cardStyle}
        >
          <FaWhatsapp
            size={24}
            color="#25D366"
          />
          <span>WhatsApp</span>
        </a>
      )}

      {website && (
        <a
          href={
            website.startsWith("http")
              ? website
              : `https://${website}`
          }
          target="_blank"
          rel="noreferrer"
          style={cardStyle}
        >
          <FaGlobe size={24} />
          <span>Website</span>
        </a>
      )}

      {latitude !== undefined &&
        longitude !== undefined &&
        latitude !== 0 &&
        longitude !== 0 && (
          <button
            onClick={openDirections}
            style={buttonStyle}
          >
            <FaMapMarkerAlt size={24} />
            <span>Directions</span>
          </button>
        )}

      <button
        style={buttonStyle}
        onClick={() =>
          alert("Favorites coming soon ❤️")
        }
      >
        <FaHeart
          size={24}
          color="crimson"
        />
        <span>Save</span>
      </button>

      <button
        style={buttonStyle}
        onClick={shareBusiness}
      >
        <FaShareAlt size={22} />
        <span>Share</span>
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: 20,
  textDecoration: "none",
  color: "#111827",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
  fontWeight: 600,
  transition: "0.2s",
};

const buttonStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 15,
};