import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";

type Business = {
  id: string;
  name: string | null;
  category: string | null;
  area: string | null;
  city: string | null;
  verified: boolean | null;
  logo: string | null;
  cover_image: string | null;
};

type CleaningService = {
  id: string;
  business_id: string;
  service_name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  duration_minutes: number | null;
  is_featured: boolean;
  display_order: number;
  active: boolean;
  business: Business | null;
};

function CleaningServices() {
  const [services, setServices] = useState<
    CleaningService[]
  >([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [verifiedOnly, setVerifiedOnly] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError("");

    const {
      data,
      error: databaseError,
    } = await supabase
      .from("business_services")
      .select(`
        id,
        business_id,
        service_name,
        description,
        price,
        currency,
        duration_minutes,
        is_featured,
        display_order,
        active,
        business:places (
          id,
          name,
          category,
          area,
          city,
          verified,
          logo,
          cover_image
        )
      `)
      .eq("active", true)
      .order("display_order", {
        ascending: true,
      });

    if (databaseError) {
      console.error(
        "Failed to load marketplace services:",
        databaseError
      );

      setError(
        "We could not load cleaning services right now."
      );

      setServices([]);
      setLoading(false);
      return;
    }

    const normalizedServices: CleaningService[] =
      (data ?? []).map((item) => {
        const rawBusiness =
          Array.isArray(item.business)
            ? item.business[0] ?? null
            : item.business ?? null;

        const business: Business | null =
          rawBusiness
            ? {
                id: String(rawBusiness.id),
                name:
                  rawBusiness.name ?? null,
                category:
                  rawBusiness.category ??
                  null,
                area:
                  rawBusiness.area ?? null,
                city:
                  rawBusiness.city ?? null,
                verified:
                  rawBusiness.verified ??
                  null,
                logo:
                  rawBusiness.logo ?? null,
                cover_image:
                  rawBusiness.cover_image ??
                  null,
              }
            : null;

        return {
          id: String(item.id),

          business_id: String(
            item.business_id
          ),

          service_name: String(
            item.service_name
          ),

          description:
            item.description ?? null,

          price:
            item.price !== null
              ? Number(item.price)
              : null,

          currency:
            item.currency ?? "FCFA",

          duration_minutes:
            item.duration_minutes !== null
              ? Number(
                  item.duration_minutes
                )
              : null,

          is_featured:
            item.is_featured === true,

          display_order:
            Number(
              item.display_order ?? 0
            ),

          active:
            item.active !== false,

          business,
        };
      });

    setServices(normalizedServices);
    setLoading(false);
  }

  const categories = useMemo(() => {
    return [
      ...new Set(
        services
          .map(
            (service) =>
              service.business?.category
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      ),
    ].sort();
  }, [services]);

  const areas = useMemo(() => {
    return [
      ...new Set(
        services
          .map(
            (service) =>
              service.business?.area
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      ),
    ].sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return services.filter((service) => {
      const business =
        service.business;

      const searchableText = [
        service.service_name,
        service.description,
        business?.name,
        business?.category,
        business?.area,
        business?.city,
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
        business?.category === category;

      const areaMatch =
        !area ||
        business?.area === area;

      const verifiedMatch =
        !verifiedOnly ||
        business?.verified === true;

      return (
        searchMatch &&
        categoryMatch &&
        areaMatch &&
        verifiedMatch
      );
    });
  }, [
    services,
    search,
    category,
    area,
    verifiedOnly,
  ]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setArea("");
    setVerifiedOnly(false);
  }

  return (
    <>

      <main
        style={{
          minHeight:
            "calc(100vh - 72px)",
          background: "#f5f7f7",
          padding:
            "40px 24px 70px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* HERO */}

          <section
            style={{
              background:
                "linear-gradient(135deg, #003b36, #00695c)",
              color: "white",
              borderRadius: "20px",
              padding:
                "40px 32px",
              marginBottom: "28px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.12)",
            }}
          >
            <p
              style={{
                margin:
                  "0 0 8px",
                color: "#9de8df",
                fontSize: "13px",
                fontWeight: 700,
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px",
              }}
            >
              ECOS Marketplace
            </p>

            <h1
              style={{
                margin:
                  "0 0 14px",
                fontSize:
                  "clamp(32px, 5vw, 52px)",
                lineHeight: 1.1,
              }}
            >
              Cleaning Services
            </h1>

            <p
              style={{
                maxWidth: "720px",
                margin:
                  "0 0 24px",
                lineHeight: 1.7,
                color:
                  "rgba(255,255,255,0.88)",
              }}
            >
              Discover car washes,
              detailing, laundry,
              home cleaning and
              commercial cleaning
              services from local
              providers on Everyday
              Connect.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register-business"
                style={{
                  background:
                    "white",
                  color: "#003b36",
                  textDecoration:
                    "none",
                  padding:
                    "12px 18px",
                  borderRadius: "9px",
                  fontWeight: 700,
                }}
              >
                Become a Provider
              </Link>

              <Link
                to="/business-dashboard"
                style={{
                  background:
                    "rgba(255,255,255,0.12)",
                  color: "white",
                  textDecoration:
                    "none",
                  padding:
                    "12px 18px",
                  borderRadius: "9px",
                  fontWeight: 700,
                  border:
                    "1px solid rgba(255,255,255,0.25)",
                }}
              >
                Provider Dashboard
              </Link>
            </div>
          </section>

          {/* SEARCH + FILTERS */}

          <section
            style={{
              background: "white",
              padding: "22px",
              borderRadius: "16px",
              marginBottom: "28px",
              border:
                "1px solid #e5e7eb",
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search services, providers, categories or locations..."
              aria-label="Search cleaning services"
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "14px 16px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #d0d5dd",
                outline: "none",
                fontSize: "15px",
                marginBottom:
                  "15px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                style={selectStyle}
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
                style={selectStyle}
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
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#344054",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    verifiedOnly
                  }
                  onChange={(event) =>
                    setVerifiedOnly(
                      event.target
                        .checked
                    )
                  }
                />

                Verified providers
              </label>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                style={{
                  border: "none",
                  background:
                    "#eef2f2",
                  color: "#344054",
                  padding:
                    "10px 15px",
                  borderRadius:
                    "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            </div>
          </section>

          {/* RESULT COUNT */}

          <div
            style={{
              marginBottom:
                "18px",
              color: "#667085",
              fontSize: "14px",
            }}
          >
            {loading
              ? "Loading cleaning services..."
              : `Showing ${filteredServices.length} of ${services.length} services`}
          </div>

          {/* ERROR */}

          {error && (
            <section
              style={{
                background:
                  "#fee2e2",
                color: "#991b1b",
                borderRadius:
                  "12px",
                padding: "16px",
                marginBottom:
                  "20px",
              }}
            >
              {error}
            </section>
          )}

          {/* LOADING */}

          {loading ? (
            <section
              style={{
                background:
                  "white",
                borderRadius:
                  "16px",
                padding:
                  "60px 20px",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  margin:
                    "0 auto 15px",
                  border:
                    "4px solid #d9e7e5",
                  borderTop:
                    "4px solid #003b36",
                  borderRadius:
                    "50%",
                  animation:
                    "ecosSpin 0.8s linear infinite",
                }}
              />

              <h2>
                Loading services
              </h2>

              <p
                style={{
                  color:
                    "#667085",
                }}
              >
                Finding cleaning
                services from
                ECOS providers.
              </p>
            </section>
          ) : filteredServices.length ===
            0 ? (
            /* EMPTY */

            <section
              style={{
                background:
                  "white",
                borderRadius:
                  "16px",
                padding:
                  "60px 20px",
                textAlign:
                  "center",
              }}
            >
              <h2>
                No services found
              </h2>

              <p
                style={{
                  color:
                    "#667085",
                }}
              >
                Try another search,
                category or area.
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                style={{
                  border: "none",
                  background:
                    "#003b36",
                  color: "white",
                  padding:
                    "12px 18px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontWeight: 700,
                }}
              >
                Clear Filters
              </button>
            </section>
          ) : (
            /* RESULTS */

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredServices.map(
                (service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                  />
                )
              )}
            </div>
          )}

          {/* PROVIDER CTA */}

          <section
            style={{
              marginTop: "40px",
              background: "white",
              borderRadius:
                "18px",
              padding: "30px",
              border:
                "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              Offer cleaning services
              on ECOS
            </h2>

            <p
              style={{
                maxWidth: "650px",
                margin:
                  "0 auto 20px",
                color: "#667085",
                lineHeight: 1.6,
              }}
            >
              Register your
              cleaning business,
              create your services,
              receive bookings and
              manage your customers
              from your ECOS
              business dashboard.
            </p>

            <Link
              to="/register-business"
              style={{
                display:
                  "inline-block",
                background:
                  "#003b36",
                color: "white",
                textDecoration:
                  "none",
                padding:
                  "12px 20px",
                borderRadius:
                  "9px",
                fontWeight: 700,
              }}
            >
              Register Your Business
            </Link>
          </section>

          {/* BRAND */}

          <footer
            style={{
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            <img
              src="/branding/everyday-connect-logo.png"
              alt="Everyday Connect"
              style={{
                width: "170px",
                maxWidth: "80%",
              }}
            />

            <p
              style={{
                marginTop: "8px",
                color: "#00695c",
                fontWeight: 700,
              }}
            >
              Everyday Connect ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â
              Making Life Worth Living
            </p>
          </footer>
        </div>
      </main>

      <style>
        {`
          @keyframes ecosSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
}

function ServiceCard({
  service,
}: {
  service: CleaningService;
}) {
  const business =
    service.business;

  const providerName =
    business?.name ||
    "Local ECOS Provider";

  const providerArea =
    business?.area ||
    business?.city ||
    "Bamenda";

  const price =
    service.price ?? 0;

  const currency =
    service.currency ||
    "FCFA";

  const duration =
    formatDuration(
      service.duration_minutes
    );

  const providerLogo =
    business?.logo ||
    business?.cover_image ||
    "/branding/everyday-connect-logo.png";

  return (
    <article
      style={{
        background: "white",
        borderRadius:
          "16px",
        overflow: "hidden",
        border:
          "1px solid #e5e7eb",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      {/* SERVICE IMAGE / PROVIDER IMAGE */}

      <div
        style={{
          height: "145px",
          position: "relative",
          background:
            "linear-gradient(135deg, #003b36, #00897b)",
          overflow: "hidden",
        }}
      >
        <img
          src={providerLogo}
          alt={providerName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.75,
          }}
          onError={(
            event
          ) => {
            event.currentTarget.src =
              "/branding/everyday-connect-logo.png";
          }}
        />

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,59,54,0.75), rgba(0,59,54,0.05))",
          }}
        />

        {service.is_featured && (
          <span
            style={{
              position:
                "absolute",
              top: "12px",
              left: "12px",
              background:
                "#fef3c7",
              color:
                "#92400e",
              padding:
                "6px 9px",
              borderRadius:
                "999px",
              fontSize:
                "11px",
              fontWeight: 700,
            }}
          >
            Featured
          </span>
        )}

        <span
          style={{
            position:
              "absolute",
            bottom: "12px",
            left: "15px",
            color: "white",
            fontSize:
              "13px",
            fontWeight: 700,
          }}
        >
          {business?.category ||
            "Cleaning Service"}
        </span>
      </div>

      <div
        style={{
          padding: "20px",
        }}
      >
        {/* SERVICE / PROVIDER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "10px",
            alignItems:
              "flex-start",
          }}
        >
          <div>
            <h3
              style={{
                margin:
                  "0 0 7px",
                color:
                  "#172033",
              }}
            >
              {service.service_name}
            </h3>

            <Link
              to={`/business/${service.business_id}`}
              style={{
                margin: 0,
                fontSize:
                  "13px",
                color:
                  "#00695c",
                fontWeight: 700,
                textDecoration:
                  "none",
              }}
            >
              {providerName}
            </Link>
          </div>

          {business?.verified && (
            <span
              style={{
                background:
                  "#dcfce7",
                color:
                  "#166534",
                padding:
                  "5px 8px",
                borderRadius:
                  "999px",
                fontSize:
                  "11px",
                fontWeight: 700,
                whiteSpace:
                  "nowrap",
              }}
            >
              Verified
            </span>
          )}
        </div>

        {/* DESCRIPTION */}

        <p
          style={{
            color:
              "#667085",
            lineHeight:
              1.55,
            fontSize:
              "14px",
            minHeight:
              "65px",
          }}
        >
          {service.description ||
            "Professional cleaning service available through ECOS."}
        </p>

        {/* LOCATION / DURATION */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "10px",
            padding:
              "12px 0",
            borderTop:
              "1px solid #edf0f2",
            borderBottom:
              "1px solid #edf0f2",
          }}
        >
          <span
            style={{
              fontSize:
                "13px",
              color:
                "#667085",
            }}
          >
            ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â {providerArea}
          </span>

          {duration && (
            <span
              style={{
                fontSize:
                  "13px",
                color:
                  "#667085",
              }}
            >
              ÃƒÂ¢Ã‚ÂÃ‚Â± {duration}
            </span>
          )}
        </div>

        {/* PRICE / ACTION */}

        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: "15px",
            marginTop:
              "18px",
          }}
        >
          <div>
            <strong
              style={{
                fontSize:
                  "20px",
                color:
                  "#003b36",
              }}
            >
              {price.toLocaleString()}{" "}
              {currency}
            </strong>

            <div
              style={{
                fontSize:
                  "11px",
                color:
                  "#98a2b3",
              }}
            >
              Starting price
            </div>
          </div>

          <Link
            to={`/business/${service.business_id}`}
            style={{
              border: "none",
              background:
                "#003b36",
              color: "white",
              padding:
                "11px 15px",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight: 700,
              textDecoration:
                "none",
              display:
                "inline-block",
            }}
          >
            View Provider
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatDuration(
  minutes: number | null
) {
  if (
    !minutes ||
    minutes <= 0
  ) {
    return "";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remaining =
    minutes % 60;

  if (!remaining) {
    return `${hours} ${
      hours === 1
        ? "hr"
        : "hrs"
    }`;
  }

  return `${hours} hr ${
    remaining
  } min`;
}

const selectStyle = {
  padding: "11px 13px",
  borderRadius: "8px",
  border:
    "1px solid #d0d5dd",
  background: "white",
  color: "#344054",
  fontSize: "14px",
};

export default CleaningServices;