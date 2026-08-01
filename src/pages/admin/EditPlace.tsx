import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/Admin/DashboardLayout";
import ImageUploader from "../../components/Admin/ImageUploader";
import { supabase } from "../../lib/supabase";

function EditPlace() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] =useState("");

  const [description, setDescription] = useState("");
  const [history, setHistory] = useState("");

  const [image, setImage] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  const [featured, setFeatured] = useState(false);
  const [verified, setVerified] = useState(false);

  const [rating, setRating] = useState(0);

  useEffect(() => {
    loadPlace();
  }, []);

  async function loadPlace() {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setName(data.name ?? "");
    setCategory(data.category ?? "");
    setType(data.type ?? "");
    setCity(data.city ?? "");

    setDescription(data.description ?? "");
    setHistory(data.history ?? "");

    setImage(data.image ?? "");

    setPhone(data.phone ?? "");
    setEmail(data.email ?? "");
    setWebsite(data.website ?? "");

    setAddress(data.address ?? "");
    setOpeningHours(data.opening_hours ?? "");

    setFeatured(data.featured ?? false);
    setVerified(data.verified ?? false);

    setRating(data.rating ?? 0);

    setLoading(false);
  }

  async function updatePlace() {
    const { error } = await supabase
      .from("places")
      .update({
        name,
        category,
        type,
        city,
        description,
        history,
        image,
        phone,
        email,
        website,
        address,
        opening_hours: openingHours,
        featured,
        verified,
        rating,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Place updated successfully!");
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <DashboardLayout>
      <h1>Edit Place</h1>

      <div
        style={{
          display: "grid",
          gap: 16,
          maxWidth: 700,
        }}
      >
        <ImageUploader
          bucket="places"
          folder="images"
          value={image}
          onUpload={setImage}
        />

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <textarea
          rows={5}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          rows={5}
          placeholder="History"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          placeholder="Opening Hours"
          value={openingHours}
          onChange={(e) => setOpeningHours(e.target.value)}
        />

        <input
          type="number"
          placeholder="Rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />

        <label>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />
          Verified
        </label>

        <button onClick={updatePlace}>
          Save Changes
        </button>
      </div>
    </DashboardLayout>
  );
}

export default EditPlace;