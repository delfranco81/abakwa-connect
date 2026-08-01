import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";

function AdminDashboard() {
  const cards = [
    { title: "Businesses", path: "/admin/businesses", icon: "🏢" },
    { title: "Places", path: "/admin/places", icon: "📍" },
    { title: "Schools", path: "/admin/schools", icon: "🎓" },
    { title: "Hotels", path: "/admin/hotels", icon: "🏨" },
    { title: "Restaurants", path: "/admin/restaurants", icon: "🍽" },
    { title: "Tourism", path: "/admin/tourism", icon: "🌄" },
    { title: "Fondoms", path: "/admin/fondoms", icon: "👑" },
    { title: "Traditional Meals", path: "/admin/meals", icon: "🍲" },
    { title: "Festivals", path: "/admin/festivals", icon: "🎭" },
    { title: "Gallery", path: "/admin/gallery", icon: "📸" },
    { title: "Featured Places", path: "/admin/featured", icon: "⭐" },
    { title: "Users", path: "/admin/users", icon: "👥" },
  ];

  return (
    <DashboardLayout>
      <h1>Abakwa Connect Admin</h1>

      <p>Manage the entire platform from one place.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginTop: 40,
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.path}
            style={{
              textDecoration: "none",
              color: "#222",
              background: "#fff",
              borderRadius: 12,
              padding: 25,
              boxShadow: "0 2px 10px rgba(0,0,0,.1)",
            }}
          >
            <h2>{card.icon}</h2>
            <h3>{card.title}</h3>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;