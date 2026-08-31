import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import "./QuickActions.css";

const actions = [
  {
    icon: "🚖",
    titleEn: "Taxi",
    titleFr: "Taxi",
    category: "Taxi",
  },
  {
    icon: "🍽️",
    titleEn: "Restaurants",
    titleFr: "Restaurants",
    category: "Restaurant",
  },
  {
    icon: "🏨",
    titleEn: "Hotels",
    titleFr: "Hôtels",
    category: "Hotel",
  },
  {
    icon: "💊",
    titleEn: "Pharmacy",
    titleFr: "Pharmacie",
    category: "Pharmacy",
  },
  {
    icon: "🔧",
    titleEn: "Mechanic",
    titleFr: "Mécanicien",
    category: "Mechanic",
  },
  {
    icon: "🧹",
    titleEn: "Cleaning",
    titleFr: "Nettoyage",
    category: "Cleaning",
  },
  {
    icon: "🛒",
    titleEn: "Shopping",
    titleFr: "Courses",
    category: "Supermarket",
  },
  {
    icon: "🚨",
    titleEn: "Emergency",
    titleFr: "Urgences",
    category: "Hospital",
  },
];

function QuickActions() {
  const { language } = useLanguage();

  return (
    <section className="quick-actions">

      <h2>
        {language === "fr"
          ? "Accès rapide"
          : "Quick Access"}
      </h2>

      <div className="quick-grid">

        {actions.map((action) => (
          <Link
            key={action.titleEn}
            to={`/businesses?category=${encodeURIComponent(
              action.category
            )}`}
            className="quick-card"
          >
            <span>{action.icon}</span>

            <h3>
              {language === "fr"
                ? action.titleFr
                : action.titleEn}
            </h3>
          </Link>
        ))}

      </div>

    </section>
  );
}

export default QuickActions;
