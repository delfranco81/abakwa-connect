import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

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
  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialSearch =
    searchParams.get("search") || "";

  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [search, setSearch] =
    useState(initialSearch);

  const [category, setCategory] =
    useState("");

  const [area, setArea] =
    useState("");

  const [verifiedOnly, setVerifiedOnly] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadBusinesses();
  }, []);

  /*
   * Keep the input synchronized with
   * ?search= in the URL.
   */
  useEffect(() => {
    const urlSearch =
      searchParams.get("search") || "";

    setSearch(urlSearch);
  }, [searchParams]);

  async function loadBusinesses() {
    setLoading(true);
    setError("");

    const {
      data,
      error: databaseError,
    } = await supabase
      .from("business")
      .select("*")
      .order("name", {
        ascending: true,
      });

    if (databaseError) {
      console.error(
        "Failed to load businesses:",
        databaseError
      );

      setError(
        "We could not load businesses right now."
      );

      setBusinesses([]);
      setLoading(false);
      return;
    }

    setBusinesses(
      (data || []) as Business[]
    );

    setLoading(false);
  }

  function handleSearchChange(
    value: string
  ) {
    setSearch(value);

    const params =
      new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set(
        "search",
        value.trim()
      );
    } else {
      params.delete("search");
    }

    setSearchParams(params);
  }

  const categories = useMemo(() => {
    return [
      ...new Set(
        businesses
          .map(
            (business) =>
              business.category
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [businesses]);

  const areas = useMemo(() => {
    return [
      ...new Set(
        businesses
          .map(
            (business) =>
              business.area
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [businesses]);

  const filteredBusinesses =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return businesses.filter(
        (business) => {
          const searchableText =
            [
              business.name,
              business.category,
              business.area,
              business.landmark,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const searchMatch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          const categoryMatch =
            !category ||
            business.category ===
              category;

          const areaMatch =
            !area ||
            business.area === area;

          const verifiedMatch =
            !verifiedOnly ||
            business.verified === true;

          return (
            searchMatch &&
            categoryMatch &&
            areaMatch &&
            verifiedMatch
          );
        }
      );
    }, [
      businesses,
      search,
      category,
      area,
      verifiedOnly,
    ]);

  return (
    <>

      <main
        className="business-directory"
      >

        {/* HEADER */}
        <section
          style={{
            marginBottom: "30px",
          }}
        >
          <h1>
            Business Directory
          </h1>

          <p>
            Discover businesses,
            services and everyday
            providers across Bamenda.
          </p>
        </section>

        {/* SEARCH */}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <input
            className="search-box"
            type="search"
            placeholder="Search businesses, services, areas or landmarks..."
            value={search}
            onChange={(event) =>
              handleSearchChange(
                event.target.value
              )
            }
            aria-label="Search business directory"
          />
        </div>

        {/* FILTERS */}
        <div className="filters">

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          <select
            value={area}
            onChange={(event) =>
              setArea(
                event.target.value
              )
            }
          >
            <option value="">
              All Areas
            </option>

            {areas.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          <label
            className="verified-filter"
          >
            <input
              type="checkbox"
              checked={
                verifiedOnly
              }
              onChange={(event) =>
                setVerifiedOnly(
                  event.target.checked
                )
              }
            />

            Verified Only
          </label>

        </div>

        {/* RESULT COUNT */}
        <div
          style={{
            margin:
              "20px 0",
            color: "#64748b",
          }}
        >
          {loading
            ? "Loading businesses..."
            : `Showing ${filteredBusinesses.length} of ${businesses.length} businesses`}
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* RESULTS */}
        {!loading &&
        filteredBusinesses.length ===
          0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              background: "#f8fafc",
              borderRadius: "14px",
            }}
          >
            <h2>
              No businesses found
            </h2>

            <p
              style={{
                color: "#64748b",
              }}
            >
              Try another search,
              category or area.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setArea("");
                setVerifiedOnly(
                  false
                );

                setSearchParams({});
              }}
              style={{
                border: "none",
                background:
                  "#003366",
                color: "white",
                padding:
                  "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="business-grid">

            {filteredBusinesses.map(
              (business) => (
                <Link
                  key={business.id}
                  to={`/business/${business.id}`}
                  className="business-card"
                >
                  <img
                    src={
                      business.logo ||
                      "/branding/everyday-connect-logo.png"
                    }
                    alt={
                      business.name
                    }
                  />

                  <h3>
                    {business.name}
                  </h3>

                  <p>
                    {business.category}
                  </p>

                  <p>
                    {business.area}
                  </p>

                  {business.verified && (
                    <p
                      style={{
                        color:
                          "#15803d",
                        fontWeight:
                          700,
                      }}
                    >
                      Verified Business
                    </p>
                  )}

                  {business.rating !==
                    undefined && (
                    <p>
                      Rating:{" "}
                      {business.rating ||
                        0}
                    </p>
                  )}
                </Link>
              )
            )}

          </div>
        )}

      </main>
    </>
  );
}

export default Businesses;