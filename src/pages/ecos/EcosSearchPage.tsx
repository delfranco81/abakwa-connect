import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {  useSearchParams,
} from "react-router-dom";

import EcosSearchBox from "../../components/ECOS/EcosSearchBox";
import { useLanguage } from "../../context/LanguageContext";

import {
  EcosKernel,
} from "../../core/ECOS Kernel";

import type {
  EcosSearchResponse,
  EcosSearchResult,
  EcosWebReference,
} from "../../core/search/SearchTypes";

function SearchResultCard({
  result,
}: {
  result: EcosSearchResult;
}) {
  const { t } = useLanguage();
  return (
    <a
      href={result.url}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 15,
          alignItems: "flex-start",
        }}
      >
        {result.image ? (
          <img
            src={result.image}
            alt={result.name}
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 10,
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 10,
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {result.type === "place"
              ? "\uD83D\uDCCD"
              : "\uD83C\uDFE2"}
          </div>
        )}

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                color: "#111827",
                lineHeight: 1.35,
              }}
            >
              {result.name}
            </h3>

            {result.verified && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "3px 7px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {t.ecosSearchVerified}
              </span>
            )}
          </div>

          {result.category && (
            <p
              style={{
                margin: "5px 0",
                color: "#2563eb",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {result.category}
            </p>
          )}

          {result.description && (
            <p
              style={{
                margin: "7px 0",
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {result.description}
            </p>
          )}

          {(result.area ||
            result.address ||
            result.city) && (
            <p
              style={{
                margin: "7px 0 0",
                color: "#475569",
                fontSize: 13,
              }}
            >
              {"\uD83D\uDCCD"}{" "}
              {[
                result.area,
                result.address,
                result.city,
              ]
                .filter(Boolean)
                .join(" \u2022 ")}
            </p>
          )}

          {result.phone && (
            <p
              style={{
                margin: "5px 0 0",
                color: "#475569",
                fontSize: 13,
              }}
            >
              {"\u260E\uFE0F"}{" "} {result.phone}
            </p>
          )}

          {result.rating &&
            result.rating > 0 && (
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#b45309",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ⭐ {Number(
                  result.rating
                ).toFixed(1)}
              </p>
            )}
        </div>
      </div>
    </a>
  );
}

function SearchWebCard({
  reference,
}: {
  reference: EcosWebReference;
}) {
  const { t } = useLanguage();
  return (
    <a
      href={reference.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 15,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            minWidth: 80,
            borderRadius: 10,
            background:
              "linear-gradient(135deg,#eff6ff,#dbeafe)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {"\uD83D\uDD0E"}
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              color: "#111827",
              lineHeight: 1.35,
            }}
          >
            {reference.title}
          </h3>

          {reference.snippet && (
            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              {reference.snippet}
            </p>
          )}

          <p
            style={{
              margin: "10px 0 0",
              color: "#2563eb",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {t.ecosSearchViewResult} →
          </p>
        </div>
      </div>
    </a>
  );
}

export default function EcosSearchPage() {

  const { t } = useLanguage();

const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const query =
    searchParams.get("search") ||
    "";

  const [data, setData] =
    useState<EcosSearchResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      return;
    }

    runSearch(query);
  }, [query]);

  async function runSearch(
    value: string
  ) {
    setLoading(true);
    setError("");

    // {t.ecosSearchClear} old results immediately.
    setData(null);

    try {
      const kernelResponse =
        await EcosKernel.process({
          query: value,
        });

      const response =
        kernelResponse.response;

      console.log(
        "ECOS PAGE ACTION:",
        response.action,
        response
      );

      /*
       * =====================================================
       * APPLICATION ACTIONS
       * =====================================================
       *
       * These are commands, not searches.
       */
      /*
       * ECOS SEARCH
       *
       * Search requests stay on the search page.
       * Actions detected by the search engine are not
       * automatically redirected from here.
       */
      setData(response);
    } catch (searchError: any) {
      console.error(
        "Search failed:",
        searchError
      );

      setError(
        searchError?.message ||
          "The search could not be completed."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setSearchParams({});
    setData(null);
    setError("");
  }

  const unifiedResults = useMemo(() => {
    if (!data) {
      return [];
    }

    const localItems =
      data.results.map(
        (result) => ({
          kind: "everyday" as const,
          result,
        })
      );

    const webItems =
      data.webReferences.map(
        (reference) => ({
          kind: "web" as const,
          reference,
        })
      );

    return [
      ...localItems,
      ...webItems,
    ];
  }, [data]);

  const resultCount =
    unifiedResults.length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding:
          "30px 20px 80px",
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
            marginBottom: 28,
          }}
        >
          <EcosSearchBox
            initialValue={query}
          />
        </div>

        {!query && (
          <div
            style={{
              marginTop: 20,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin:
                  "0 0 10px",
                color: "#0f172a",
                fontSize:
                  "clamp(28px,5vw,42px)",
              }}
            >
              {t.ecosSearchFindWhatYouNeed}
            </h1>

            <p
              style={{
                color: "#64748b",
                maxWidth: 650,
                margin:
                  "0 auto",
                lineHeight: 1.6,
              }}
            >
              Search for businesses,
              services, places,
              people, information
              and more.
            </p>

            <div
              style={{
                marginTop: 30,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(210px,1fr))",
                gap: 15,
              }}
            >
              {[
                [
                  "\uD83D\uDCCD",
                  "What's around me?",
                  "Find businesses, places and services.",
                ],
                [
                  "\uD83D\uDE4B\u200D\u2642\uFE0F",
                  "Who can help me?",
                  "Find professionals and service providers.",
                ],
                [
                  "\uD83D\uDED2",
                  "What can I get?",
                  "Discover products, services and businesses.",
                ],
                [
                  "\uD83D\uDE97\uFE0F",
                  "Where do I go?",
                  "Find offices, schools and useful places.",
                ],
              ].map(
                ([icon, title, text]) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      const examples: Record<
                        string,
                        string
                      > = {
                        "What's around me?":
                          "businesses in Bamenda",

                        "Who can help me?":
                          "carpenter in Bamenda",

                        "What can I get?":
                          "restaurants in Bamenda",

                        "Where do I go?":
                          "government offices in Bamenda",
                      };

                      setSearchParams({
                        search:
                          examples[
                            title
                          ],
                      });
                    }}
                    style={{
                      textAlign:
                        "left",
                      border:
                        "1px solid #e5e7eb",
                      background:
                        "#fff",
                      borderRadius:
                        14,
                      padding: 18,
                      cursor:
                        "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        marginBottom: 8,
                      }}
                    >
                      {icon}
                    </div>

                    <strong
                      style={{
                        display:
                          "block",
                        color:
                          "#0f172a",
                      }}
                    >
                      {title}
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        marginTop: 6,
                        color:
                          "#64748b",
                        fontSize: 13,
                        lineHeight:
                          1.5,
                      }}
                    >
                      {text}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {loading && (
          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 35,
              marginTop: 25,
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize: 32,
              }}
            >
              {"\uD83D\uDD0E"}
            </div>

            <h3>
              {t.ecosSearchFindingUsefulResults}
            </h3>

            <p
              style={{
                color:
                  "#64748b",
              }}
            >
              {t.ecosSearchMatchingInformation}
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 25,
              background:
                "#fee2e2",
              color: "#991b1b",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <strong>
              {t.ecosSearchUnavailable}
            </strong>

            <p>{error}</p>
          </div>
        )}

        {!loading &&
          data && (
            <>
              <section
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap: 15,
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        margin: 0,
                        color:
                          "#0f172a",
                        fontSize: 28,
                      }}
                    >
                      {t.ecosSearchResultsFound}
                    </h1>

                    {resultCount >
                      0 && (
                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          color:
                            "#64748b",
                          fontSize: 14,
                        }}
                      >
                        {resultCount}{" "}
                        {resultCount ===
                        1
                          ? t.ecosSearchResult
                          : t.ecosSearchResults}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      clearSearch
                    }
                    style={{
                      border:
                        "1px solid #cbd5e1",
                      background:
                        "#fff",
                      borderRadius:
                        8,
                      padding:
                        "8px 12px",
                      cursor:
                        "pointer",
                    }}
                  >
                    {t.ecosSearchClear}
                  </button>
                </div>
              </section>

              {data.answer && (
                <section
                  style={{
                    background:
                      "#fff",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      14,
                    padding: 20,
                    marginBottom:
                      20,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color:
                        "#1e293b",
                      lineHeight:
                        1.6,
                    }}
                  >
                    {data.answer}
                  </p>
                </section>
              )}

              {resultCount > 0 && (
                <section>
                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit,minmax(300px,1fr))",
                      gap: 15,
                    }}
                  >
                    {unifiedResults.map(
                      (
                        item,
                        index
                      ) => {
                        if (
                          item.kind ===
                          "everyday"
                        ) {
                          return (
                            <SearchResultCard
                              key={`result-${item.result.type}-${item.result.id}`}
                              result={
                                item.result
                              }
                            />
                          );
                        }

                        return (
                          <SearchWebCard
                            key={`result-web-${item.reference.url}-${index}`}
                            reference={
                              item.reference
                            }
                          />
                        );
                      }
                    )}
                  </div>
                </section>
              )}

              {resultCount === 0 && (
                <section
                  style={{
                    marginTop: 25,
                    background:
                      "#fff",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      14,
                    padding: 35,
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 38,
                    }}
                  >
                    {"\uD83D\uDD0E"}
                  </div>

                  <h3>
                    {t.ecosSearchNoResults}
                  </h3>

                  <p
                    style={{
                      color:
                        "#64748b",
                      lineHeight:
                        1.6,
                    }}
                  >
                    Try searching
                    with different
                    words or a more
                    specific location.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearSearch
                    }
                    style={{
                      marginTop: 10,
                      border:
                        "none",
                      background:
                        "#003366",
                      color:
                        "#fff",
                      borderRadius:
                        8,
                      padding:
                        "10px 16px",
                      cursor:
                        "pointer",
                      fontWeight:
                        600,
                    }}
                  >
                    {t.ecosSearchNewSearch}
                  </button>
                </section>
              )}
            </>
          )}
      </div>
    </main>
  );
}



























