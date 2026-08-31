import { Link, useLocation } from "react-router-dom";

const menu = [
  {
    section: "Business",
    items: [
      { title: "🏠 Overview", path: "/owner" },
      { title: "🏢 Business Profile", path: "/owner/business" },
      { title: "🛠 Services", path: "/owner/services" },
      { title: "🖼 Gallery", path: "/owner/gallery" },
      { title: "🕒 Business Hours", path: "/owner/hours" },
      { title: "⭐ Reviews", path: "/owner/reviews" },
    ],
  },

  {
    section: "Employees",
    items: [
      { title: "👥 Employees", path: "/owner/employees" },
      { title: "🏢 Departments", path: "/owner/departments" },
      { title: "📋 Recruitment", path: "/owner/recruitment" },
      { title: "📅 Attendance", path: "/owner/attendance" },
      { title: "💰 Payroll", path: "/owner/payroll" },
      { title: "🎓 Training", path: "/owner/training" },
      { title: "📈 Performance", path: "/owner/performance" },
    ],
  },

  {
    section: "Customers",
    items: [
      { title: "📅 Bookings", path: "/owner/bookings" },
      { title: "💬 Messages", path: "/owner/messages" },
      { title: "❤️ Loyalty", path: "/owner/loyalty" },
    ],
  },

  {
    section: "Finance",
    items: [
      { title: "💳 Payments", path: "/owner/payments" },
      { title: "📊 Analytics", path: "/owner/analytics" },
      { title: "📑 Reports", path: "/owner/reports" },
      { title: "💼 Subscription", path: "/owner/subscription" },
    ],
  },

  {
    section: "AI Tools",
    items: [
      { title: "🤖 AI Assistant", path: "/owner/ai" },
      { title: "📣 AI Marketing", path: "/owner/marketing-ai" },
      { title: "📰 AI News", path: "/owner/news-ai" },
      { title: "📄 Documents AI", path: "/owner/documents-ai" },
    ],
  },

  {
    section: "Settings",
    items: [
      { title: "⚙ Settings", path: "/owner/settings" },
    ],
  },
];

export default function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: 280,
        background: "#111827",
        color: "#fff",
        minHeight: "100vh",
        overflowY: "auto",
        padding: 20,
      }}
    >
      <h2
        style={{
          marginBottom: 30,
          textAlign: "center",
          color: "#3b82f6",
        }}
      >
        Everyday Connect
      </h2>

      {menu.map((section) => (
        <div key={section.section} style={{ marginBottom: 25 }}>
          <h4
            style={{
              color: "#9CA3AF",
              marginBottom: 10,
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            {section.section}
          </h4>

          {section.items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "block",
                padding: "10px 15px",
                marginBottom: 6,
                borderRadius: 8,
                color:
                  location.pathname === item.path
                    ? "#fff"
                    : "#D1D5DB",
                background:
                  location.pathname === item.path
                    ? "#2563EB"
                    : "transparent",
                textDecoration: "none",
                transition: "0.2s",
              }}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}