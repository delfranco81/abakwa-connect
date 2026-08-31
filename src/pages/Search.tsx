import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import EcosSearchBox from "@/components/ECOS/EcosSearchBox";
import { useLanguage } from "@/context/LanguageContext";

import {
  searchEverydayConnect,
} from "@/core/search/SearchEngine";

import type {
  EcosSearchResponse,
  EcosSearchResult,
  EcosWebReference,
} from "@/core/search/SearchTypes";

const PAGE_SIZE = 8;

export default function Search() {
  const { t } = useLanguage();
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const query =
    searchParams
      .get("search")
      ?.trim() || "";

  const currentPage =
    Math.max(
      1,
      Number(
        searchParams.get("page") || "1"
      ) || 1
    );

  const [
    response,
    setResponse,
  ] =
    useState<EcosSearchResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function performSearch() {
      if (!query) {
        setResponse(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result =
          await searchEverydayConnect(
            query,
            currentPage
          );

        if (!cancelled) {
          setResponse(result);
        }
      } catch (searchError) {
        console.error(
          "Search error:",
          searchError
        );

        if (!cancelled) {
          setError(t.searchPageSearchError);

          setResponse(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [
    query,
    currentPage,
  ]);

  /*
   * =========================================================
   * LOCAL / EVERYDAY CONNECT RESULTS
   *
   * The search engine already ranks these by relevance.
   * They are intentionally kept first in the unified result
   * pool.
   * =========================================================
   */

  const localResults =
    useMemo(() => {
      const results =
        response?.results || [];

      const seen =
        new Set<string>();

      return results.filter(
        (result) => {
          const name =
            String(
              result.name || ""
            )
              .trim()
              .toLowerCase();

          const address =
            String(
              result.address || ""
            )
              .trim()
              .toLowerCase();

          const key =
            `${name}|${address}`;

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);

          return true;
        }
      );
    }, [response]);

  /*
   * =========================================================
   * WEB RESULTS
   *
   * These are treated as part of the same result pool.
   * They are not exposed to the user as "web results".
   * =========================================================
   */

  const references =
    useMemo(() => {
      return (
        response?.webReferences ||
        []
      ).filter(
        (reference) =>
          Boolean(
            reference?.title &&
            reference?.url
          )
      );
    }, [response]);

  /*
   * =========================================================
   * UNIFIED RESULT COUNTS
   * =========================================================
   */

  const totalLocalResults =
    response?.totalLocalResults || 0;

  const totalWebResults =
    response?.totalWebResults ||
    references.length;

  /*
   * The user sees one combined result pool.
   */
  const totalResults =
    totalLocalResults +
    totalWebResults;

  /*
   * Number of pages across the complete
   * combined result pool.
   */
  const totalPages =
    totalResults > 0
      ? Math.ceil(
          totalResults /
            PAGE_SIZE
        )
      : 1;

  /*
   * Absolute position where the current
   * page begins in the combined pool.
   *
   * Page 1 = 0
   * Page 2 = 8
   * Page 3 = 16
   * etc.
   */
  const globalStart =
    (currentPage - 1) *
    PAGE_SIZE;

  /*
   * =========================================================
   * COMBINE RESULTS FOR CURRENT PAGE
   *
   * Local results always come first.
   *
   * If local results do not fill all 8 spaces,
   * web results fill the remaining spaces.
   * =========================================================
   */

    globalStart;
/*
   * SearchEngine returns the local results
   * belonging to the requested page.
   *
   * We use those directly rather than requesting
   * another local page from the browser.
   */
  const currentLocalResults =
    localResults;

  /*
   * Determine where the web portion begins.
   *
   * Example:
   *
   * 3 local results
   *
   * Page 1:
   *   local 1-3
   *   web 1-5
   *
   * Page 2:
   *   web 6-13
   */
  const webStart =
    Math.max(
      0,
      globalStart -
        totalLocalResults
    );

  const localSlotsUsed =
    currentLocalResults.length;

  const remainingSlots =
    Math.max(
      0,
      PAGE_SIZE -
        localSlotsUsed
    );

  const currentWebResults =
    references.slice(
      webStart,
      webStart +
        remainingSlots
    );

  /*
   * Number of results actually visible
   * on this page.
   */
  const totalDisplayedResults =
    currentLocalResults.length +
    currentWebResults.length;

  /*
   * Absolute result number reached
   * by this page.
   */
  const displayedThrough =
    Math.min(
      globalStart +
        totalDisplayedResults,
      totalResults
    );

  /*
   * Whether another combined page exists.
   */
  const hasMoreResults =
    currentPage <
    totalPages;

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  function goToPage(
    page: number
  ) {
    const safePage =
      Math.min(
        Math.max(
          1,
          page
        ),
        totalPages
      );

    setSearchParams({
      search: query,
      page: String(
        safePage
      ),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "#f7f9fc",
        color:
          "#172033",
        paddingBottom:
          70,
      }}
    >
      <div
        style={{
          width:
            "min(1120px, calc(100% - 32px))",
          margin:
            "0 auto",
          paddingTop:
            24,
        }}
      >

        {/* =================================================
            SEARCH BAR
           ================================================= */}

        <div
          style={{
            marginBottom:
              28,
          }}
        >
          <EcosSearchBox />
        </div>

        {/* =================================================
            PAGE HEADER
           ================================================= */}

        <section
          style={{
            textAlign:
              "center",
            marginBottom:
              30,
          }}
        >
          <div
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding:
                "7px 14px",
              borderRadius:
                999,
              background:
                "#eaf2ff",
              color:
                "#155eef",
              fontSize:
                12,
              fontWeight:
                700,
              marginBottom:
                12,
            }}
          >
            Everyday Connect
          </div>

          <h1
            style={{
              margin:
                0,
              color:
                "#172033",
              fontSize:
                "clamp(34px,5vw,52px)",
              lineHeight:
                1.05,
              fontWeight:
                850,
              letterSpacing:
                "-1.5px",
            }}
          >
            {t.searchPageTitle}
          </h1>

          {query && (
            <p
              style={{
                margin:
                  "14px 0 0",
                color:
                  "#64748b",
                fontSize:
                15,
              }}
            >
              {t.searchPageResultsFor}{" "}
              <strong
                style={{
                  color:
                    "#172033",
                }}
              >
                "{query}"
              </strong>
            </p>
          )}
        </section>

        {/* =================================================
            LOADING
           ================================================= */}

        {loading && (
          <section
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                18,
              padding:
                30,
              textAlign:
                "center",
              color:
                "#64748b",
              marginBottom:
                25,
            }}
          >
            <div
              style={{
                fontSize:
                  16,
                fontWeight:
                  700,
                color:
                  "#334155",
              }}
            >
              {t.searchPageSearching}
            </div>

            <div
              style={{
                marginTop:
                  7,
                fontSize:
                  13,
              }}
            >
              {t.searchPageFindingResults}

            </div>
          </section>
        )}

        {/* =================================================
            ERROR
           ================================================= */}

        {!loading &&
          error && (
            <section
              style={{
                background:
                  "#ffffff",
                border:
                  "1px solid #fecaca",
                borderRadius:
                  18,
                padding:
                  25,
                color:
                  "#b91c1c",
                textAlign:
                  "center",
                marginBottom:
                  25,
              }}
            >
              {error}
            </section>
          )}

        {/* =================================================
            RESULTS
           ================================================= */}

        {!loading &&
          !error &&
          query &&
          response && (
            <>
              {/* =================================================
                  UNIFIED RESULT SUMMARY
                 ================================================= */}

              <section
                style={{
                  marginBottom:
                    28,
                  padding:
                    "17px 20px",
                  background:
                    "linear-gradient(135deg,#eff6ff,#f0fdfa)",
                  border:
                    "1px solid #dbeafe",
                  borderRadius:
                    15,
                }}
              >
                <div
                  style={{
                    textAlign:
                      "center",
                    color:
                      "#334155",
                    fontSize:
                      15,
                    fontWeight:
                      600,
                  }}
                >
                  {totalResults > 0 ? (
                    <>
                      {t.searchPageDisplaying}{" "}
                      <strong>
                        {displayedThrough}
                      </strong>{" "}
                      of{" "}
                      <strong>
                        {totalResults}
                      </strong>{" "}
                      {t.searchPageResultsMatching}

                    </>
                  ) : (
                    <>
                      {t.searchPageNoResultsMatching}

                    </>
                  )}
                </div>
              </section>

              {/* =================================================
                  UNIFIED RESULT GRID
                 ================================================= */}

              {totalDisplayedResults >
                0 && (
                <section
                  style={{
                    marginBottom:
                      35,
                  }}
                >
                  {/* =================================================
                      FIRST RESULT GROUP
                     ================================================= */}

                  {currentLocalResults.length >
                    0 && (
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(300px,1fr))",
                        gap:
                          18,
                      }}
                    >
                      {currentLocalResults.map(
                        (
                          result,
                          index
                        ) => (
                          <LocalResultCard
                            key={`local-${result.type}-${result.id}`}
                            result={
                              result
                            }
                            position={
                              globalStart +
                              index +
                              1
                            }
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* =================================================
                      SIMPLE SOURCE SEPARATOR
                     ================================================= */}

                  {currentLocalResults.length >
                    0 &&
                    currentWebResults.length >
                      0 && (
                      <div
                        aria-hidden="true"
                        style={{
                          height:
                            1,
                          width:
                            "100%",
                          background:
                            "#dbe2ea",
                          margin:
                            "30px 0",
                        }}
                      />
                    )}

                  {/* =================================================
                      SECOND RESULT GROUP
                     ================================================= */}

                  {currentWebResults.length >
                    0 && (
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(300px,1fr))",
                        gap:
                          18,
                      }}
                    >
                      {currentWebResults.map(
                        (
                          reference,
                          index
                        ) => (
                          <ReferenceCard
                            key={`reference-${index}-${reference.url}`}
                            reference={
                              reference
                            }
                            position={
                              globalStart +
                              currentLocalResults.length +
                              index +
                              1
                            }
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* =================================================
                      PAGINATION
                     ================================================= */}

                  {(hasMoreResults ||
                    currentPage >
                      1) && (
                    <div
                      style={{
                        marginTop:
                          30,
                        display:
                          "flex",
                        justifyContent:
                          "center",
                        alignItems:
                          "center",
                        gap:
                          12,
                        flexWrap:
                          "wrap",
                      }}
                    >
                      {currentPage >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            goToPage(
                              currentPage -
                                1
                            )
                          }
                          style={{
                            border:
                              "1px solid #cbd5e1",
                            background:
                              "#fff",
                            color:
                              "#334155",
                            borderRadius:
                              10,
                            padding:
                              "10px 16px",
                            cursor:
                              "pointer",
                            fontWeight:
                              700,
                          }}
                        >
                          ←
                        </button>
                      )}

                      <div
                        style={{
                          color:
                            "#64748b",
                          fontSize:
                            13,
                          fontWeight:
                            600,
                        }}
                      >
                        {t.searchPagePage}{" "}
                        {currentPage}{" "}
                        of{" "}
                        {totalPages}
                      </div>

                      {hasMoreResults && (
                        <button
                          type="button"
                          onClick={() =>
                            goToPage(
                              currentPage +
                                1
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "#003366",
                            color:
                              "#fff",
                            borderRadius:
                              10,
                            padding:
                              "10px 18px",
                            cursor:
                              "pointer",
                            fontWeight:
                              700,
                          }}
                        >
                          {t.searchPageNext} →
                        </button>
                      )}
                    </div>
                  )}

                  {/* =================================================
                      END OF RESULTS
                     ================================================= */}

                  {!hasMoreResults &&
                    currentPage >
                      1 && (
                    <div
                      style={{
                        marginTop:
                          20,
                        textAlign:
                          "center",
                        color:
                          "#64748b",
                        fontSize:
                          13,
                      }}
                    >
                      {t.searchPageEndOfResults}
                    </div>
                  )}
                </section>
              )}

              {/* =================================================
                  NOTHING FOUND
                 ================================================= */}

              {totalDisplayedResults ===
                0 && (
                <section
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      18,
                    padding:
                      40,
                    textAlign:
                      "center",
                    color:
                      "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        35,
                      marginBottom:
                        10,
                    }}
                  >
                    {"\uD83D\uDD0E"}
                  </div>

                  <div
                    style={{
                      color:
                        "#334155",
                      fontSize:
                        17,
                      fontWeight:
                        700,
                    }}
                  >
                    {t.searchPageNothingFound}
                  </div>

                  <div
                    style={{
                      marginTop:
                        7,
                      fontSize:
                        14,
                    }}
                  >
                    {t.searchPageTryDifferent}




                  </div>
                </section>
              )}
            </>
          )}
      </div>
    </main>
  );
}

/*
 * =========================================================
 * LOCAL RESULT CARD
 * =========================================================
 */

function LocalResultCard({
  result,
  position,
}: {
  result: EcosSearchResult;
  position: number;
}) {
  return (
    <a
      href={result.url}
      style={{
        display:
          "block",
        textDecoration:
          "none",
        color:
          "inherit",
        background:
          "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          18,
        padding:
          20,
        boxShadow:
          "0 4px 16px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display:
            "flex",
          gap:
            15,
          alignItems:
            "flex-start",
        }}
      >
        <div
          style={{
            position:
              "relative",
            width:
              62,
            height:
              62,
            minWidth:
              62,
            borderRadius:
              14,
            overflow:
              "hidden",
            background:
              "#eef2f7",
            display:
              "grid",
            placeItems:
              "center",
          }}
        >
          {result.image ? (
            <img
              src={
                result.image
              }
              alt=""
              style={{
                width:
                  "100%",
                height:
                  "100%",
                objectFit:
                  "cover",
              }}
            />
          ) : (
            <span
              style={{
                fontSize:
                  27,
              }}
            >
              {result.type ===
              "place"
                ? "\uD83D\uDCCD"
                : "\uD83C\uDFE2"}
            </span>
          )}

          <span
            style={{
              position:
                "absolute",
              top:
                4,
              left:
                4,
              minWidth:
                21,
              height:
                21,
              padding:
                "0 5px",
              borderRadius:
                999,
              background:
                "#003366",
              color:
                "#fff",
              display:
                "grid",
              placeItems:
                "center",
              fontSize:
                10,
              fontWeight:
                800,
            }}
          >
            {position}
          </span>
        </div>

        <div
          style={{
            minWidth:
              0,
            flex:
              1,
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                8,
              flexWrap:
                "wrap",
            }}
          >
            <h3
              style={{
                margin:
                  0,
                color:
                  "#172033",
                fontSize:
                  18,
                lineHeight:
                  1.3,
                fontWeight:
                  800,
              }}
            >
              {result.name}
            </h3>

            {result.verified && (
              <span
                style={{
                  background:
                    "#dcfce7",
                  color:
                    "#166534",
                  padding:
                    "3px 7px",
                  borderRadius:
                    20,
                  fontSize:
                    10,
                  fontWeight:
                    800,
                }}
              >
                {"\u2713 VERIFIED"}
              </span>
            )}
          </div>

          {result.category && (
            <div
              style={{
                marginTop:
                  6,
                color:
                  "#2563eb",
                fontSize:
                  13,
                fontWeight:
                  700,
              }}
            >
              {result.category}
            </div>
          )}
        </div>
      </div>

      {result.description && (
        <p
          style={{
            margin:
              "15px 0 0",
            color:
              "#64748b",
            fontSize:
              14,
            lineHeight:
              1.55,
          }}
        >
          {cleanText(
            result.description
          )}
        </p>
      )}

      {(result.address ||
        result.area ||
        result.city) && (
        <div
          style={{
            marginTop:
              14,
            paddingTop:
              12,
            borderTop:
              "1px solid #f1f5f9",
            color:
              "#475569",
            fontSize:
              13,
          }}
        >
          {"\uD83D\uDCCD"}{" "}
          {[
            result.address,
            result.area,
            result.city,
          ]
            .filter(Boolean)
            .join(", ")}
        </div>
      )}

      {result.phone && (
        <div
          style={{
            marginTop:
              8,
            color:
              "#475569",
            fontSize:
              13,
          }}
        >
          {"\u260E\uFE0F"}{" "} {result.phone}
        </div>
      )}

      {result.rating &&
        result.rating > 0 && (
          <div
            style={{
              marginTop:
                8,
              color:
                "#b45309",
              fontSize:
                13,
              fontWeight:
                700,
            }}
          >
            {"\u2B50"}
            {Number(
              result.rating
            ).toFixed(1)}
          </div>
        )}
    </a>
  );
}

/*
 * =========================================================
 * WEB / GENERAL RESULT CARD
 * =========================================================
 */

function ReferenceCard({
  reference,
  position,
}: {
  reference: EcosWebReference;
  position: number;
}) {
  const { t } = useLanguage();
  const title =
    cleanText(
      reference.title
    );

  const snippet =
    cleanText(
      reference.snippet
    );

  let domain = "";

  try {
    domain =
      new URL(
        reference.url
      ).hostname.replace(
        /^www\./,
        ""
      );
  } catch {
    domain = "";
  }

  return (
    <a
      href={
        reference.url
      }
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:
          "block",
        textDecoration:
          "none",
        color:
          "inherit",
        background:
          "#ffffff",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          18,
        padding:
          20,
        boxShadow:
          "0 4px 16px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display:
            "flex",
          gap:
            13,
          alignItems:
            "flex-start",
        }}
      >
        <div
          style={{
            position:
              "relative",
            width:
              44,
            height:
              44,
            minWidth:
              44,
            borderRadius:
              12,
            background:
              "#eff6ff",
            display:
              "grid",
            placeItems:
              "center",
            fontSize:
              20,
          }}
        >
          {"\uD83C\uDF0D"}

          <span
            style={{
              position:
                "absolute",
              top:
                -4,
              left:
                -4,
              minWidth:
                19,
              height:
                19,
              padding:
                "0 4px",
              borderRadius:
                999,
              background:
                "#003366",
              color:
                "#fff",
              display:
                "grid",
              placeItems:
                "center",
              fontSize:
                9,
              fontWeight:
                800,
            }}
          >
            {position}
          </span>
        </div>

        <div
          style={{
            minWidth:
              0,
            flex:
              1,
          }}
        >
          {domain && (
            <div
              style={{
                color:
                  "#64748b",
                fontSize:
                  11,
                fontWeight:
                  700,
                marginBottom:
                  5,
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.4px",
              }}
            >
              {domain}
            </div>
          )}

          <h3
            style={{
              margin:
                0,
              color:
                "#172033",
              fontSize:
                17,
              lineHeight:
                1.35,
              fontWeight:
                800,
            }}
          >
            {title}
          </h3>
        </div>
      </div>

      {snippet && (
        <p
          style={{
            margin:
              "13px 0 0",
            color:
              "#64748b",
            fontSize:
              14,
            lineHeight:
              1.55,
          }}
        >
          {snippet}
        </p>
      )}

      <div
        style={{
          marginTop:
            14,
          color:
            "#2563eb",
          fontSize:
            13,
          fontWeight:
            700,
        }}
      >
        {t.searchPageViewSource} →
      </div>
    </a>
  );
}

/*
 * =========================================================
 * CLEAN TEXT
 * =========================================================
 */

function cleanText(
  value: unknown
): string {
  return String(
    value || ""
  )
    .replace(
      /#{1,6}\s*/g,
      ""
    )
    .replace(
      /\*\*/g,
      ""
    )
    .replace(
      /\[([^\]]+)\]\([^)]+\)/g,
      "$1"
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}











