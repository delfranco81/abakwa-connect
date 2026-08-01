import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import BusinessActions from "../components/Business/BusinessActions";
import BusinessGallery from "../components/Business/BusinessGallery";
import BusinessServices from "../components/Business/BusinessServices";
import BusinessReviews from "../components/Admin/BusinessReviews";

type Place = {
  id: string;
  name: string;
  owner?: string;
  category?: string;
  description?: string;

  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;

  city?: string;
  area?: string;
  landmark?: string;

  latitude?: number;
  longitude?: number;

  logo?: string;
  image?: string;
  cover_image?: string;

  verified?: boolean;
  featured?: boolean;

  rating?: number;
};

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    loadBusiness();
  }, [id]);

  async function loadBusiness() {
    setLoading(true);

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
      console.error(error);
    } else {
      setPlace(data);
    }

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
          textAlign: "center",
        }}
      >
        <h2>Unable to load business</h2>

        <p>{error}</p>

        <Link to="/businesses">
          ← Back to Businesses
        </Link>
      </div>
    );
  }

  if (!place) {
    return (
      <div
        style={{
          padding: 80,
          textAlign: "center",
        }}
      >
        <h2>Business not found</h2>

        <Link to="/businesses">
          ← Back
        </Link>
      </div>
    );
  }

  const cover =
    place.cover_image ||
    place.image ||
    "https://placehold.co/1400x350?text=Business+Cover";

  const logo =
    place.logo ||
    place.image ||
    "https://placehold.co/150?text=Logo";

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        paddingBottom: 80,
      }}
    >
      {/* COVER */}

      <img
        src={cover}
        alt={place.name}
        style={{
          width: "100%",
          height: 320,
          objectFit: "cover",
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
          alt={place.name}
          style={{
            width: 150,
            height: 150,
            objectFit: "cover",
            borderRadius: "50%",
            border: "5px solid white",
            background: "#fff",
          }}
        />

        <h1>{place.name}</h1>

        <p
          style={{
            color: "#666",
            marginTop: -8,
          }}
        >
          {place.category}
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
          {place.verified && (
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

          {place.featured && (
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
          ⭐ {place.rating ?? 0}
        </div>

        {/* BUSINESS ACTIONS */}

        <div style={{ marginTop: 25 }}>
          <BusinessActions
            phone={place.phone}
            whatsapp={place.whatsapp}
            website={place.website}
            latitude={place.latitude}
            longitude={place.longitude}
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
          }}
        >
          {place.description || "No description available."}
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
          {place.phone && (
            <div>
              <strong>📞 Phone</strong>
              <p>{place.phone}</p>
            </div>
          )}

          {place.whatsapp && (
            <div>
              <strong>💬 WhatsApp</strong>
              <p>{place.whatsapp}</p>
            </div>
          )}

          {place.email && (
            <div>
              <strong>📧 Email</strong>
              <p>{place.email}</p>
            </div>
          )}

          {place.website && (
            <div>
              <strong>🌐 Website</strong>

              <p>
                <a
                  href={place.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Website
                </a>
              </p>
            </div>
          )}

          {(place.city || place.area) && (
            <div>
              <strong>📍 Location</strong>

              <p>
                {place.city}
                {place.city && place.area ? " • " : ""}
                {place.area}
              </p>
            </div>
          )}

          {place.landmark && (
            <div>
              <strong>📌 Landmark</strong>

              <p>{place.landmark}</p>
            </div>
          )}
        </div>
      </div>

      {/* BUSINESS GALLERY */}

      <div style={{ marginTop: 40 }}>
        <BusinessGallery placeId={place.id} />
      </div>

      {/* SERVICES */}

      <div style={{ marginTop: 40 }}>
        <BusinessServices placeId={place.id} />
      </div>

      {/* REVIEWS */}

      <div style={{ marginTop: 40 }}>
        <BusinessReviews placeId={place.id} />
      </div>
    </div>
  );
}