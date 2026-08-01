import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import PageHeader from "../../components/Admin/PageHeader";
import SearchBar from "../../components/Admin/SearchBar";
import StatusBadge from "../../components/Admin/StatusBadge";
import StatCard from "../../components/Admin/StatCard";
import { supabase } from "../../lib/supabase";

type Event = {
  id: string;
  title: string;
  category: string;
  venue: string;
  city: string;
  event_date: string;
  featured: boolean;
  published: boolean;
  image: string;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (data) setEvents(data);

    setLoading(false);
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Delete this event?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (!error) loadEvents();
  }

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Events"
        buttonText="+ Add Event"
        buttonLink="/admin/events/new"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard
          title="Events"
          value={events.length}
          color="#2563eb"
        />

        <StatCard
          title="Featured"
          value={events.filter(e => e.featured).length}
          color="#16a34a"
        />

        <StatCard
          title="Published"
          value={events.filter(e => e.published).length}
          color="#9333ea"
        />
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((event) => (
              <tr key={event.id}>
                <td style={{ padding: 10 }}>
                  <img
                    src={
                      event.image ||
                      "https://placehold.co/80x60"
                    }
                    style={{
                      width: 70,
                      height: 55,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </td>

                <td>{event.title}</td>

                <td>{event.event_date}</td>

                <td>{event.venue}</td>

                <td>
                  <StatusBadge
                    active={event.featured}
                  />
                </td>

                <td>
                  <Link
                    to={`/admin/events/${event.id}`}
                  >
                    Edit
                  </Link>

                  {" | "}

                  <button
                    onClick={() =>
                      deleteEvent(event.id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}