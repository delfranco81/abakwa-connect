import "./Pricing.css";

function Pricing() {
  const plans = [
    {
      name: "Basic Wash",
      price: "3,000 XAF",
      features: ["Exterior Wash", "Tire Cleaning"],
    },
    {
      name: "Standard Wash",
      price: "6,000 XAF",
      features: ["Exterior Wash", "Interior Cleaning", "Vacuum"],
      featured: true,
    },
    {
      name: "Premium Detail",
      price: "10,000 XAF",
      features: [
        "Exterior Wash",
        "Interior Detail",
        "Engine Cleaning",
        "Wax & Polish",
      ],
    },
  ];

  return (
    <section className="pricing" id="pricing">
      <h2>Pricing</h2>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`price-card ${plan.featured ? "featured" : ""}`}
          >
            <h3>{plan.name}</h3>

            <h1>{plan.price}</h1>

            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>✓ {feature}</li>
              ))}
            </ul>

            <button>Book Now</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Pricing;