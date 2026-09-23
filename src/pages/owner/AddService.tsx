import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext";

type CleaningCategory =
  | "car-wash"
  | "vehicle-detailing"
  | "home-cleaning"
  | "hotel-cleaning"
  | "office-cleaning"
  | "laundry"
  | "carpet-cleaning"
  | "general-cleaning"
  | "other-cleaning";

type Service = {
  id: string;
  business_id: string;
  service_name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  duration_minutes: number | null;
  is_featured: boolean;
  display_order: number | null;
  active: boolean;
  cleaning_category: CleaningCategory | null;
};

const cleaningCategories: {
  value: CleaningCategory;
  label: string;
}[] = [
  { value: "car-wash", label: "Car Wash" },
  { value: "vehicle-detailing", label: "Vehicle Detailing" },
  { value: "home-cleaning", label: "Home Cleaning" },
  { value: "hotel-cleaning", label: "Hotel Cleaning" },
  { value: "office-cleaning", label: "Office / Space Cleaning" },
  { value: "laundry", label: "Clothes Laundry" },
  { value: "carpet-cleaning", label: "Carpet Cleaning" },
  { value: "general-cleaning", label: "General Cleaning" },
  { value: "other-cleaning", label: "Other Cleaning" },
];

export default function AddService() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const businessId = searchParams.get("businessId") ?? "";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [isCleaningService, setIsCleaningService] = useState(false);
  const [cleaningCategory, setCleaningCategory] =
    useState<CleaningCategory | "">("");

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    loadServices();
  }, [businessId]);

  async function loadServices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("business_services")
      .select(
        "id,business_id,service_name,description,price,currency,duration_minutes,is_featured,display_order,active,cleaning_category"
      )
      .eq("business_id", businessId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Unable to load business services:", error);
      alert(error.message);
      setServices([]);
      setLoading(false);
      return;
    }

    setServices((data ?? []) as Service[]);
    setLoading(false);
  }

  function resetForm() {
    setServiceName("");
    setDescription("");
    setPrice("");
    setDuration("");
    setIsCleaningService(false);
    setCleaningCategory("");
  }

  async function saveService() {
    if (!businessId) {
      alert("A business must be selected before saving a service.");
      return;
    }

    if (!serviceName.trim()) {
      alert("Please enter a service name.");
      return;
    }

    const numericPrice = Number(price);
    const numericDuration = Number(duration);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      alert("Please enter a valid billing rate.");
      return;
    }

    if (!Number.isFinite(numericDuration) || numericDuration < 0) {
      alert("Please enter a valid duration.");
      return;
    }

    if (isCleaningService && !cleaningCategory) {
      alert("Please select a Cleaning Services category.");
      return;
    }

    setSaving(true);

    const nextDisplayOrder =
      services.length > 0
        ? Math.max(
            ...services.map((service) => service.display_order ?? 0)
          ) + 1
        : 1;

    const { error } = await supabase
      .from("business_services")
      .insert({
        business_id: businessId,
        service_name: serviceName.trim(),
        description: description.trim() || null,
        price: numericPrice,
        currency: "FCFA",
        duration_minutes: numericDuration,
        is_featured: false,
        display_order: nextDisplayOrder,
        active: true,
        cleaning_category: isCleaningService
          ? cleaningCategory
          : null,
      });

    setSaving(false);

    if (error) {
      console.error("Unable to save service:", error);
      alert(error.message);
      return;
    }

    resetForm();
    await loadServices();
  }

  async function updateService(service: Service) {
    const { error } = await supabase
      .from("business_services")
      .update({
        service_name: service.service_name.trim(),
        description: service.description?.trim() || null,
        price: Number(service.price ?? 0),
        currency: service.currency || "FCFA",
        duration_minutes: Number(service.duration_minutes ?? 0),
        is_featured: service.is_featured,
        active: service.active,
        cleaning_category: service.cleaning_category || null,
      })
      .eq("id", service.id)
      .eq("business_id", businessId);

    if (error) {
      console.error("Unable to update service:", error);
      alert(error.message);
      return;
    }

    await loadServices();
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) {
      return;
    }

    const { error } = await supabase
      .from("business_services")
      .delete()
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) {
      console.error("Unable to delete service:", error);
      alert(error.message);
      return;
    }

    await loadServices();
  }

  function updateServiceField(
    id: string,
    field: keyof Service,
    value: unknown
  ) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              [field]: value,
            }
          : service
      )
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
        <h2>{t.loading ?? "Loading..."}</h2>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
        <h1>Business Services</h1>
        <p>
          A business could not be identified. Please open Services from
          your Business Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: "0 20px 60px",
      }}
    >
      <h1>Business Services &amp; Pricing</h1>

      <p style={{ color: "#64748b", marginTop: 8 }}>
        Add the services your business offers and set the billing rate
        customers will see.
      </p>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          marginTop: 30,
          background: "#fff",
        }}
      >
        <h2>Add Service</h2>

        <div
          style={{
            display: "grid",
            gap: 16,
            maxWidth: 700,
            marginTop: 20,
          }}
        >
          <input
            placeholder="Service name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />

          <textarea
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>
            Service type
            <select
              value={isCleaningService ? "cleaning" : "regular"}
              onChange={(e) => {
                const cleaning = e.target.value === "cleaning";
                setIsCleaningService(cleaning);

                if (!cleaning) {
                  setCleaningCategory("");
                }
              }}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
              }}
            >
              <option value="regular">Regular Business Service</option>
              <option value="cleaning">Cleaning Service</option>
            </select>
          </label>

          {isCleaningService && (
            <label>
              Cleaning Services category
              <select
                value={cleaningCategory}
                onChange={(e) =>
                  setCleaningCategory(
                    e.target.value as CleaningCategory
                  )
                }
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 6,
                }}
              >
                <option value="">Select a category</option>

                {cleaningCategories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Billing rate
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Billing rate"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
              }}
            />
            <small style={{ color: "#64748b" }}>
              Currency: FCFA
            </small>
          </label>

          <label>
            Duration
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Duration in minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
              }}
            />
          </label>

          <button
            onClick={saveService}
            disabled={saving}
            style={{
              padding: "12px 18px",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Service"}
          </button>
        </div>
      </section>

      <section style={{ marginTop: 35 }}>
        <h2>Existing Services &amp; Billing Rates</h2>

        {!services.length && (
          <p style={{ color: "#64748b", marginTop: 15 }}>
            No services have been added yet.
          </p>
        )}

        <div style={{ marginTop: 20 }}>
          {services.map((service) => (
            <div
              key={service.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 22,
                marginBottom: 18,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <input
                  value={service.service_name}
                  onChange={(e) =>
                    updateServiceField(
                      service.id,
                      "service_name",
                      e.target.value
                    )
                  }
                />

                <textarea
                  rows={3}
                  value={service.description ?? ""}
                  onChange={(e) =>
                    updateServiceField(
                      service.id,
                      "description",
                      e.target.value
                    )
                  }
                />

                <label>
                  Service type
                  <select
                    value={
                      service.cleaning_category
                        ? "cleaning"
                        : "regular"
                    }
                    onChange={(e) => {
                      if (e.target.value === "cleaning") {
                        updateServiceField(
                          service.id,
                          "cleaning_category",
                          service.cleaning_category ??
                            "general-cleaning"
                        );
                      } else {
                        updateServiceField(
                          service.id,
                          "cleaning_category",
                          null
                        );
                      }
                    }}
                  >
                    <option value="regular">
                      Regular Business Service
                    </option>
                    <option value="cleaning">
                      Cleaning Service
                    </option>
                  </select>
                </label>

                {service.cleaning_category && (
                  <label>
                    Cleaning Services category
                    <select
                      value={service.cleaning_category}
                      onChange={(e) =>
                        updateServiceField(
                          service.id,
                          "cleaning_category",
                          e.target.value as CleaningCategory
                        )
                      }
                    >
                      {cleaningCategories.map((category) => (
                        <option
                          key={category.value}
                          value={category.value}
                        >
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  Billing rate
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={service.price ?? 0}
                    onChange={(e) =>
                      updateServiceField(
                        service.id,
                        "price",
                        Number(e.target.value)
                      )
                    }
                  />
                  <small style={{ color: "#64748b" }}>
                    {service.currency || "FCFA"}
                  </small>
                </label>

                <label>
                  Duration
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={service.duration_minutes ?? 0}
                    onChange={(e) =>
                      updateServiceField(
                        service.id,
                        "duration_minutes",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={service.is_featured}
                    onChange={(e) =>
                      updateServiceField(
                        service.id,
                        "is_featured",
                        e.target.checked
                      )
                    }
                  />
                  {" Featured Service"}
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={service.active}
                    onChange={(e) =>
                      updateServiceField(
                        service.id,
                        "active",
                        e.target.checked
                      )
                    }
                  />
                  {" Active"}
                </label>

                <div>
                  <button
                    onClick={() => updateService(service)}
                    style={{ marginRight: 10 }}
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={() => deleteService(service.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
