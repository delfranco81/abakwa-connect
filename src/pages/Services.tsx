import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Service = {
  id: string;
  business_id: string;
  service_name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_featured: boolean;
  display_order: number;
};

export default function Services() {
  const [businessId, setBusinessId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [newService, setNewService] = useState({
    service_name: "",
    description: "",
    price: 0,
    duration_minutes: 30,
  });

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    const { data: place } = await supabase
      .from("places")
      .select("id")
      .limit(1)
      .single();

    if (!place) {
      setLoading(false);
      return;
    }

    setBusinessId(place.id);
    loadServices(place.id);
  }

  async function loadServices(id: string) {
    const { data } = await supabase
      .from("business_services")
      .select("*")
      .eq("business_id", id)
      .order("display_order");

    setServices(data ?? []);
    setLoading(false);
  }

  async function addService() {
    if (!businessId) return;

    const { error } = await supabase
      .from("business_services")
      .insert({
        business_id: businessId,
        service_name: newService.service_name,
        description: newService.description,
        price: newService.price,
        duration_minutes: newService.duration_minutes,
        display_order: services.length + 1,
        is_featured: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNewService({
      service_name: "",
      description: "",
      price: 0,
      duration_minutes: 30,
    });

    loadServices(businessId);
  }

  async function updateService(service: Service) {
    const { error } = await supabase
      .from("business_services")
      .update({
        service_name: service.service_name,
        description: service.description,
        price: service.price,
        duration_minutes: service.duration_minutes,
        is_featured: service.is_featured,
      })
      .eq("id", service.id);

    if (error) {
      alert(error.message);
    }
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) return;

    await supabase
      .from("business_services")
      .delete()
      .eq("id", id);

    loadServices(businessId);
  }

  if (loading) return <h2>Loading services...</h2>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1>Business Services</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 20,
          marginBottom: 30,
        }}
      >
        <h2>Add Service</h2>

        <input
          placeholder="Service Name"
          value={newService.service_name}
          onChange={(e) =>
            setNewService({
              ...newService,
              service_name: e.target.value,
            })
          }
        />

        <br />
        <br />

        <textarea
          rows={4}
          placeholder="Description"
          value={newService.description}
          onChange={(e) =>
            setNewService({
              ...newService,
              description: e.target.value,
            })
          }
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Price"
          value={newService.price}
          onChange={(e) =>
            setNewService({
              ...newService,
              price: Number(e.target.value),
            })
          }
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={newService.duration_minutes}
          onChange={(e) =>
            setNewService({
              ...newService,
              duration_minutes: Number(e.target.value),
            })
          }
        />

        <br />
        <br />

        <button onClick={addService}>
          Add Service
        </button>
      </div>

      {services.map((service) => (
        <div
          key={service.id}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <input
            value={service.service_name}
            onChange={(e) => {
              service.service_name = e.target.value;
              setServices([...services]);
            }}
          />

          <br />
          <br />

          <textarea
            rows={3}
            value={service.description}
            onChange={(e) => {
              service.description = e.target.value;
              setServices([...services]);
            }}
          />

          <br />
          <br />

          <input
            type="number"
            value={service.price}
            onChange={(e) => {
              service.price = Number(e.target.value);
              setServices([...services]);
            }}
          />

          <br />
          <br />

          <input
            type="number"
            value={service.duration_minutes}
            onChange={(e) => {
              service.duration_minutes = Number(e.target.value);
              setServices([...services]);
            }}
          />

          <br />
          <br />

          <label>
            <input
              type="checkbox"
              checked={service.is_featured}
              onChange={(e) => {
                service.is_featured = e.target.checked;
                setServices([...services]);
              }}
            />
            Featured Service
          </label>

          <br />
          <br />

          <button
            onClick={() => updateService(service)}
            style={{ marginRight: 10 }}
          >
            Save
          </button>

          <button
            onClick={() => deleteService(service.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}