import { Link } from "react-router-dom";

import EcosSearchBox from "../ECOS/EcosSearchBox";

import { useLanguage } from "@/context/LanguageContext";

function Hero() {
  const { language } =
    useLanguage();

  const isFrench =
    language === "fr";

  return (
    <section
      style={{
        minHeight: "520px",
        background:
          "linear-gradient(135deg, #003366 0%, #005b96 55%, #0077b6 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "70px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            maxWidth: "850px",
          }}
        >
          <div
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "8px",
              padding:
                "8px 14px",
              borderRadius:
                "999px",
              background:
                "rgba(255,255,255,0.12)",
              border:
                "1px solid rgba(255,255,255,0.2)",
              marginBottom:
                "22px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing:
                "0.5px",
            }}
          >
            <span>
              Everyday Connect
            </span>
          </div>

          <h1
            style={{
              fontSize:
                "clamp(38px, 6vw, 68px)",
              lineHeight: 1.05,
              margin:
                "0 0 20px",
              fontWeight: 800,
              letterSpacing:
                "-1.5px",
            }}
          >
            {isFrench ? (
              <>
                Tout ce dont
                vous avez
                besoin.
                <br />
                Connecté à
                Bamenda.
              </>
            ) : (
              <>
                Everything
                you need.
                <br />
                Connected in
                Bamenda.
              </>
            )}
          </h1>

          <p
            style={{
              fontSize: "19px",
              lineHeight: 1.6,
              maxWidth: "720px",
              margin:
                "0 0 32px",
              color:
                "rgba(255,255,255,0.9)",
            }}
          >
            {isFrench
              ? "Découvrez des entreprises de confiance, des services de nettoyage, des stations de lavage automobile, des transports, des restaurants, des hôtels, des lieux, les actualités locales et les services du quotidien à Bamenda."
              : "Discover trusted businesses, cleaning services, car washes, transport, food, hotels, places, local news and everyday services across Bamenda."}
          </p>

          {/* ==================================================
              UNIVERSAL SEARCH
             ================================================== */}

          <EcosSearchBox />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Link
              to="/businesses"
              style={quickLinkStyle}
            >
              {isFrench
                ? "Entreprises"
                : "Businesses"}
            </Link>

            <Link
              to="/cleaning-services"
              style={quickLinkStyle}
            >
              {isFrench
                ? "Services de nettoyage"
                : "Cleaning Services"}
            </Link>

            <Link
              to="/register-business"
              style={quickLinkStyle}
            >
              {isFrench
                ? "Enregistrer votre entreprise"
                : "Register Your Business"}
            </Link>
          </div>

          <p
            style={{
              marginTop: "28px",
              marginBottom: 0,
              fontSize: "13px",
              color:
                "rgba(255,255,255,0.72)",
              fontWeight: 600,
              letterSpacing:
                "0.3px",
            }}
          >
            {isFrench
              ? "Rendre chaque jour digne d'être vécu"
              : "Making Life Worth Living"}
          </p>
        </div>
      </div>
    </section>
  );
}

const quickLinkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  background:
    "rgba(255,255,255,0.12)",
  border:
    "1px solid rgba(255,255,255,0.2)",
  fontSize: "14px",
  fontWeight: 600,
};

export default Hero;