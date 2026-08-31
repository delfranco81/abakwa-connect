import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Place = {
  id: string;
  name: string;
  category: string;
  featured: boolean;
};

function AdminPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    const { data, error } = await supabase
      .from("places")
      .select("id,name,category,featured")
      .order("name");

    if (error) {
      console.error(error);
    } else {
      setPlaces(data || []);
    }

    setLoading(false);
  }

  async function deletePlace(id: string) {
    if (!confirm("Delete this place?")) return;

    const { error } = await supabase
      .from("places")
      .delete()
      .eq("id", id);

    if (!error) {
      loadPlaces();
    }
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Manage Places</h1>

      <Link to="/admin/places/new">
        <button>Add New Place</button>
      </Link>

      <br />
      <br />

      <table
        border={1}
        cellPadding={10}
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {places.map((place) => (
            <tr key={place.id}>
              <td>{place.name}</td>

              <td>{place.category}</td>

              <td>{place.featured ? "â­" : ""}</td>

              <td>
                <Link to={`/admin/places/edit/${place.id}`}>
                  Edit
                </Link>

                {" | "}

                <button
                  onClick={() => deletePlace(place.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPlaces;