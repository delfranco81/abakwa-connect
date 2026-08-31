import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import EcosSearchBox from "@/components/ECOS/EcosSearchBox";
import HomeMap from "@/components/HomeMap";
import { useLanguage } from "@/context/LanguageContext";

import "./Home.css";

type HomeCategory = {
  id: string;
  nameKey:
    | "government"
    | "education"
    | "jobs"
    | "housing"
    | "businesses"
    | "services"
    | "talent"
    | "food"
    | "transport"
    | "community"
    | "hotels"
    | "pharmacy"
    | "mechanic";
  descriptionKey:
    | "governmentDescription"
    | "educationDescription"
    | "jobsDescription"
    | "housingDescription"
    | "businessesDescription"
    | "servicesDescription"
    | "talentDescription"
    | "transportDescription"
    | "communityDescription";
  icon: string;
  search: string;
};

type QuickService = {
  id: string;
  nameKey:
    | "carwash"
    | "cleaning"
    | "restaurants"
    | "hotels"
    | "taxi"
    | "bikeServices"
    | "mechanic"
    | "pharmacy";
  icon: string;
  search: string;
};

const categories: HomeCategory[] = [
  {
    id: "government",
    nameKey: "government",
    descriptionKey: "governmentDescription",
    icon: "🏛️",
    search: "government services",
  },
  {
    id: "education",
    nameKey: "education",
    descriptionKey: "educationDescription",
    icon: "🎓",
    search: "education schools universities",
  },
  {
    id: "jobs",
    nameKey: "jobs",
    descriptionKey: "jobsDescription",
    icon: "💼",
    search: "jobs opportunities",
  },
  {
    id: "housing",
    nameKey: "housing",
    descriptionKey: "housingDescription",
    icon: "🏠",
    search: "houses for rent in Bamenda",
  },
  {
    id: "businesses",
    nameKey: "businesses",
    descriptionKey: "businessesDescription",
    icon: "🏢",
    search: "businesses in Bamenda",
  },
  {
    id: "services",
    nameKey: "services",
    descriptionKey: "servicesDescription",
    icon: "🛠️",
    search: "services in Bamenda",
  },
  {
    id: "talent",
    nameKey: "talent",
    descriptionKey: "talentDescription",
    icon: "🧑‍🔧",
    search: "professional talent in Bamenda",
  },
  {
    id: "food",
    nameKey: "food",
    descriptionKey: "communityDescription",
    icon: "🍽️",
    search: "restaurants and food in Bamenda",
  },
  {
    id: "transport",
    nameKey: "transport",
    descriptionKey: "transportDescription",
    icon: "🚕",
    search: "transport services in Bamenda",
  },
  {
    id: "community",
    nameKey: "community",
    descriptionKey: "communityDescription",
    icon: "🤝",
    search: "community activities in Bamenda",
  },
  {
    id: "hotels",
    nameKey: "hotels",
    descriptionKey: "communityDescription",
    icon: "🏨",
    search: "hotels in Bamenda",
  },
  {
    id: "pharmacy",
    nameKey: "pharmacy",
    descriptionKey: "communityDescription",
    icon: "💊",
    search: "pharmacy in Bamenda",
  },
  {
    id: "mechanic",
    nameKey: "mechanic",
    descriptionKey: "servicesDescription",
    icon: "🔧",
    search: "mechanics in Bamenda",
  },
];

const quickServices: QuickService[] = [
  {
    id: "car-wash",
    nameKey: "carwash",
    icon: "🚗",
    search: "car wash in Bamenda",
  },
  {
    id: "cleaning",
    nameKey: "cleaning",
    icon: "🧹",
    search: "cleaning services in Bamenda",
  },
  {
    id: "restaurants",
    nameKey: "restaurants",
    icon: "🍴",
    search: "restaurants in Bamenda",
  },
  {
    id: "hotels",
    nameKey: "hotels",
    icon: "🏨",
    search: "hotels in Bamenda",
  },
  {
    id: "taxi",
    nameKey: "taxi",
    icon: "🚕",
    search: "taxi services in Bamenda",
  },
  {
    id: "bike",
    nameKey: "bikeServices",
    icon: "🏍️",
    search: "bike services in Bamenda",
  },
  {
    id: "mechanic",
    nameKey: "mechanic",
    icon: "🔧",
    search: "mechanics in Bamenda",
  },
  {
    id: "pharmacy",
    nameKey: "pharmacy",
    icon: "💊",
    search: "pharmacy in Bamenda",
  },
];

function Home() {
  const { t } = useLanguage();

  const [
    categoryStart,
    setCategoryStart,
  ] = useState(0);

  const [
    quickStart,
    setQuickStart,
  ] = useState(0);

  /*
   * CATEGORY CAROUSEL
   *
   * Four categories are displayed at a time.
   */
  const visibleCategories =
    useMemo(() => {
      const count = Math.min(
        4,
        categories.length
      );

      return Array.from(
        { length: count },
        (_, index) =>
          categories[
            (categoryStart +
              index) %
              categories.length
          ]
      );
    }, [categoryStart]);

  /*
   * QUICK SERVICES CAROUSEL
   *
   * Four quick services are displayed
   * at a time.
   */
  const visibleQuickServices =
    useMemo(() => {
      const count = Math.min(
        4,
        quickServices.length
      );

      return Array.from(
        { length: count },
        (_, index) =>
          quickServices[
            (quickStart +
              index) %
              quickServices.length
          ]
      );
    }, [quickStart]);

  function moveCategories(
    direction: number
  ) {
    setCategoryStart(
      (current) =>
        (current +
          direction +
          categories.length) %
        categories.length
    );
  }

  function moveQuickServices(
    direction: number
  ) {
    setQuickStart(
      (current) =>
        (current +
          direction +
          quickServices.length) %
        quickServices.length
    );
  }

  return (
    <div className="home-page">
      <main className="home-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="home-hero">

          <div className="home-logo-watermark" />

          <div className="home-hero-content">

            <div className="home-eyebrow">
              {t.everydayConnect}
            </div>

            <h1>
              {t.welcome}
            </h1>

            <p className="home-hero-description">
              {t.discover}
            </p>

            <div className="home-search">
              <EcosSearchBox />
            </div>

            <div className="home-actions">

              <Link
                to="/businesses"
                className="home-action"
              >
                <span>🏢</span>
                {t.businesses}
              </Link>

              <Link
                to="/cleaning-services"
                className="home-action"
              >
                <span>🧹</span>
                {t.cleaningTitle}
              </Link>

              <Link
                to="/register-business"
                className="home-action"
              >
                <span>➕</span>
                {t.registerBusiness}
              </Link>

            </div>

          </div>
        </section>


        {/* =================================================
            CATEGORY ECOSYSTEM
        ================================================= */}

        <section className="ecosystem-section">

          <div className="section-heading">

            <div>

              <div className="section-eyebrow">
                {t.everydayConnect}
              </div>

              <h2>
                {t.exploreEverything}{" "}
                <span>
                  {t.aroundYou}
                </span>
              </h2>

              <p>
                {t.discover}
              </p>

            </div>

            <div className="carousel-controls">

              <button
                type="button"
                onClick={() =>
                  moveCategories(-1)
                }
                aria-label={
                  t.previousCategories
                }
              >
                ←
              </button>

              <button
                type="button"
                onClick={() =>
                  moveCategories(1)
                }
                aria-label={
                  t.nextCategories
                }
              >
                →
              </button>

            </div>

          </div>


          <div className="category-grid">

            {visibleCategories.map(
              (category) => (
                <Link
                  key={category.id}
                  to={`/search?search=${encodeURIComponent(
                    category.search
                  )}`}
                  className="category-card"
                >

                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <h3>
                    {t[category.nameKey]}
                  </h3>

                  <p>
                    {t[category.descriptionKey]}
                  </p>

                </Link>
              )
            )}

          </div>


          {/* QUICK SERVICES */}

          <div
            className="quick-services-section"
          >

            <div className="section-heading">

              <div>

                <div className="section-eyebrow">
                  {t.search}
                </div>

                <h2>
                  {t.popularServices}{" "}
                  <span>
                    {t.services}
                  </span>
                </h2>

                <p>
                  {t.discoverServices}
                </p>

              </div>

              <div className="carousel-controls">

                <button
                  type="button"
                  onClick={() =>
                    moveQuickServices(-1)
                  }
                  aria-label={
                    t.previous
                  }
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() =>
                    moveQuickServices(1)
                  }
                  aria-label={
                    t.next
                  }
                >
                  →
                </button>

              </div>

            </div>


            <div className="quick-grid">

              {visibleQuickServices.map(
                (service) => (
                  <Link
                    key={service.id}
                    to={`/search?search=${encodeURIComponent(
                      service.search
                    )}`}
                    className="quick-card"
                  >

                    <span>
                      {service.icon}
                    </span>

                    <strong>
                      {t[service.nameKey]}
                    </strong>

                  </Link>
                )
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            MAP
        ================================================= */}

        <HomeMap />


        {/* =================================================
            ECOS
        ================================================= */}

        <section className="ecos-banner">

          <div className="ecos-banner-content">

            <div className="ecos-label">
              {t.ecos}
            </div>

            <h2>
              {t.askForAnything}
              <span>
                {t.wellHelpYouFindIt}
              </span>
            </h2>

            <p>
              {t.discover}
            </p>

            <Link
              to="/search"
              className="ecos-button"
            >
              {t.exploreEcos} →
            </Link>

          </div>

          <div className="ecos-banner-logo">

            <img
              src="/branding/everyday-connect-logo.png"
              alt={t.appName}
            />

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="home-footer">

          <span>
            © 2026 {t.appName}.{" "}
            {t.allRightsReserved}
          </span>

          <div>

            <Link to="/contact">
              {t.contact}
            </Link>

            <Link to="/about">
              {t.about}
            </Link>

            <Link to="/privacy">
              {t.privacy}
            </Link>

            <Link to="/terms">
              {t.terms}
            </Link>

          </div>

        </footer>

      </main>
    </div>
  );
}

export default Home;
