import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Service = {
  id: string;
  service_name: string;
  description: string;
  price: number;
  currency: string;
  duration_minutes: number;
};

type Props = {
  placeId: string;
};

export default function BusinessServices({ placeId }: Props) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    loadServices();
  }, [placeId]);

  async function loadServices() {
    const { data } = await supabase
      .from("business_services")
      .select("*")
      .eq("business_id", placeId)
      .eq("active", true)
      .order("display_order");

    setServices(data || []);
  }

  if (!services.length) return null;

  return (
    <div
      style={{
        marginTop: 30,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <h2>Services & Pricing</h2>

      {services.map(service => (
        <div
          key={service.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <div>
            <strong>{service.service_name}</strong>

            <div
              style={{
                color: "#666",
                marginTop: 5,
              }}
            >
              {service.description}
            </div>

            {service.duration_minutes && (
              <small>
                ⏱ {service.duration_minutes} min
              </small>
            )}
          </div>

          <div
            style={{
              fontWeight: 700,
              color: "#16a34a",
            }}
          >
            {service.price.toLocaleString()} {service.currency}
          </div>
        </div>
      ))}
    </div>
  );
}