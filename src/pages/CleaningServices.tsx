import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
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
  phone?: string | null;
};

type CleaningService = {
  id: string;
  business_id: string;
  cleaning_category: string | null;
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

const CLEANING_CATEGORIES = [
  {
    id: "car-wash",
    icon: "CW",
    nameKey: "cleaningCategoryCarWash",
    descriptionKey: "cleaningCategoryCarWashDescription",
  },
  {
    id: "vehicle-detailing",
    icon: "VD",
    nameKey: "cleaningCategoryVehicleDetailing",
    descriptionKey: "cleaningCategoryVehicleDetailingDescription",
  },
  {
    id: "home-cleaning",
    icon: "HC",
    nameKey: "cleaningCategoryHome",
    descriptionKey: "cleaningCategoryHomeDescription",
  },
  {
    id: "hotel-cleaning",
    icon: "HT",
    nameKey: "cleaningCategoryHotel",
    descriptionKey: "cleaningCategoryHotelDescription",
  },
  {
    id: "office-cleaning",
    icon: "OF",
    nameKey: "cleaningCategoryOffice",
    descriptionKey: "cleaningCategoryOfficeDescription",
  },
  {
    id: "laundry",
    icon: "LA",
    nameKey: "cleaningCategoryLaundry",
    descriptionKey: "cleaningCategoryLaundryDescription",
  },
  {
    id: "carpet-cleaning",
    icon: "CC",
    nameKey: "cleaningCategoryCarpet",
    descriptionKey: "cleaningCategoryCarpetDescription",
  },
  {
    id: "general-cleaning",
    icon: "GC",
    nameKey: "cleaningCategoryGeneral",
    descriptionKey: "cleaningCategoryGeneralDescription",
  },
  {
    id: "other-cleaning",
    icon: "OT",
    nameKey: "cleaningCategoryOther",
    descriptionKey: "cleaningCategoryOtherDescription",
  },
];

function CleaningServices() {
  const { t: translations } = useLanguage();

  const t = (key: string) =>
    translations[key as keyof typeof translations] ?? key;
  const [services, setServices] = useState<CleaningService[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError("");

    const { data, error: databaseError } =
      await supabase
        .from("business_services")
        .select(`
          id,
          business_id,
          cleaning_category,
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
            cover_image,
            phone
          )
        `)
        .eq("active", true)
        .order("display_order", {
          ascending: true,
        });

    if (databaseError) {
      console.error(
        "CleaningServices.loadServices:",
        databaseError
      );

      setError(
        t("cleaningServicesLoadError")
      );
      setServices([]);
      setLoading(false);
      return;
    }

    const normalizedServices: CleaningService[] =
      (data ?? [])
        .filter(
          (item: any) =>
            item.cleaning_category !== null &&
            item.cleaning_category !== undefined &&
            String(item.cleaning_category).trim() !== ""
        )
        .map((item: any) => {
        const rawBusiness = Array.isArray(item.business)
          ? item.business[0] ?? null
          : item.business ?? null;

        const business: Business | null =
          rawBusiness
            ? {
                id: String(rawBusiness.id),
                name: rawBusiness.name ?? null,
                category: rawBusiness.category ?? null,
                area: rawBusiness.area ?? null,
                city: rawBusiness.city ?? null,
                verified: rawBusiness.verified ?? null,
                logo: rawBusiness.logo ?? null,
                cover_image:
                  rawBusiness.cover_image ?? null,
                phone: rawBusiness.phone ?? null,
              }
            : null;

        return {
          id: String(item.id),
          business_id: String(item.business_id),
          cleaning_category:
            item.cleaning_category ?? null,
          service_name: String(item.service_name),
          description: item.description ?? null,
          price:
            item.price !== null
              ? Number(item.price)
              : null,
          currency: item.currency ?? "FCFA",
          duration_minutes:
            item.duration_minutes !== null
              ? Number(item.duration_minutes)
              : null,
          is_featured: item.is_featured === true,
          display_order:
            Number(item.display_order ?? 0),
          active: item.active !== false,
          business,
        };
      });

    setServices(normalizedServices);
    setLoading(false);
  }

  const areas = useMemo(() => {
    return [
      ...new Set(
        services
          .map((service) => service.business?.area)
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      ),
    ].sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return services.filter((service) => {
      const business = service.business;

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
        searchableText.includes(normalizedSearch);

      const categoryMatch =
        !category ||
        matchesCleaningCategory(
          service,
          category
        );

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
    <main
      style={{
        minHeight:
          "calc(100vh - 72px)",
        background: "#f5f7f7",
        padding: "32px 20px 70px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

      <section
          style={{
            background:
              "linear-gradient(135deg, #003b36, #00695c)",
            color: "white",
            borderRadius: "22px",
            padding: "42px 30px",
            marginBottom: "24px",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              maxWidth: "760px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#9de8df",
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ECOS Marketplace
            </p>

            <h1
              style={{
                margin: "0 0 14px",
                fontSize:
                  "clamp(32px, 5vw, 52px)",
                lineHeight: 1.08,
              }}
            >
              {t("cleaningServicesTitle")}
            </h1>

            <p
              style={{
                margin: "0 0 22px",
                lineHeight: 1.7,
                color:
                  "rgba(255,255,255,0.9)",
              }}
            >
              {t(
                "cleaningServicesHeroDescription"
              )}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              <Link
                to="/cleaning-booking"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "46px",
                  padding: "0 20px",
                  borderRadius: "10px",
                  background: "white",
                  color: "#003b36",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                {t("cleaningBookingBookService")}
              </Link>

              <span
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "14px",
                }}
              >
                {t("cleaningBookingCustomerCtaDescription")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register-business"
                style={{
                  background: "white",
                  color: "#003b36",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: "9px",
                  fontWeight: 800,
                }}
              >
                {t(
                  "cleaningServicesBecomeProvider"
                )}
              </Link>

              <Link
                to="/business-dashboard"
                style={{
                  background:
                    "rgba(255,255,255,0.12)",
                  color: "white",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: "9px",
                  fontWeight: 800,
                  border:
                    "1px solid rgba(255,255,255,0.25)",
                }}
              >
                {t(
                  "cleaningServicesProviderDashboard"
                )}
              </Link>
            </div>
          </div>
        </section>


      <section
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "22px",
            marginBottom: "24px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 6px",
                color: "#101828",
              }}
            >
              {t(
                "cleaningServicesChooseCategory"
              )}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#667085",
              }}
            >
              {t(
                "cleaningServicesCategoryDescription"
              )}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px",
            }}
          >
            {CLEANING_CATEGORIES.map(
              (item) => {
                const active =
                  category === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCategory(
                        active
                          ? ""
                          : item.id
                      )
                    }
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      padding: "15px",
                      borderRadius: "13px",
                      border: active
                        ? "2px solid #00695c"
                        : "1px solid #e4e7ec",
                      background: active
                        ? "#edf9f7"
                        : "white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          background: "#e5f4f1",
                          color: "#00695c",
                          fontSize: "12px",
                          fontWeight: 900,
                        }}
                      >
                        {item.icon}
                      </span>

                      <strong
                        style={{
                          color: "#101828",
                          fontSize: "14px",
                        }}
                      >
                        {t(item.nameKey)}
                      </strong>
                    </div>

                    <span
                      style={{
                        color: "#667085",
                        fontSize: "12px",
                        lineHeight: 1.45,
                      }}
                    >
                      {t(
                        item.descriptionKey
                      )}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </section>


      <section
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "24px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={t(
              "cleaningServicesSearchPlaceholder"
            )}
            aria-label={t(
              "cleaningServicesSearchLabel"
            )}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "10px",
              border:
                "1px solid #d0d5dd",
              outline: "none",
              fontSize: "15px",
              marginBottom: "14px",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              value={area}
              onChange={(event) =>
                setArea(event.target.value)
              }
              style={selectStyle}
              aria-label={t(
                "cleaningServicesAreaLabel"
              )}
            >
              <option value="">
                {t(
                  "cleaningServicesAllAreas"
                )}
              </option>

              {areas.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#344054",
              }}
            >
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(event) =>
                  setVerifiedOnly(
                    event.target.checked
                  )
                }
              />

              {t(
                "cleaningServicesVerifiedOnly"
              )}
            </label>

            <button
              type="button"
              onClick={clearFilters}
              style={{
                border: "none",
                background: "#eef2f2",
                color: "#344054",
                padding: "10px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {t(
                "cleaningServicesClearFilters"
              )}
            </button>
          </div>
        </section>

        <div
          style={{
            marginBottom: "16px",
            color: "#667085",
            fontSize: "14px",
          }}
        >
          {loading
            ? t(
                "cleaningServicesLoading"
              )
            : t(
                "cleaningServicesShowing"
              )
                .replace(
                  "{shown}",
                  String(
                    filteredServices.length
                  )
                )
                .replace(
                  "{total}",
                  String(services.length)
                )}
        </div>

        {error && (
  
      <section
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            {error}
          </section>
        )}

        {loading ? (
          <LoadingState t={t} />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            t={t}
            onClear={clearFilters}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {filteredServices.map(
              (service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  t={t}
                />
              )
            )}
          </div>
        )}


      <section
          style={{
            marginTop: "36px",
            background: "white",
            borderRadius: "18px",
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
            {t(
              "cleaningServicesProviderCtaTitle"
            )}
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
            {t(
              "cleaningServicesProviderCtaDescription"
            )}
          </p>

          <Link
            to="/register-business"
            style={{
              display: "inline-block",
              background: "#003b36",
              color: "white",
              textDecoration: "none",
              padding: "12px 20px",
              borderRadius: "9px",
              fontWeight: 800,
            }}
          >
            {t(
              "cleaningServicesRegisterBusiness"
            )}
          </Link>
        </section>

        <footer
          style={{
            textAlign: "center",
            marginTop: "36px",
          }}
        >
          <img
            src="/branding/everyday-connect-logo.png"
            alt={t(
              "cleaningServicesLogoAlt"
            )}
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
            Everyday Connect
          </p>
        </footer>
      </div>
    </main>
  );
}

function ServiceCard({
  service,
  t,
}: {
  service: CleaningService;
  t: (key: string) => string;
}) {
  const business = service.business;

  const price =
    service.price !== null
      ? service.price.toLocaleString()
      : null;

  const duration = formatDuration(
    service.duration_minutes
  );

  const whatsappUrl = createWhatsAppUrl(
    business?.phone ?? null
  );

  return (
    <article
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        border:
          "1px solid #e5e7eb",
        boxShadow:
          "0 5px 18px rgba(16,24,40,0.06)",
      }}
    >
      <div
        style={{
          height: "150px",
          background: "#dfe9e7",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {business?.cover_image ? (
          <img
            src={business.cover_image}
            alt={
              business.name ??
              t(
                "cleaningServicesProvider"
              )
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#00695c",
              fontWeight: 800,
              fontSize: "22px",
            }}
          >
            ECOS
          </div>
        )}

        {service.is_featured && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "#003b36",
              color: "white",
              padding: "6px 9px",
              borderRadius: "7px",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {t(
              "cleaningServicesFeatured"
            )}
          </span>
        )}
      </div>

      <div
        style={{
          padding: "18px",
        }}
      >
        <h3
          style={{
            margin:
              "0 0 7px",
            color: "#101828",
          }}
        >
          {service.service_name}
        </h3>

        <p
          style={{
            margin:
              "0 0 10px",
            color: "#667085",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {service.description ||
            t(
              "cleaningServicesNoDescription"
            )}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            marginBottom: "14px",
          }}
        >
          <strong
            style={{
              color: "#344054",
            }}
          >
            {business?.name ||
              t(
                "cleaningServicesProvider"
              )}
          </strong>

          {business?.verified && (
            <span
              style={{
                color: "#00695c",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {t(
                "cleaningServicesVerifiedProvider"
              )}
            </span>
          )}

          {(business?.area ||
            business?.city) && (
            <span
              style={{
                color: "#667085",
                fontSize: "12px",
              }}
            >
              {[
                business.area,
                business.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}

          {duration && (
            <span
              style={{
                color: "#667085",
                fontSize: "12px",
              }}
            >
              {t(
                "cleaningServicesDuration"
              ).replace(
                "{duration}",
                duration
              )}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div>
            {price ? (
              <>
                <strong
                  style={{
                    fontSize: "19px",
                    color: "#003b36",
                  }}
                >
                  {price}{" "}
                  {service.currency ||
                    "FCFA"}
                </strong>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#98a2b3",
                  }}
                >
                  {t(
                    "cleaningServicesStartingPrice"
                  )}
                </div>
              </>
            ) : (
              <strong
                style={{
                  color: "#667085",
                  fontSize: "13px",
                }}
              >
                {t(
                  "cleaningServicesContactForPrice"
                )}
              </strong>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "7px",
              flexWrap: "wrap",
            }}
          >
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  border:
                    "1px solid #d0d5dd",
                  color: "#344054",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {t(
                  "cleaningServicesWhatsApp"
                )}
              </a>
            )}

            <Link
              to={`/cleaning-booking?businessId=${service.business_id}&serviceId=${service.id}`}
              className="cleaning-service-book-button"
            >
              {t("cleaningBookingBookService")}
            </Link>
            <Link
              to={`/business/${service.business_id}`}
              style={{
                background: "#003b36",
                color: "white",
                padding: "10px 12px",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              {t(
                "cleaningServicesViewProvider"
              )}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function LoadingState({
  t,
}: {
  t: (key: string) => string;
}) {
  return (
    <section
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          margin: "0 auto 15px",
          border:
            "4px solid #d9e7e5",
          borderTop:
            "4px solid #003b36",
          borderRadius: "50%",
          animation:
            "ecosSpin 0.8s linear infinite",
        }}
      />

      <h2>
        {t(
          "cleaningServicesLoadingTitle"
        )}
      </h2>

      <p
        style={{
          color: "#667085",
        }}
      >
        {t(
          "cleaningServicesLoadingDescription"
        )}
      </p>
    </section>
  );
}

function EmptyState({
  t,
  onClear,
}: {
  t: (key: string) => string;
  onClear: () => void;
}) {
  return (
    <section
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <h2>
        {t(
          "cleaningServicesNoResultsTitle"
        )}
      </h2>

      <p
        style={{
          color: "#667085",
        }}
      >
        {t(
          "cleaningServicesNoResultsDescription"
        )}
      </p>

      <button
        type="button"
        onClick={onClear}
        style={{
          border: "none",
          background: "#003b36",
          color: "white",
          padding: "12px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 800,
        }}
      >
        {t(
          "cleaningServicesClearFilters"
        )}
      </button>
    </section>
  );
}

function matchesCleaningCategory(
  service: CleaningService,
  category: string
) {
  return service.cleaning_category === category;
}

function createWhatsAppUrl(
  phone: string | null
) {
  if (!phone) {
    return "";
  }

  const digits = phone.replace(
    /[^0-9]/g,
    ""
  );

  if (!digits) {
    return "";
  }

  return `https://wa.me/${digits}`;
}

function formatDuration(
  minutes: number | null
) {
  if (!minutes || minutes <= 0) {
    return "";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remaining =
    minutes % 60;

  if (!remaining) {
    return `${hours} ${
      hours === 1
        ? "hr"
        : "hrs"
    }`;
  }

  return `${hours} hr ${remaining} min`;
}

const selectStyle = {
  padding: "11px 13px",
  borderRadius: "8px",
  border: "1px solid #d0d5dd",
  background: "white",
  color: "#344054",
  fontSize: "14px",
};

export default CleaningServices;














