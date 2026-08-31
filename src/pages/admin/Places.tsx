import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import PageHeader from "../../components/Admin/PageHeader";
import SearchBar from "../../components/Admin/SearchBar";
import StatCard from "../../components/Admin/StatCard";
import StatusBadge from "../../components/Admin/StatusBadge";
import { supabase } from "../../lib/supabase";

type Place = {
  id: string;
  name: string;
  category: string;
  type: string;
  city: string;
  featured: boolean;
  rating: number;
  image: string;
};

function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    setLoading(true);

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("name");

    if (!error && data) {
      setPlaces(data);
    }

    setLoading(false);
  }

  async function deletePlace(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this place?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("places")
      .delete()
      .eq("id", id);

    if (!error) {
      loadPlaces();
    } else {
      alert(error.message);
    }
  }

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPlaces = places.length;

  const featuredPlaces = places.filter(
    (p) => p.featured
  ).length;

  const categories = new Set(
    places.map((p) => p.category)
  ).size;

  const averageRating =
    places.length === 0
      ? "0"
      : (
          places.reduce(
            (sum, p) => sum + (p.rating || 0),
            0
          ) / places.length
        ).toFixed(1);

  return (
    <DashboardLayout>
      <PageHeader
        title="Places"
        buttonText="+ Add Place"
        buttonLink="/admin/places/new"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <StatCard
          title="Places"
          value={totalPlaces}
          color="#2563eb"
        />

        <StatCard
          title="Featured"
          value={featuredPlaces}
          color="#16a34a"
        />

        <StatCard
          title="Categories"
          value={categories}
          color="#9333ea"
        />

        <StatCard
          title="Average Rating"
          value={averageRating}
          color="#f59e0b"
        />
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <p style={{ margin: "20px 0" }}>
        Showing {filteredPlaces.length} of {places.length} places
      </p>

      {loading ? (
        <p>Loading places...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f5f5f5",
                textAlign: "left",
              }}
            >
              <th style={{ padding: 14 }}>Image</th>
              <th style={{ padding: 14 }}>Name</th>
              <th style={{ padding: 14 }}>Category</th>
              <th style={{ padding: 14 }}>Type</th>
              <th style={{ padding: 14 }}>City</th>
              <th style={{ padding: 14 }}>Featured</th>
              <th style={{ padding: 14 }}>Rating</th>
              <th style={{ padding: 14 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlaces.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: 30,
                  }}
                >
                  No places found.
                </td>
              </tr>
            ) : (
              filteredPlaces.map((place) => (
                <tr
                  key={place.id}
                  style={{
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <td style={{ padding: 14 }}>
                    <img
                      src={
                        place.image ||
                        "https://placehold.co/120x80?text=No+Image"
                      }
                      alt={place.name}
                      style={{
                        width: 70,
                        height: 55,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </td>

                  <td
                    style={{
                      padding: 14,
                      fontWeight: 600,
                    }}
                  >
                    {place.name}
                  </td>

                  <td style={{ padding: 14 }}>
                    {place.category}
                  </td>

                  <td style={{ padding: 14 }}>
                    {place.type}
                  </td>

                  <td style={{ padding: 14 }}>
                    {place.city}
                  </td>

                  <td style={{ padding: 14 }}>
                    <StatusBadge active={place.featured} />
                  </td>

                  <td style={{ padding: 14 }}>
                    â­ {place.rating}
                  </td>

                  <td style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <a
                        href={`/business/${place.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ðŸ‘ View
                      </a>

                      <Link
                        to={`/admin/places/${place.id}`}
                      >
                        âœï¸ Edit
                      </Link>

                      <button
                        onClick={() =>
                          deletePlace(place.id)
                        }
                        style={{
                          border: "none",
                          background: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        ðŸ—‘ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

export default Places;