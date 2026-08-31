import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";

function AdminDashboard() {
  const cards = [
    { title: "Businesses", path: "/admin/businesses", icon: "\uD83C\uDFE2" },
    { title: "Places", path: "/admin/places", icon: "\uD83D\uDCCD" },
    { title: "Schools", path: "/admin/schools", icon: "\uD83C\uDF93" },
    { title: "Hotels", path: "/admin/hotels", icon: "\uD83C\uDFE8" },
    { title: "Restaurants", path: "/admin/restaurants", icon: "\uD83C\uDF7D\uFE0F" },
    { title: "Tourism", path: "/admin/tourism", icon: "\uD83C\uDF04" },
    { title: "Fondoms", path: "/admin/fondoms", icon: "\uD83D\uDC51" },
    { title: "Traditional Meals", path: "/admin/meals", icon: "\uD83C\uDF72" },
    { title: "Festivals", path: "/admin/festivals", icon: "\uD83C\uDF89" },
    { title: "Gallery", path: "/admin/gallery", icon: "\uD83D\uDCF8" },
    { title: "Featured Places", path: "/admin/featured", icon: "\u2B50" },
    { title: "Users", path: "/admin/users", icon: "\uD83D\uDC65" },
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
