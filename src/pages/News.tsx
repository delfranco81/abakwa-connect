import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

import "./News.css";

type NewsArticle = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image: string | null;
  author: string | null;
  category: string | null;
  published: boolean | null;
  created_at: string | null;
  source_name: string | null;
  source_url: string | null;
  source_published_at: string | null;
  scouted_at: string | null;
};

const CATEGORY_KEYS = [
  {
    value: "All",
    key: "newsCategoryAll",
  },
  {
    value: "Local & Community",
    key: "newsCategoryLocalCommunity",
  },
  {
    value: "Cameroon",
    key: "newsCategoryCameroon",
  },
  {
    value: "Africa",
    key: "newsCategoryAfrica",
  },
  {
    value: "World",
    key: "newsCategoryWorld",
  },
  {
    value: "Politics",
    key: "newsCategoryPolitics",
  },
  {
    value: "Business & Finance",
    key: "newsCategoryBusinessFinance",
  },
  {
    value: "Sports",
    key: "newsCategorySports",
  },
  {
    value: "Technology",
    key: "newsCategoryTechnology",
  },
  {
    value: "Education",
    key: "newsCategoryEducation",
  },
  {
    value: "Jobs & Opportunities",
    key: "newsCategoryJobs",
  },
  {
    value: "Transport",
    key: "newsCategoryTransport",
  },
  {
    value: "Health",
    key: "newsCategoryHealth",
  },
  {
    value: "Other",
    key: "newsCategoryOther",
  },
] as const;

function formatDate(
  value: string | null,
  language: "en" | "fr"
) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getCategoryLabel(
  category: string | null,
  translations: Record<string, string>
) {
  const item = CATEGORY_KEYS.find(
    (entry) => entry.value === category
  );

  if (!item) {
    return category || translations.newsCategoryOther;
  }

  return (
    translations[
      item.key as keyof typeof translations
    ] || category || translations.newsCategoryOther
  );
}

export default function News() {
  const { language, t } = useLanguage();

  const [articles, setArticles] =
    useState<NewsArticle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [selectedArticle, setSelectedArticle] =
    useState<NewsArticle | null>(null);

  async function loadNews() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } =
        await supabase
          .from("news")
          .select(
            [
              "id",
              "title",
              "summary",
              "content",
              "image",
              "author",
              "category",
              "published",
              "created_at",
              "source_name",
              "source_url",
              "source_published_at",
              "scouted_at",
            ].join(",")
          )
          .eq("published", true)
          .order("scouted_at", {
            ascending: false,
            nullsFirst: false,
          })
          .order("created_at", {
            ascending: false,
          });

      if (queryError) {
        throw queryError;
      }

      setArticles(
        Array.isArray(data)
          ? (data as unknown as NewsArticle[])
          : []
      );
    } catch (loadError) {
      console.error(
        "News loading error:",
        loadError
      );

      setError(t.newsLoadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews();
  }, []);

  const filteredArticles = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        category === "All" ||
        article.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        article.title,
        article.summary,
        article.content,
        article.source_name,
        article.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearch
      );
    });
  }, [articles, category, search]);

  const categoryButtons = CATEGORY_KEYS;

  return (
    <main className="news-page">
      <section className="news-hero">
        <div className="news-hero-inner">
          <div className="news-eyebrow">
            {t.newsAiSummary}
          </div>

          <h1>{t.newsPageTitle}</h1>

          <p>
            {t.newsPageSubtitle}
          </p>

          <div className="news-search-wrap">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                t.newsSearchPlaceholder
              }
              aria-label={
                t.newsSearchPlaceholder
              }
            />
          </div>
        </div>
      </section>

      <section className="news-content">
        <div className="news-section-heading">
          <div>
            <span className="news-section-label">
              {t.newsLatest}
            </span>

            <h2>{t.newsPageTitle}</h2>
          </div>

          {!loading && (
            <span className="news-count">
              {filteredArticles.length}
            </span>
          )}
        </div>

        <div className="news-category-row">
          {categoryButtons.map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                category === item.value
                  ? "news-category active"
                  : "news-category"
              }
              onClick={() =>
                setCategory(item.value)
              }
            >
              {t[
                item.key as keyof typeof t
              ] || item.value}
            </button>
          ))}
        </div>

        {loading && (
          <div className="news-state">
            <div className="news-loader" />
            <p>{t.newsLoading}</p>
          </div>
        )}

        {!loading && error && (
          <div className="news-state news-error">
            <h3>{t.newsLoadError}</h3>
            <button
              type="button"
              onClick={() => void loadNews()}
            >
              {t.newsTryAgain}
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          filteredArticles.length === 0 && (
            <div className="news-state">
              <div className="news-empty-mark">
                NEWS
              </div>

              <h3>{t.newsNoArticles}</h3>
              <p>
                {search || category !== "All"
                  ? t.newsNoMatchingArticles
                  : t.newsNoArticlesDescription}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredArticles.length > 0 && (
            <div className="news-grid">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="news-card"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setSelectedArticle(article)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      setSelectedArticle(article);
                    }
                  }}
                >
                  <div className="news-card-top">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <div className="news-card-image-placeholder">
                        <span>
                          {getCategoryLabel(
                            article.category,
                            t
                          )}
                        </span>
                      </div>
                    )}

                    <div className="news-card-overlay">
                      <span>
                        {getCategoryLabel(
                          article.category,
                          t
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="news-card-body">
                    <div className="news-card-meta">
                      <span>
                        {article.source_name ||
                          t.newsSource}
                      </span>

                      <span>
                        {formatDate(
                          article.source_published_at ||
                            article.created_at,
                          language
                        )}
                      </span>
                    </div>

                    <h3>{article.title}</h3>

                    <p>
                      {article.summary ||
                        t.newsNoSummary}
                    </p>

                    <div className="news-card-footer">
                      <span className="news-ai-badge">
                        {t.newsAiSummary}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedArticle(
                            article
                          )
                        }
                      >
                        {t.newsReadMore}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>

      {selectedArticle && (
        <div
          className="news-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            setSelectedArticle(null)
          }
        >
          <article
            className="news-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="news-modal-close"
              onClick={() =>
                setSelectedArticle(null)
              }
              aria-label={t.newsClose}
            >
              X
            </button>

            {selectedArticle.image && (
              <img
                className="news-modal-image"
                src={selectedArticle.image}
                alt=""
              />
            )}

            <div className="news-modal-content">
              <div className="news-modal-category">
                {getCategoryLabel(
                  selectedArticle.category,
                  t
                )}
              </div>

              <h2 id="news-modal-title">
                {selectedArticle.title}
              </h2>

              <div className="news-modal-meta">
                <span>
                  {selectedArticle.source_name ||
                    t.newsSource}
                </span>

                <span>
                  {formatDate(
                    selectedArticle.source_published_at ||
                      selectedArticle.created_at,
                    language
                  )}
                </span>
              </div>

              <div className="news-modal-summary">
                <strong>
                  {t.newsAiSummary}
                </strong>

                <p>
                  {selectedArticle.summary ||
                    t.newsNoSummary}
                </p>
              </div>

              <div className="news-modal-content-text">
                {(selectedArticle.content ||
                  t.newsNoContent)
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={`${selectedArticle.id}-${index}`}>
                      {paragraph}
                    </p>
                  ))}
              </div>

              <div className="news-source-box">
                <div>
                  <span>
                    {t.newsSource}
                  </span>

                  <strong>
                    {selectedArticle.source_name ||
                      t.newsOriginalSource}
                  </strong>
                </div>

                {selectedArticle.source_url && (
                  <a
                    href={
                      selectedArticle.source_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.newsOriginalSource}
                  </a>
                )}
              </div>

              <div className="news-modal-date">
                {t.newsScouted}:{" "}
                {formatDate(
                  selectedArticle.scouted_at,
                  language
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}