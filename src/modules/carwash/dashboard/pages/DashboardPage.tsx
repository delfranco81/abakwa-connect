import DashboardHeader from "../components/DashboardHeader";
import WalletCard from "../components/WalletCard";
import LoyaltyCard from "../components/LoyaltyCard";
import UpcomingBookings from "../components/UpcomingBookings";
import BookingHistory from "../components/BookingHistory";
import QuickActions from "../components/QuickActions";
import AIRecommendations from "../components/AIRecommendations";

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 72px)",
        background: "#f5f7f7",
        padding: "30px 20px 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <DashboardHeader />

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <div id="wallet-card">
            <WalletCard />
          </div>

          <LoyaltyCard />
        </section>

        <section
          style={{
            marginBottom: 22,
          }}
        >
          <UpcomingBookings />
        </section>

        <section
          id="booking-history"
          style={{
            marginBottom: 22,
          }}
        >
          <BookingHistory />
        </section>

        <section
          style={{
            marginBottom: 22,
          }}
        >
          <QuickActions />
        </section>

        <section>
          <AIRecommendations />
        </section>
      </div>
    </main>
  );
}
