import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Overview() {
  const [businesses, setBusinesses] = useState(0);
  const [services, setServices] = useState(0);
  const [photos, setPhotos] = useState(0);
  const [reviews, setReviews] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const business = await supabase
      .from("places")
      .select("*", { count: "exact", head: true });

    const service = await supabase
      .from("business_services")
      .select("*", { count: "exact", head: true });

    const gallery = await supabase
      .from("business_photos")
      .select("*", { count: "exact", head: true });

    const review = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    setBusinesses(business.count ?? 0);
    setServices(service.count ?? 0);
    setPhotos(gallery.count ?? 0);
    setReviews(review.count ?? 0);
  }

  const card = {
    background: "white",
    borderRadius: 12,
    padding: 25,
    border: "1px solid #e5e7eb",
    textAlign: "center" as const,
  };

  return (
    <>
      <h1>Dashboard Overview</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >
        <div style={card}>
          <h3>Businesses</h3>
          <h1>{businesses}</h1>
        </div>

        <div style={card}>
          <h3>Services</h3>
          <h1>{services}</h1>
        </div>

        <div style={card}>
          <h3>Gallery Photos</h3>
          <h1>{photos}</h1>
        </div>

        <div style={card}>
          <h3>Reviews</h3>
          <h1>{reviews}</h1>
        </div>
      </div>
    </>
  );
}