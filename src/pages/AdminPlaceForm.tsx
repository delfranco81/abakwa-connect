import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ImageUploader from "../components/Admin/ImageUploader";

function AdminPlaceForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    history: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    website: "",
    email: "",
    image: "",
    featured: false,
    hero_title: "",
    hero_subtitle: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    });
  }

  async function savePlace(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("places").insert({
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Place added successfully!");

    navigate("/admin/places");
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
      }}
    >
      <h1>Add New Place</h1>

      <form onSubmit={savePlace}>

        <input
          name="name"
          placeholder="Place name"
          onChange={handleChange}
          required
        />

        <br /><br />

        <select
          name="category"
          onChange={handleChange}
          required
        >
          <option value="">
            Select Category
          </option>

          <option>Landmark</option>
          <option>University</option>
          <option>School</option>
          <option>Hospital</option>
          <option>Hotel</option>
          <option>Restaurant</option>
          <option>Waterfall</option>
          <option>Lake</option>
          <option>Fondom</option>
          <option>Government</option>
          <option>Church</option>
          <option>Mosque</option>
          <option>Market</option>
          <option>Sports</option>
          <option>Tourism</option>
        </select>

        <br /><br />

        <textarea
          name="description"
          placeholder="Description"
          rows={4}
          onChange={handleChange}
        />

        <br /><br />

        <textarea
          name="history"
          placeholder="History"
          rows={4}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="latitude"
          placeholder="Latitude"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="longitude"
          placeholder="Longitude"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="website"
          placeholder="Website"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <br /><br />

        <ImageUploader
  bucket="places"
  folder="covers"
  value={form.image}
  onUpload={(url) =>
    setForm({
      ...form,
      image: url,
    })
  }
/>

        <br /><br />

        <input
          name="hero_title"
          placeholder="Hero Title"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="hero_subtitle"
          placeholder="Hero Subtitle"
          onChange={handleChange}
        />

        <br /><br />

        <label>
          <input
            type="checkbox"
            name="featured"
            onChange={handleChange}
          />

          Featured Place
        </label>

        <br /><br />

        <button type="submit">
          Save Place
        </button>

      </form>
    </div>
  );
}

export default AdminPlaceForm;