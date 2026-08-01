import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Plan = {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  description: string;
};

export default function Subscription() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("monthly_price");

    setPlans(data || []);
    setLoading(false);
  }

  if (loading) return <h2>Loading plans...</h2>;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "40px auto",
      }}
    >
      <h1>Subscription Plans</h1>

      <p>
        Upgrade your business anytime to unlock more visibility and premium tools.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: 25,
          marginTop: 30,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 15,
              padding: 25,
              background: "#fff",
            }}
          >
            <h2>{plan.name}</h2>

            <p>{plan.description}</p>

            <h3>Monthly</h3>

            <h1>{plan.monthly_price.toLocaleString()} FCFA</h1>

            <h3>Yearly</h3>

            <h2>{plan.yearly_price.toLocaleString()} FCFA</h2>

            <button
              style={{
                marginTop: 20,
                width: "100%",
                padding: 15,
                background: "#2563eb",
                color: "white",
                border: 0,
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Upgrade Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}