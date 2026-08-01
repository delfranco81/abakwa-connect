import { Link } from "react-router-dom";

const items = [
  ["Overview", "/owner"],
  ["Edit Business", "/owner/business"],
  ["Services", "/owner/services"],
  ["Gallery", "/owner/gallery"],
  ["Business Hours", "/owner/hours"],
  ["Reviews", "/owner/reviews"],
  ["Analytics", "/owner/analytics"],
  ["Subscription", "/owner/subscription"],
  ["Settings", "/owner/settings"],
];

export default function DashboardSidebar() {
  return (
    <div
      style={{
        width: 260,
        background: "#111827",
        color: "white",
        padding: 25,
      }}
    >
      <h2>Abakwa Connect</h2>

      {items.map(([title, url]) => (
        <Link
          key={url}
          to={url}
          style={{
            display: "block",
            color: "white",
            marginTop: 20,
            textDecoration: "none",
          }}
        >
          {title}
        </Link>
      ))}
    </div>
  );
}