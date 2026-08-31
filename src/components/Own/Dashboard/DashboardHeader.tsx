import "./DashboardHeader.css";

export default function DashboardHeader() {
  return (
    <header className="dashboard-header">

      <div>
        <h1>Welcome back 👋</h1>
        <p>Manage your business from one place.</p>
      </div>

      <div className="dashboard-header-right">

        <button className="notification-btn">
          🔔
          <span>4</span>
        </button>

        <button className="ai-btn">
          🤖 AI Assistant
        </button>

      </div>

    </header>
  );
}