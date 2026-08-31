import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { supabase } from "../lib/supabase";
import "./RegisterBusiness.css";

type Category = {
  id: number;
  name: string;
};

function RegisterBusiness() {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
const [coverFile, setCoverFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: "",
    owner: "",
    category: "",
    customCategory: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    description: "",
    area: "",
    landmark: "",
  });

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error(error);
      } else if (data) {
        setCategories(data);
      }
    }

    loadCategories();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }
  async function uploadImage(file: File, folder: string) {
  const fileName = `${folder}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("business-images")
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("business-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    const finalCategory =
      form.category === "Other"
        ? form.customCategory
        : form.category;

    if (
      form.category === "Other" &&
      form.customCategory.trim() !== ""
    ) {
      await supabase
        .from("pending_categories")
        .insert([
          {
            name: form.customCategory,
          },
        ]);
    }
    let logoUrl = "";
let coverUrl = "";

if (logoFile) {
  logoUrl = await uploadImage(
    logoFile,
    "logos"
  );
}

if (coverFile) {
  coverUrl = await uploadImage(
    coverFile,
    "covers"
  );
}

    const { error } = await supabase
  .from("business")
  .insert([
    {
      name: form.name,
      owner: form.owner,
      category: finalCategory,
      phone: form.phone,
      email: form.email,
      description: form.description,
      area: form.area,
      landmark: form.landmark,
      logo: logoUrl,
      cover_image: coverUrl,
      website: form.website,
      whatsapp: form.whatsapp,
    },
  ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      console.error(error);
      return;
    }

    alert("Business registered successfully!");

    setForm({
      name: "",
      owner: "",
      category: "",
      customCategory: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      description: "",
      area: "",
      landmark: "",
    });
  }

  return (
    <>
      <Navbar />

      <section className="register-business">
        <h1>Register Your Business</h1>

        <p>
          Join Abakwa Connect and reach thousands of customers across Bamenda.
        </p>
        

        <form onSubmit={handleSubmit}>

          <label>Business Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Owner's Name</label>
          <input
            type="text"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            required
          />

          <label>Business Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.name}
              >
                {category.name}
              </option>
            ))}

            <option value="Other">Other</option>
          </select>

          {form.category === "Other" && (
            <>
              <label>Specify Business Type</label>

              <input
                type="text"
                name="customCategory"
                value={form.customCategory}
                onChange={handleChange}
                required
              />
            </>
          )}
          <label>Business Logo</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setLogoFile(
      e.target.files ? e.target.files[0] : null
    )
  }
/>

<label>Cover Image</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setCoverFile(
      e.target.files ? e.target.files[0] : null
    )
  }
/>

          <label>Description</label>

          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
          />

          <label>Phone Number</label>

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <label>WhatsApp Number</label>

          <input
            type="tel"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
          />

          <label>Email</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <label>Website</label>

          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
          />

          <label>Area</label>

          <input
            type="text"
            name="area"
            value={form.area}
            onChange={handleChange}
          />

          <label>Nearest Landmark</label>

          <input
            type="text"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register Business"}
          </button>

        </form>
      </section>
    </>
  );
}

export default RegisterBusiness;