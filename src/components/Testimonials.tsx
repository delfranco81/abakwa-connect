import "./Testimonials.css";

function Testimonials() {
  const reviews = [
    {
      name: "John N.",
      text: "Excellent service! My car looked brand new after the wash.",
    },
    {
      name: "Sarah M.",
      text: "Very friendly staff and affordable prices. Highly recommended!",
    },
    {
      name: "Michael T.",
      text: "The best cleaning experience I've had in Bamenda.",
    },
  ];

  return (
    <section className="testimonials" id="testimonials">
      <h2>What Our Customers Say</h2>

      <div className="testimonial-grid">
        {reviews.map((review, index) => (
          <div className="testimonial-card" key={index}>
            <p>"{review.text}"</p>
            <h4>- {review.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;