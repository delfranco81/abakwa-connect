import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import ImageUploader from "../../components/Admin/ImageUploader";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";


type Category = {
  id: string;
  name: string;
};

function AddPlace() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
  name: "",
  category: "",
  description: "",
  history: "",
  image: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  opening_hours: "",
  city: "Bamenda",
  subdivision: "",
  latitude: "",
  longitude: "",
  featured: false,
  verified: false,
});

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
 const { data, error } = await supabase
  .schema("public")
  .from("categories")
  .select("*");

console.log(data, error);
  if (data) {
    setCategories(data);
  }
}


async function savePlace(e: React.FormEvent) {
  e.preventDefault();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION:", session);

  const placeData = {
    ...form,
    latitude: form.latitude === "" ? null : Number(form.latitude),
    longitude: form.longitude === "" ? null : Number(form.longitude),
  };

  const { data, error } = await supabase
    .from("places")
    .insert(placeData)
    .select();

  console.log("INSERT DATA:", data);
  console.log("INSERT ERROR:", error);

  if (error) {
    toast.error(error.message);
    console.log(error);
    return;
  }

  toast.success("Place added successfully");

  setForm({
    name: "",
    category: "",
    description: "",
    history: "",
    image: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    opening_hours: "",
    city: "Bamenda",
    subdivision: "",
    latitude: "",
    longitude: "",
    featured: false,
    verified: false,
  });
}
  return (
    <DashboardLayout>

      <h1>Add New Place</h1>
      <p>Categories loaded: {categories.length}</p>

      <form onSubmit={savePlace}>

       <ImageUploader
  bucket="places"
  folder="images"
  value={form.image}
  onUpload={(url) =>
    setForm({
      ...form,
      image: url,
    })
  }
/>

        <input
          placeholder="Place Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <br /><br />

       <select
  value={form.category}
  onChange={(e) =>
    setForm({
      ...form,
      category: e.target.value,
    })
  }
>
  <option value="">Select Category</option>

  {categories.map((cat) => (
    <option key={cat.id} value={cat.name}>
      {cat.name}
    </option>
  ))}
</select>

        <br /><br />

        <textarea
          placeholder="Description"
          rows={5}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <br /><br />

        <textarea
          placeholder="History"
          rows={5}
          value={form.history}
          onChange={(e) =>
            setForm({
              ...form,
              history: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Website"
          value={form.website}
          onChange={(e) =>
            setForm({
              ...form,
              website: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Opening Hours"
          value={form.opening_hours}
          onChange={(e) =>
            setForm({
              ...form,
              opening_hours: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Latitude"
          value={form.latitude}
          onChange={(e) =>
            setForm({
              ...form,
              latitude: e.target.value,
            })
          }
        />

        <br /><br />

        <input
          placeholder="Longitude"
          value={form.longitude}
          onChange={(e) =>
            setForm({
              ...form,
              longitude: e.target.value,
            })
          }
        />

        <br /><br />

        <label>

          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm({
                ...form,
                featured: e.target.checked,
              })
            }
          />

          Featured

        </label>

        <br />

        <label>

          <input
            type="checkbox"
            checked={form.verified}
            onChange={(e) =>
              setForm({
                ...form,
                verified: e.target.checked,
              })
            }
          />

          Verified

        </label>

        <br /><br />

        <button type="submit">

          Save Place

        </button>

      </form>

    </DashboardLayout>
  );
}

export default AddPlace;