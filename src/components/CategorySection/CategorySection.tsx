import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

import {
  CATEGORY_DEFINITIONS,
} from "@/core/categories/CategoryDefinitions";

import type {
  CategoryDefinition,
} from "@/core/categories/CategoryDefinitions";

import "./CategorySection.css";


type DatabaseCategory = {
  id: number;
  name: string;
  icon?: string | null;
  description?: string | null;
  slug?: string;
};


const MAX_VISIBLE_CATEGORIES = 5;

const ROTATION_INTERVAL = 3500;


/*
 * =========================================================
 * CATEGORY SECTION
 * =========================================================
 *
 * CATEGORY_DEFINITIONS is the single source of truth for
 * the main Everyday Connect ecosystem.
 *
 * Database categories are allowed to appear as additional
 * categories only when they do not duplicate an existing
 * ecosystem category.
 */

function CategorySection() {

  const { language } =
    useLanguage();


  const [
    databaseCategories,
    setDatabaseCategories,
  ] =
    useState<DatabaseCategory[]>([]);


  const [
    activeStart,
    setActiveStart,
  ] =
    useState(0);


  const [
    isPaused,
    setIsPaused,
  ] =
    useState(false);


  /*
   * =========================================================
   * LOAD ADDITIONAL DATABASE CATEGORIES
   * =========================================================
   */

  useEffect(() => {

    async function loadCategories() {

      const {
        data,
        error,
      } =
        await supabase
          .from("categories")
          .select(
            "id, name, icon"
          )
          .eq(
            "status",
            "approved"
          )
          .order(
            "popularity",
            {
              ascending: false,
            }
          );


      if (error) {

        console.error(
          "Unable to load categories:",
          error
        );

        return;
      }


      if (data) {

        setDatabaseCategories(
          data as DatabaseCategory[]
        );

      }

    }


    loadCategories();

  }, []);


  /*
   * =========================================================
   * BUILD CATEGORY LIST
   * =========================================================
   *
   * Main categories ALWAYS come from
   * CategoryDefinitions.ts.
   *
   * Database categories are appended only when their
   * name does not already exist in the ecosystem.
   */

  const categories =
    useMemo(() => {

      const combined:
        CategoryDefinition[] =
        [
          ...CATEGORY_DEFINITIONS,
        ];


      databaseCategories.forEach(
        (databaseCategory) => {

          const exists =
            combined.some(
              (existing) =>
                existing.name
                  .trim()
                  .toLowerCase() ===
                databaseCategory.name
                  .trim()
                  .toLowerCase()
            );


          if (exists) {
            return;
          }


          /*
           * Database-only categories do not have the full
           * CategoryDefinition structure.
           *
           * We therefore do not inject them into the main
           * ecosystem list for now.
           *
           * This keeps the public category architecture
           * controlled by CategoryDefinitions.ts.
           */

        }
      );


      return combined;

    }, [
      databaseCategories,
    ]);


  /*
   * =========================================================
   * AUTOMATIC ROTATION
   * =========================================================
   */

  useEffect(() => {

    if (
      isPaused ||
      categories.length <=
        MAX_VISIBLE_CATEGORIES
    ) {

      return;

    }


    const timer =
      window.setInterval(
        () => {

          setActiveStart(
            (current) =>
              (
                current + 1
              ) %
              categories.length
          );

        },
        ROTATION_INTERVAL
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, [
    isPaused,
    categories.length,
  ]);


  /*
   * =========================================================
   * VISIBLE CATEGORY WINDOW
   * =========================================================
   */

  const visibleCategories =
    useMemo(() => {

      if (
        categories.length <=
        MAX_VISIBLE_CATEGORIES
      ) {

        return categories;

      }


      return Array.from(
        {
          length:
            MAX_VISIBLE_CATEGORIES,
        },
        (_, index) =>
          categories[
            (
              activeStart +
              index
            ) %
            categories.length
          ]
      );

    }, [
      categories,
      activeStart,
    ]);


  /*
   * =========================================================
   * TRANSLATIONS
   * =========================================================
   */

  function translateCategoryName(
    name: string
  ): string {

    if (
      language === "en"
    ) {

      return name;

    }


    const translations:
      Record<string, string> = {

        Government:
          "Gouvernement",

        Education:
          "Éducation",

        Housing:
          "Logement",

        Jobs:
          "Emplois",

        "Talents & Professionals":
          "Talents & Professionnels",

        Tourism:
          "Tourisme",

        Food:
          "Restauration",

        Transport:
          "Transport",

        Community:
          "Communauté",

        Services:
          "Services",

        Discover:
          "Découvrir",

      };


    return (
      translations[name] ||
      name
    );

  }


  /*
   * =========================================================
   * CATEGORY LINK
   * =========================================================
   *
   * Every official ecosystem category has a definition,
   * therefore every card goes to:
   *
   * /category/:slug
   */

  function categoryLink(
    category: CategoryDefinition
  ): string {

    return `/category/${category.slug}`;

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <section
      className="categories"

      onMouseEnter={() =>
        setIsPaused(true)
      }

      onMouseLeave={() =>
        setIsPaused(false)
      }

      onFocus={() =>
        setIsPaused(true)
      }

      onBlur={() =>
        setIsPaused(false)
      }
    >


      <div className="categories-header">

        <span className="ecos-eyebrow">
          EVERYDAY CONNECT
        </span>


        <h2>

          {language === "fr"
            ? "Explorez Everyday Connect"
            : "Explore Everyday Connect"}

        </h2>


        <p>

          {language === "fr"
            ? "Découvrez les services, entreprises, lieux et opportunités de votre communauté."
            : "Discover services, businesses, places and opportunities around your community."}

        </p>

      </div>


      <div className="category-carousel">


        <button
          type="button"
          className="category-nav"
          aria-label="Previous categories"

          onClick={() => {

            setIsPaused(true);

            setActiveStart(
              (current) =>
                current <= 0
                  ? Math.max(
                      categories.length -
                        1,
                      0
                    )
                  : current - 1
            );

          }}
        >

          ‹

        </button>


        <div className="category-grid">

          {visibleCategories.map(
            (category) => (

              <Link
                key={category.slug}
                to={categoryLink(
                  category
                )}
                className="category-card"
                style={{
                  "--category-color":
                    category.color,
                } as React.CSSProperties}
              >

                <span className="category-icon">

                  {category.icon}

                </span>


                <span className="category-name">

                  {translateCategoryName(
                    category.name
                  )}

                </span>


                <span className="category-description">

                  {category.description}

                </span>


                <span className="category-arrow">

                  →

                </span>

              </Link>

            )
          )}

        </div>


        <button
          type="button"
          className="category-nav"
          aria-label="Next categories"

          onClick={() => {

            setIsPaused(true);

            setActiveStart(
              (current) =>
                categories.length >
                0
                  ? (
                      current + 1
                    ) %
                    categories.length
                  : 0
            );

          }}
        >

          ›

        </button>

      </div>


      <div className="category-status">

        <span
          className={
            isPaused
              ? "rotation-indicator paused"
              : "rotation-indicator"
          }
        />


        {isPaused

          ? language === "fr"
            ? "Pause"
            : "Paused"

          : language === "fr"
          ? "Explorez les catégories"
          : "Categories rotate automatically"}

      </div>

    </section>

  );

}


export default CategorySection;