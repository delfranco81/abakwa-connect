import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Service = {
  id: string;
  service_name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  display_order?: number | null;
};

type Props = {
  businessId: string;
};

export default function BusinessServices({
  businessId,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    loadServices();
  }, [businessId]);

  async function loadServices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("business_services")
      .select("*")
      .eq("business_id", businessId)
      .eq("active", true)
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Unable to load business services:",
        error
      );

      setServices([]);
      setLoading(false);
      return;
    }

    setServices((data || []) as Service[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <div
        style={{
          marginTop: 40,
          padding: 24,
          textAlign: "center",
        }}
      >
        Loading services...
      </div>
    );
  }

  if (!services.length) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: 40,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <h2>Services & Pricing</h2>

      <div>
        {services.map((service, index) => {
          const price = Number(service.price);

          return (
            <div
              key={service.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                padding: "18px 0",
                borderBottom:
                  index === services.length - 1
                    ? "none"
                    : "1px solid #eee",
              }}
            >
              <div>
                <strong>
                  {service.service_name}
                </strong>

                {service.description && (
                  <div
                    style={{
                      color: "#666",
                      marginTop: 5,
                      lineHeight: 1.5,
                    }}
                  >
                    {service.description}
                  </div>
                )}

                {service.duration_minutes &&
                  service.duration_minutes > 0 && (
                    <small
                      style={{
                        display: "block",
                        marginTop: 7,
                        color: "#64748b",
                      }}
                    >
                      ⏱ {service.duration_minutes} min
                    </small>
                  )}
              </div>

              {Number.isFinite(price) && price > 0 && (
                <div
                  style={{
                    fontWeight: 700,
                    color: "#16a34a",
                    whiteSpace: "nowrap",
                  }}
                >
                  {price.toLocaleString()}{" "}
                  {service.currency || "FCFA"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
