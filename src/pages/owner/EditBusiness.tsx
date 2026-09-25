import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOwnedBusinessById } from "../../services/business/BusinessOwnerService";

type BusinessForm = {
  id: string;
  place_id: string | null;
  name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  area: string;
  landmark: string;
  address: string;
  opening_hours: string;
  latitude: number | null;
  longitude: number | null;
};

export default function EditBusiness() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  const [business, setBusiness] = useState<BusinessForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      setLoading(true);
      setErrorMessage("");

      if (!businessId) {
        setErrorMessage("No business was selected.");
        setLoading(false);
        return;
      }

      try {
        const ownedBusiness = await getOwnedBusinessById(businessId);

        if (!ownedBusiness) {
          setErrorMessage(
            "Business not found or you do not have permission to manage it."
          );
          setLoading(false);
          return;
        }

        setBusiness({
          id: ownedBusiness.id,
          place_id: ownedBusiness.place_id,
          name: ownedBusiness.name ?? "",
          category: ownedBusiness.category ?? "",
          description: ownedBusiness.description ?? "",
          phone: ownedBusiness.phone ?? "",
          whatsapp: ownedBusiness.whatsapp ?? "",
          email: ownedBusiness.email ?? "",
          website: ownedBusiness.website ?? "",
          area: ownedBusiness.area ?? "",
          landmark: ownedBusiness.landmark ?? "",
          address: ownedBusiness.address ?? "",
          opening_hours: ownedBusiness.opening_hours ?? "",
          latitude: ownedBusiness.latitude ?? null,
          longitude: ownedBusiness.longitude ?? null,
        });
      } catch (error) {
        console.error("Failed to load owned business:", error);
        setErrorMessage("Unable to load this business.");
      } finally {
        setLoading(false);
      }
    }

    void loadBusiness();
  }, [businessId]);

  async function saveBusiness() {
    if (!business) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const { error: businessError } = await supabase
        .from("business")
        .update({
          name: business.name,
          category: business.category,
          description: business.description,
          phone: business.phone,
          whatsapp: business.whatsapp,
          email: business.email,
          website: business.website,
          area: business.area,
          landmark: business.landmark,
          address: business.address,
          opening_hours: business.opening_hours,
          latitude: business.latitude,
          longitude: business.longitude,
        })
        .eq("id", business.id);

      if (businessError) {
        throw businessError;
      }

      if (business.place_id) {
        const { error: placeError } = await supabase
          .from("places")
          .update({
            name: business.name,
            category: business.category,
            description: business.description,
            phone: business.phone,
            email: business.email,
            website: business.website,
            address: business.address,
            opening_hours: business.opening_hours,
            subdivision: business.area,
            latitude: business.latitude,
            longitude: business.longitude,
            lat: business.latitude,
            lng: business.longitude,
          })
          .eq("id", business.place_id);

        if (placeError) {
          throw placeError;
        }
      }

      alert("Business updated successfully!");
    } catch (error) {
      console.error("Failed to update business:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to update business.";

      setErrorMessage(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <h2>Loading business...</h2>;
  }

  if (!business) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: 30 }}>
        <h2>Business unavailable</h2>
        <p>{errorMessage || "No business found."}</p>
      </div>
    );
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

      {errorMessage && (
        <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        <input
          placeholder="Business Name"
          value={business.name}
          onChange={(e) =>
            setBusiness({ ...business, name: e.target.value })
          }
        />

        <input
          placeholder="Category"
          value={business.category}
          onChange={(e) =>
            setBusiness({ ...business, category: e.target.value })
          }
        />

        <textarea
          rows={5}
          placeholder="Description"
          value={business.description}
          onChange={(e) =>
            setBusiness({ ...business, description: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          value={business.phone}
          onChange={(e) =>
            setBusiness({ ...business, phone: e.target.value })
          }
        />

        <input
          placeholder="WhatsApp"
          value={business.whatsapp}
          onChange={(e) =>
            setBusiness({ ...business, whatsapp: e.target.value })
          }
        />

        <input
          placeholder="Email"
          value={business.email}
          onChange={(e) =>
            setBusiness({ ...business, email: e.target.value })
          }
        />

        <input
          placeholder="Website"
          value={business.website}
          onChange={(e) =>
            setBusiness({ ...business, website: e.target.value })
          }
        />

        <input
          placeholder="Area"
          value={business.area}
          onChange={(e) =>
            setBusiness({ ...business, area: e.target.value })
          }
        />

        <input
          placeholder="Landmark"
          value={business.landmark}
          onChange={(e) =>
            setBusiness({ ...business, landmark: e.target.value })
          }
        />

        <input
          placeholder="Address"
          value={business.address}
          onChange={(e) =>
            setBusiness({ ...business, address: e.target.value })
          }
        />

        <input
          placeholder="Opening Hours"
          value={business.opening_hours}
          onChange={(e) =>
            setBusiness({
              ...business,
              opening_hours: e.target.value,
            })
          }
        />

        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={business.latitude ?? ""}
          onChange={(e) =>
            setBusiness({
              ...business,
              latitude:
                e.target.value === "" ? null : Number(e.target.value),
            })
          }
        />

        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={business.longitude ?? ""}
          onChange={(e) =>
            setBusiness({
              ...business,
              longitude:
                e.target.value === "" ? null : Number(e.target.value),
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
            cursor: saving ? "not-allowed" : "pointer",
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
