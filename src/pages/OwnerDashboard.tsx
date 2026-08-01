import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Owner/DashboardSidebar";
import DashboardHeader from "../components/Owner/DashboardHeader";
export default function OwnerDashboard() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      <DashboardSidebar />

      <div
        style={{
          flex: 1,
        }}
      >
        <DashboardHeader />

        <div
          style={{
            padding: 30,
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}