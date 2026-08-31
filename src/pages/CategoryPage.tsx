import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import EcosSearchBox from "@/components/ECOS/EcosSearchBox";

import {
  getCategoryBySlug,
} from "@/core/categories/CategoryDefinitions";

import {
  getCategoryResults,
} from "@/core/categories/CategoryResults";

import type {
  CategoryResult,
} from "@/core/categories/CategoryResults";

import "./CategoryPage.css";


function CategoryPage() {
  const { slug } =
    useParams();

  const category =
    slug
      ? getCategoryBySlug(slug)
      : undefined;

  const [
    results,
    setResults,
  ] =
    useState<CategoryResult[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadCategory() {
      if (!category) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        /*
         * =================================================
         * LOAD DEDICATED ECOS CATEGORY DATA
         * =================================================
         */
/*
         * =================================================
         * LOAD UNIFIED CATEGORY ECOSYSTEM
         * =================================================
         *
         * This combines:
         *
         * 1. ecos_category_items
         * 2. existing businesses
         * 3. existing places
         *
         * using CategoryMappings.
         */

        const unifiedResults =
          await getCategoryResults(
            category.slug,
            24
          );


        if (cancelled) {
          return;
        }




        setResults(
          unifiedResults
        );

      } catch (loadError) {
        console.error(
          "Category loading error:",
          loadError
        );

        if (!cancelled) {
          setError(
            "We couldn't load this category right now."
          );

          setResults([]);
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      cancelled = true;
    };
  }, [category]);


  if (!category) {
    return (
      <main className="category-page">

        <div className="category-not-found">

          <h1>
            Category not found
          </h1>

          <p>
            The category you requested
            does not exist.
          </p>

          <Link to="/">
            Back to Everyday Connect
          </Link>

        </div>

      </main>
    );
  }


  return (
    <main className="category-page">

      {/* =================================================
          CATEGORY HERO
      ================================================= */}

      <section
        className="category-hero"
        style={{
          "--category-color":
            category.color,
        } as React.CSSProperties}
      >

        <div className="category-hero-watermark">
          {category.icon}
        </div>

        <div className="category-hero-content">

          <Link
            to="/"
            className="category-back"
          >
            ← Everyday Connect
          </Link>

          <div className="category-icon-large">
            {category.icon}
          </div>

          <div className="category-eyebrow">
            EVERYDAY CONNECT
          </div>

          <h1>
            {category.name}
          </h1>

          <p>
            {category.description}
          </p>

          <div className="category-search">
            <EcosSearchBox />
          </div>

        </div>

      </section>


      {/* =================================================
          CATEGORY CONTENT
      ================================================= */}

      <section className="category-content">


        {/* =================================================
            SUPABASE CATEGORY DATA STATUS
        ================================================= */}

        {!loading &&
          results.length > 0 && (
            <div className="category-data-status">

              <span>
                ●
              </span>

              {results.length}{" "}
              connected{" "}
              {category.name.toLowerCase()}{" "}
              results

            </div>
          )}


        {/* =================================================
            SUBCATEGORIES
        ================================================= */}

        <div className="category-section">

          <div className="category-section-heading">

            <div>

              <span>
                EXPLORE
              </span>

              <h2>
                {category.name}
              </h2>

            </div>

          </div>


          <div className="subcategory-grid">

            {category.subcategories.map(
              (subcategory) => (
                <Link
                  key={subcategory}
                  to={`/search?search=${encodeURIComponent(
                    `${subcategory} in Bamenda`
                  )}`}
                  className="subcategory-card"
                >

                  <strong>
                    {subcategory}
                  </strong>

                  <span>
                    →
                  </span>

                </Link>
              )
            )}

          </div>

        </div>


        {/* =================================================
            POPULAR SEARCHES
        ================================================= */}

        <div className="category-section">

          <div className="category-section-heading">

            <div>

              <span>
                POPULAR
              </span>

              <h2>
                What people search for
              </h2>

            </div>

          </div>


          <div className="popular-searches">

            {category.popularSearches.map(
              (search) => (
                <Link
                  key={search}
                  to={`/search?search=${encodeURIComponent(
                    search
                  )}`}
                  className="popular-search"
                >
                  {search}

                  <span>
                    →
                  </span>

                </Link>
              )
            )}

          </div>

        </div>


        {/* =================================================
            RESULTS
        ================================================= */}

        <div className="category-section">

          <div className="category-section-heading">

            <div>

              <span>
                EVERYDAY CONNECT
              </span>

              <h2>
                {category.name} around you
              </h2>

              <p>
                Places, businesses and
                opportunities connected
                to this category.
              </p>

            </div>


            <Link
              to={`/search?search=${encodeURIComponent(
                category.searchTerm
              )}`}
              className="view-all"
            >
              View all →
            </Link>

          </div>


          {loading ? (

            <div className="category-loading">
              Connecting to Everyday Connect...
            </div>

          ) : error ? (

            <div className="category-empty">

              <div>
                ⚠️
              </div>

              <h3>
                Category temporarily unavailable
              </h3>

              <p>
                {error}
              </p>

            </div>

          ) : results.length === 0 ? (

            <div className="category-empty">

              <div>
                {category.icon}
              </div>

              <h3>
                We're still growing this
                category.
              </h3>

              <p>
                Try searching for something
                specific within{" "}
                {category.name.toLowerCase()}.
              </p>

              <Link
                to={`/search?search=${encodeURIComponent(
                  category.searchTerm
                )}`}
              >
                Search now →
              </Link>

            </div>

          ) : (

            <div className="category-results">

              {results.map(
                (result) => (

                  <Link
                    key={`${result.source}-${result.id}`}
                    to={result.url}
                    className="category-result-card"
                  >

                    <div className="result-image">

                      {result.image ? (

                        <img
                          src={result.image}
                          alt=""
                        />

                      ) : (

                        <span>
                          {category.icon}
                        </span>

                      )}

                    </div>


                    <div className="result-body">

                      <div className="result-type">
                        {result.source}
                      </div>

                      <h3>
                        {result.name}
                      </h3>

                      {result.category && (
                        <p className="result-category">
                          {result.category}
                        </p>
                      )}

                      {result.address && (
                        <p className="result-address">
                          📍 {result.address}
                        </p>
                      )}

                      {result.city && (
                        <p className="result-address">
                          {result.city}
                        </p>
                      )}

                      {result.verified && (
                        <span className="verified">
                          ✓ Verified
                        </span>
                      )}

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </div>


        {/* =================================================
            ECOS
        ================================================= */}

        <section className="category-ecos">

          <div>

            <span>
              ECOS
            </span>

            <h2>
              Can't find exactly what
              you're looking for?
            </h2>

            <p>
              Ask Everyday Connect naturally.
              ECOS searches across the connected
              ecosystem for you.
            </p>

          </div>


          <Link
            to="/search"
            className="category-ecos-button"
          >
            Ask ECOS →
          </Link>

        </section>

      </section>

    </main>
  );
}

export default CategoryPage;






