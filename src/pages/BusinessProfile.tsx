import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import BusinessActions from "../components/Business/BusinessActions";
import BusinessGallery from "../components/Business/BusinessGallery";
import BusinessServices from "../components/Business/BusinessServices";
import BusinessReviews from "../components/Admin/BusinessReviews";

type Business = {
  id: string;
  name?: string | null;
  owner?: string | null;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  about?: string | null;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;

  area?: string | null;
  landmark?: string | null;
  address?: string | null;
  city?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  logo?: string | null;
  cover_image?: string | null;

  verified?: boolean | string | null;
  featured?: boolean | string | null;

  rating?: number | string | null;
  total_reviews?: number | string | null;

  slogan?: string | null;
  opening_hours?: string | null;
  price_range?: string | null;
};

function asBoolean(value: unknown): boolean {
  if (value === true) return true;

  if (typeof value === "string") {
    return ["true", "1", "yes", "verified"].includes(
      value.trim().toLowerCase()
    );
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
}

function asNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No business ID was provided.");
      setLoading(false);
      return;
    }

    loadBusiness(id);
  }, [id]);

  async function loadBusiness(businessId: string) {
    setLoading(true);
    setError("");

    const { data, error: databaseError } = await supabase
      .from("business")
      .select("*")
      .eq("id", businessId)
      .single();

    if (databaseError) {
      console.error("Business profile error:", databaseError);
      setError(databaseError.message);
      setBusiness(null);
      setLoading(false);
      return;
    }

    setBusiness(data as Business);
    setLoading(false);
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 80,
          textAlign: "center",
          fontSize: 22,
        }}
      >
        Loading business...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 800,
          margin: "80px auto",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2>Unable to load business</h2>

        <p
          style={{
            color: "#b91c1c",
            wordBreak: "break-word",
          }}
        >
          {error}
        </p>

        <Link to="/businesses">
          ← Back to Businesses
        </Link>
      </div>
    );
  }

  if (!business) {
    return (
      <div
        style={{
          padding: 80,
          textAlign: "center",
        }}
      >
        <h2>Business not found</h2>

        <Link to="/businesses">
          ← Back to Businesses
        </Link>
      </div>
    );
  }

  const verified = asBoolean(business.verified);
  const featured = asBoolean(business.featured);
  const rating = asNumber(business.rating);
  const totalReviews = asNumber(business.total_reviews);

  const cover =
    business.cover_image ||
    "https://placehold.co/1400x350?text=Everyday+Connect";

  const logo =
    business.logo ||
    "https://placehold.co/150x150?text=Business";

  const location = [
    business.city,
    business.area,
    business.address,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        paddingBottom: 80,
      }}
    >
      <Link
        to="/businesses"
        style={{
          display: "inline-block",
          margin: "20px",
        }}
      >
        ← Back to Businesses
      </Link>

      {/* COVER */}

      <img
        src={cover}
        alt={business.name || "Business cover"}
        style={{
          width: "100%",
          height: 320,
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginTop: -70,
          padding: "0 20px",
        }}
      >
        <img
          src={logo}
          alt={business.name || "Business logo"}
          style={{
            width: 150,
            height: 150,
            objectFit: "cover",
            borderRadius: "50%",
            border: "5px solid white",
            background: "#fff",
          }}
        />

        <h1>{business.name || "Unnamed Business"}</h1>

        {business.slogan && (
          <p
            style={{
              color: "#64748b",
              fontStyle: "italic",
            }}
          >
            {business.slogan}
          </p>
        )}

        <p
          style={{
            color: "#666",
            marginTop: 8,
          }}
        >
          {business.category || "Business"}
          {business.subcategory
            ? ` • ${business.subcategory}`
            : ""}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          {verified && (
            <span
              style={{
                background: "#DCFCE7",
                color: "#166534",
                padding: "6px 14px",
                borderRadius: 25,
                fontWeight: 600,
              }}
            >
              ✔ Verified
            </span>
          )}

          {featured && (
            <span
              style={{
                background: "#FEF3C7",
                color: "#92400E",
                padding: "6px 14px",
                borderRadius: 25,
                fontWeight: 600,
              }}
            >
              ⭐ Featured
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          ⭐ {rating.toFixed(1)}
          {totalReviews > 0 && (
            <span
              style={{
                fontSize: 14,
                color: "#64748b",
                marginLeft: 8,
                fontWeight: 400,
              }}
            >
              ({totalReviews} reviews)
            </span>
          )}
        </div>

        {/* ACTIONS */}

        <div style={{ marginTop: 25 }}>
          <BusinessActions
            phone={business.phone || undefined}
            whatsapp={business.whatsapp || undefined}
            website={business.website || undefined}
            latitude={business.latitude ?? undefined}
            longitude={business.longitude ?? undefined}
          />
        </div>
      </div>

      {/* ABOUT */}

      <div
        style={{
          marginTop: 40,
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 25,
        }}
      >
        <h2>About</h2>

        <p
          style={{
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {business.about ||
            business.description ||
            "No description available."}
        </p>

        <hr style={{ margin: "30px 0" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 25,
          }}
        >
          {business.owner && (
            <div>
              <strong>👤 Owner</strong>
              <p>{business.owner}</p>
            </div>
          )}

          {business.phone && (
            <div>
              <strong>📞 Phone</strong>
              <p>{business.phone}</p>
            </div>
          )}

          {business.whatsapp && (
            <div>
              <strong>💬 WhatsApp</strong>
              <p>{business.whatsapp}</p>
            </div>
          )}

          {business.email && (
            <div>
              <strong>📧 Email</strong>
              <p>{business.email}</p>
            </div>
          )}

          {business.website && (
            <div>
              <strong>🌐 Website</strong>

              <p>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Website
                </a>
              </p>
            </div>
          )}

          {location && (
            <div>
              <strong>📍 Location</strong>
              <p>{location}</p>
            </div>
          )}

          {business.landmark && (
            <div>
              <strong>📌 Landmark</strong>
              <p>{business.landmark}</p>
            </div>
          )}

          {business.opening_hours && (
            <div>
              <strong>🕒 Opening Hours</strong>
              <p>{business.opening_hours}</p>
            </div>
          )}

          {business.price_range && (
            <div>
              <strong>💰 Price Range</strong>
              <p>{business.price_range}</p>
            </div>
          )}
        </div>
      </div>

      {/* GALLERY */}

      <BusinessGallery businessId={business.id} />

      {/* SERVICES */}

      <BusinessServices businessId={business.id} />

      {/* REVIEWS */}

      <BusinessReviews businessId={business.id} />
    </div>
  );
}
