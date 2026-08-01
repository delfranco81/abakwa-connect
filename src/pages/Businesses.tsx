import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { supabase } from "../lib/supabase";
import "./Businesses.css";
type Business = {
  id: string;
  name: string;
  category: string;
  area: string;
  landmark: string;
  logo: string;
  cover_image: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  total_reviews: number;
  phone: string;
  whatsapp: string;
};

function Businesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
const [area, setArea] = useState("");
const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    const { data, error } = await supabase
      .from("business")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setBusinesses(data || []);
  }

 const filtered = businesses.filter((business) => {
  const searchMatch =
    business.name.toLowerCase().includes(search.toLowerCase()) ||
    business.category.toLowerCase().includes(search.toLowerCase()) ||
    business.area.toLowerCase().includes(search.toLowerCase());

  const categoryMatch =
    category === "" || business.category === category;

  const areaMatch =
    area === "" || business.area === area;

  const verifiedMatch =
    !verifiedOnly || business.verified;

  return (
    searchMatch &&
    categoryMatch &&
    areaMatch &&
    verifiedMatch
  );
});

  return (
    <>
      <Navbar />

      <section className="business-directory">

        <h1>Business Directory</h1>

        <p>Discover businesses across Bamenda.</p>

        <input
          className="search-box"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filters">

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="">All Categories</option>

    {[...new Set(
      businesses.map((b) => b.category)
    )].map((cat) => (
      <option key={cat}>{cat}</option>
    ))}

  </select>

  <select
    value={area}
    onChange={(e) => setArea(e.target.value)}
  >
    <option value="">All Areas</option>

    {[...new Set(
      businesses.map((b) => b.area)
    )].map((location) => (
      <option key={location}>{location}</option>
    ))}

  </select>

  <label className="verified-filter">

    <input
      type="checkbox"
      checked={verifiedOnly}
      onChange={(e) =>
        setVerifiedOnly(e.target.checked)
      }
    />

    Verified Only

  </label>

</div>

        <div className="business-grid">

          {filtered.map((business) => (

            <Link
              key={business.id}
              to={`/business/${business.id}`}
              className="business-card"
            >

              <img
                src={
                  business.logo ||
                  "https://placehold.co/150x150?text=Logo"
                }
                alt={business.name}
              />

              <h3>{business.name}</h3>

              <p>{business.category}</p>

              <p>{business.area}</p>

              <p>⭐ {business.rating}</p>

              {business.verified && (
                <span className="verified">
                  ✔ Verified
                </span>
              )}

            </Link>

          ))}

        </div>

      </section>

    </>
  );
}

export default Businesses;