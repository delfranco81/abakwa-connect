import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Place = {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  city: string;
  area: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  logo: string | null;
  cover_image: string | null;
  verified: boolean;
  featured: boolean;
};

export default function EditBusiness() {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    setLoading(true);

    // Temporary:
    // Loads the first business.
    // Later we'll replace this with owner authentication.
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
    } else {
      setPlace(data);
    }

    setLoading(false);
  }

  async function saveBusiness() {
    if (!place) return;

    setSaving(true);

    const { error } = await supabase
      .from("places")
      .update({
        name: place.name,
        category: place.category,
        description: place.description,
        phone: place.phone,
        whatsapp: place.whatsapp,
        email: place.email,
        website: place.website,
        city: place.city,
        area: place.area,
        landmark: place.landmark,
        latitude: place.latitude,
        longitude: place.longitude,
      })
      .eq("id", place.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Business updated successfully!");
  }

  if (loading) {
    return <h2>Loading business...</h2>;
  }

  if (!place) {
    return <h2>No business found.</h2>;
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        background: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,.08)",
      }}
    >
      <h1>Edit Business</h1>

      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        <input
          placeholder="Business Name"
          value={place.name}
          onChange={(e) =>
            setPlace({ ...place, name: e.target.value })
          }
        />

        <input
          placeholder="Category"
          value={place.category}
          onChange={(e) =>
            setPlace({ ...place, category: e.target.value })
          }
        />

        <textarea
          rows={5}
          placeholder="Description"
          value={place.description}
          onChange={(e) =>
            setPlace({ ...place, description: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          value={place.phone}
          onChange={(e) =>
            setPlace({ ...place, phone: e.target.value })
          }
        />

        <input
          placeholder="WhatsApp"
          value={place.whatsapp}
          onChange={(e) =>
            setPlace({ ...place, whatsapp: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={place.email}
          onChange={(e) =>
            setPlace({ ...place, email: e.target.value })
          }
        />

        <input
          placeholder="Website"
          value={place.website}
          onChange={(e) =>
            setPlace({ ...place, website: e.target.value })
          }
        />

        <input
          placeholder="City"
          value={place.city}
          onChange={(e) =>
            setPlace({ ...place, city: e.target.value })
          }
        />

        <input
          placeholder="Area"
          value={place.area}
          onChange={(e) =>
            setPlace({ ...place, area: e.target.value })
          }
        />

        <input
          placeholder="Landmark"
          value={place.landmark}
          onChange={(e) =>
            setPlace({ ...place, landmark: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Latitude"
          value={place.latitude ?? ""}
          onChange={(e) =>
            setPlace({
              ...place,
              latitude:
                e.target.value === ""
                  ? null
                  : Number(e.target.value),
            })
          }
        />

        <input
          type="number"
          placeholder="Longitude"
          value={place.longitude ?? ""}
          onChange={(e) =>
            setPlace({
              ...place,
              longitude:
                e.target.value === ""
                  ? null
                  : Number(e.target.value),
            })
          }
        />

        <button
          onClick={saveBusiness}
          disabled={saving}
          style={{
            padding: 15,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}