import { useEffect, useState } from "react";

import { BookingService } from "../services/BookingService";
import type { WashingService } from "../repositories/BookingRepository";

interface Props {
  businessId: string;
  value: string;
  onChange: (service: WashingService | null) => void;
}

export default function ServiceSelector({
  businessId,
  value,
  onChange,
}: Props) {
  const [services, setServices] = useState<WashingService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      if (!businessId) {
        setServices([]);
        onChange(null);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const service = new BookingService();

        const data =
          await service.getWashingServices(
            businessId
          );

        if (!cancelled) {
          setServices(data);
        }
      } catch (err) {
        console.error(
          "Unable to load services:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load services."
          );

          setServices([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const serviceId = event.target.value;

    const service =
      services.find(
        (item) => item.id === serviceId
      ) ?? null;

    onChange(service);
  }

  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        Choose Washing Service
      </label>

      {!businessId && (
        <p style={{ color: "#777" }}>
          Select a washing point first.
        </p>
      )}

      {loading && (
        <p>
          Loading available services...
        </p>
      )}

      {error && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "#3a1717",
            color: "#ff8d8d",
          }}
        >
          {error}
        </div>
      )}

      {businessId &&
        !loading &&
        !error && (
          <select
            value={value}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 8,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <option value="">
              Select a service
            </option>

            {services.map((service) => (
              <option
                key={service.id}
                value={service.id}
              >
                {service.serviceName}
                {" - "}
                {Number(
                  service.price
                ).toLocaleString()}{" "}
                {service.currency}
              </option>
            ))}
          </select>
        )}

      {value && (
        <div
          style={{
            marginTop: 15,
            padding: 15,
            borderRadius: 10,
            background: "#f5f7fa",
          }}
        >
          {(() => {
            const service =
              services.find(
                (item) =>
                  item.id === value
              );

            if (!service) {
              return null;
            }

            return (
              <>
                <strong>
                  {service.serviceName}
                </strong>

                {service.description && (
                  <p>
                    {service.description}
                  </p>
                )}

                <p>
                  Price:{" "}
                  {Number(
                    service.price
                  ).toLocaleString()}{" "}
                  {service.currency}
                </p>

                {service.durationMinutes !==
                  null && (
                  <p>
                    Duration:{" "}
                    {
                      service.durationMinutes
                    }{" "}
                    minutes
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}