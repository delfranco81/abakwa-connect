import { Link } from "react-router-dom";
import "./QuickActions.css";

const actions = [
  {
    icon: "🚖",
    title: "Taxi",
    category: "Taxi",
  },
  {
    icon: "🍽️",
    title: "Restaurants",
    category: "Restaurant",
  },
  {
    icon: "🏨",
    title: "Hotels",
    category: "Hotel",
  },
  {
    icon: "💊",
    title: "Pharmacy",
    category: "Pharmacy",
  },
  {
    icon: "🔧",
    title: "Mechanic",
    category: "Mechanic",
  },
  {
    icon: "🧹",
    title: "Cleaning",
    category: "Cleaning",
  },
  {
    icon: "🛒",
    title: "Shopping",
    category: "Supermarket",
  },
  {
    icon: "🚨",
    title: "Emergency",
    category: "Hospital",
  },
];

function QuickActions() {
  return (
    <section className="quick-actions">

      <h2>Quick Access</h2>

      <div className="quick-grid">

        {actions.map((action) => (
          <Link
            key={action.title}
            to={`/businesses?category=${encodeURIComponent(action.category)}`}
            className="quick-card"
          >
            <span>{action.icon}</span>

            <h3>{action.title}</h3>
          </Link>
        ))}

      </div>

    </section>
  );
}

export default QuickActions;