import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type RegistrationMode = "business" | "talent";

type Category = {
  id: string;
  name: string;
  icon: string;
};

const businessCategories: Category[] = [
  { id: "automotive", name: "Automotive", icon: "🚗" },
  { id: "food", name: "Food & Restaurant", icon: "🍔" },
  { id: "hotel", name: "Hotel & Accommodation", icon: "🏨" },
  { id: "education", name: "Education", icon: "🏫" },
  { id: "health", name: "Health", icon: "🏥" },
  { id: "construction", name: "Construction & Repair", icon: "🛠️" },
  { id: "technology", name: "Technology", icon: "💻" },
  { id: "retail", name: "Retail & Shopping", icon: "🛍️" },
  { id: "transport", name: "Transport", icon: "🚚" },
  { id: "cleaning", name: "Cleaning Services", icon: "🧹" },
  { id: "government", name: "Government / Public Services", icon: "🏛️" },
  { id: "creative", name: "Creative & Media", icon: "🎨" },
  { id: "agriculture", name: "Agriculture", icon: "🌾" },
  { id: "other", name: "Other", icon: "📦" },
];

const talentCategories: Category[] = [
  { id: "plumber", name: "Plumber", icon: "🔧" },
  { id: "electrician", name: "Electrician", icon: "⚡" },
  { id: "mechanic", name: "Mechanic", icon: "🔩" },
  { id: "carpenter", name: "Carpenter", icon: "🪚" },
  { id: "builder", name: "Builder / Mason", icon: "🧱" },
  { id: "tailor", name: "Tailor", icon: "🧵" },
  { id: "photographer", name: "Photographer", icon: "📷" },
  { id: "designer", name: "Designer", icon: "🎨" },
  { id: "developer", name: "Web / Software Developer", icon: "💻" },
  { id: "cleaner", name: "Cleaner", icon: "🧹" },
  { id: "driver", name: "Driver", icon: "🚗" },
  { id: "technician", name: "Technician", icon: "🛠️" },
  { id: "hairdresser", name: "Hairdresser / Barber", icon: "💇" },
  { id: "makeup-artist", name: "Makeup Artist", icon: "💄" },
  { id: "consultant", name: "Consultant", icon: "💼" },
  { id: "other", name: "Other", icon: "📦" },
];

function normalizeCategory(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-");
}

export default function RegistrationGateway() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const requestedMode =
    searchParams.get("mode");

  const requestedCategory =
    searchParams.get("category");

  const initialMode: RegistrationMode =
    requestedMode === "talent"
      ? "talent"
      : "business";

  const categories =
    initialMode === "talent"
      ? talentCategories
      : businessCategories;

  const selectedCategory = useMemo(() => {
    if (!requestedCategory) {
      return "";
    }

    const normalized =
      normalizeCategory(
        requestedCategory
      );

    const match = categories.find(
      (category) =>
        category.id === normalized ||
        normalizeCategory(
          category.name
        ) === normalized
    );

    return match?.id || "";
  }, [
    requestedCategory,
    categories,
  ]);

  function openRegistration(
    mode: RegistrationMode,
    category = ""
  ) {
    const params =
      new URLSearchParams();

    params.set("mode", mode);

    if (category) {
      params.set(
        "category",
        category
      );
    }

    navigate(
      `/register-business/form?${params.toString()}`
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1050,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#eaf3ff",
              color: "#2563eb",
              padding: "8px 16px",
              borderRadius: 30,
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 15,
            }}
          >
            Everyday Connect
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize:
                "clamp(30px,5vw,46px)",
            }}
          >
            Register on Everyday Connect
          </h1>

          <p
            style={{
              maxWidth: 680,
              margin:
                "14px auto 0",
              color: "#64748b",
              lineHeight: 1.7,
              fontSize: 16,
            }}
          >
            Register your business or
            professional skills so people
            can discover and connect with
            you.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <button
            type="button"
            onClick={() =>
              openRegistration(
                "business"
              )
            }
            style={{
              textAlign: "left",
              border:
                "2px solid #dbeafe",
              background: "#fff",
              borderRadius: 18,
              padding: 28,
              cursor: "pointer",
              boxShadow:
                "0 8px 25px rgba(15,23,42,.06)",
            }}
          >
            <div
              style={{
                fontSize: 45,
                marginBottom: 15,
              }}
            >
              🏢
            </div>

            <h2
              style={{
                margin:
                  "0 0 10px",
                color: "#0f172a",
              }}
            >
              Register a Business
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Register a company, shop,
              restaurant, car wash, school,
              service or other organization.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              openRegistration(
                "talent"
              )
            }
            style={{
              textAlign: "left",
              border:
                "2px solid #dbeafe",
              background: "#fff",
              borderRadius: 18,
              padding: 28,
              cursor: "pointer",
              boxShadow:
                "0 8px 25px rgba(15,23,42,.06)",
            }}
          >
            <div
              style={{
                fontSize: 45,
                marginBottom: 15,
              }}
            >
              🧑‍🔧
            </div>

            <h2
              style={{
                margin:
                  "0 0 10px",
                color: "#0f172a",
              }}
            >
              Register My Talent
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Register your professional
              skills and let customers find
              you when they need your services.
            </p>
          </button>
        </section>

        <section
          style={{
            background: "#fff",
            border:
              "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 25,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            Choose a category
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: 22,
            }}
          >
            Select the category that best
            describes what you want to
            register.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(190px,1fr))",
              gap: 12,
            }}
          >
            {categories.map(
              (category) => {
                const selected =
                  selectedCategory ===
                  category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      openRegistration(
                        initialMode,
                        category.id
                      )
                    }
                    style={{
                      border: selected
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                      background: selected
                        ? "#eff6ff"
                        : "#fff",
                      borderRadius: 12,
                      padding: 16,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 27,
                        marginBottom: 8,
                      }}
                    >
                      {category.icon}
                    </div>

                    <strong
                      style={{
                        color:
                          "#0f172a",
                        display:
                          "block",
                      }}
                    >
                      {category.name}
                    </strong>
                  </button>
                );
              }
            )}
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            marginTop: 30,
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            style={{
              border:
                "1px solid #cbd5e1",
              background: "#fff",
              borderRadius: 8,
              padding:
                "10px 18px",
              cursor: "pointer",
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
