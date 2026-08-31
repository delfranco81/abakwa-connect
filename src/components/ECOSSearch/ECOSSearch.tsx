import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

type SearchSuggestionType =
  | "recent"
  | "business"
  | "category"
  | "area"
  | "service";

type SearchSuggestion = {
  label: string;
  type: SearchSuggestionType;
};

const STORAGE_KEY =
  "everyday-connect-recent-searches";

const MAX_RECENT_SEARCHES = 10;

const DEFAULT_SUGGESTIONS: SearchSuggestion[] = [
  {
    label: "Car Wash",
    type: "service",
  },
  {
    label: "Cleaning Services",
    type: "category",
  },
  {
    label: "Restaurants",
    type: "category",
  },
  {
    label: "Hotels",
    type: "category",
  },
  {
    label: "Taxi",
    type: "service",
  },
  {
    label: "Bike & Moto",
    type: "service",
  },
  {
    label: "Bamenda",
    type: "area",
  },
  {
    label: "Food",
    type: "category",
  },
];

type ECOSSearchProps = {
  placeholder?: string;
};

function ECOSSearch({
  placeholder = "Search businesses, services or locations...",
}: ECOSSearchProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState("");

  const [recentSearches, setRecentSearches] =
    useState<string[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(-1);

  /*
   * Load recent searches from this browser.
   */
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setRecentSearches(
          parsed
            .filter(
              (item): item is string =>
                typeof item === "string"
            )
            .slice(0, MAX_RECENT_SEARCHES)
        );
      }
    } catch (error) {
      console.error(
        "Unable to load recent searches:",
        error
      );
    }
  }, []);

  /*
   * If the current page contains
   * ?search=..., reflect it in the search box.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(location.search);

    const urlSearch =
      params.get("search");

    if (urlSearch !== null) {
      setValue(urlSearch);
    }
  }, [
    location.pathname,
    location.search,
  ]);

  /*
   * Close suggestions when clicking
   * outside the search component.
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Save recent searches.
   */
  function saveRecentSearches(
    searches: string[]
  ) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(searches)
      );
    } catch (error) {
      console.error(
        "Unable to save recent searches:",
        error
      );
    }
  }

  /*
   * Build suggestions based on
   * what the user has typed.
   */
  const suggestions = useMemo(() => {
    const query =
      value.trim().toLowerCase();

    /*
     * Empty search:
     * show recent searches first,
     * followed by useful platform suggestions.
     */
    if (!query) {
      const recent: SearchSuggestion[] =
        recentSearches.map((search) => ({
          label: search,
          type: "recent",
        }));

      const defaults =
        DEFAULT_SUGGESTIONS.filter(
          (suggestion) =>
            !recentSearches.some(
              (recentSearch) =>
                recentSearch.toLowerCase() ===
                suggestion.label.toLowerCase()
            )
        );

      return [
        ...recent,
        ...defaults,
      ].slice(0, 8);
    }

    /*
     * Search suggestions.
     *
     * In this first shared version,
     * ECOS uses its platform vocabulary.
     *
     * Later we will replace/extend this
     * with Supabase-powered business,
     * service and location suggestions.
     */
    const matches =
      DEFAULT_SUGGESTIONS.filter(
        (suggestion) =>
          suggestion.label
            .toLowerCase()
            .includes(query)
      );

    /*
     * Also search previous searches.
     */
    const recentMatches =
      recentSearches
        .filter((search) =>
          search
            .toLowerCase()
            .includes(query)
        )
        .map((search) => ({
          label: search,
          type: "recent" as const,
        }));

    /*
     * Combine recent and platform
     * suggestions without duplicates.
     */
    const results: SearchSuggestion[] = [];

    [...recentMatches, ...matches].forEach(
      (suggestion) => {
        const exists = results.some(
          (item) =>
            item.label.toLowerCase() ===
            suggestion.label.toLowerCase()
        );

        if (!exists) {
          results.push(suggestion);
        }
      }
    );

    /*
     * If nothing matches, let the user
     * still search for their exact term.
     */
    if (results.length === 0) {
      results.push({
        label: value.trim(),
        type: "recent",
      });
    }

    return results.slice(0, 8);
  }, [value, recentSearches]);

  /*
   * Execute a search.
   */
  function performSearch(
    searchTerm: string
  ) {
    const cleaned =
      searchTerm.trim();

    if (!cleaned) {
      navigate("/businesses");

      setIsOpen(false);
      setActiveIndex(-1);

      return;
    }

    /*
     * Put newest search first.
     *
     * Case-insensitive duplicate
     * prevention keeps history clean.
     */
    const updated = [
      cleaned,
      ...recentSearches.filter(
        (item) =>
          item.toLowerCase() !==
          cleaned.toLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    saveRecentSearches(updated);

    setRecentSearches(updated);

    setValue(cleaned);

    setIsOpen(false);

    setActiveIndex(-1);

    navigate(
      `/businesses?search=${encodeURIComponent(
        cleaned
      )}`
    );
  }

  /*
   * Form submission.
   */
  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    performSearch(value);
  }

  /*
   * Keyboard navigation.
   */
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    /*
     * Enter without an open suggestion list.
     */
    if (
      event.key === "Enter" &&
      (!isOpen ||
        suggestions.length === 0)
    ) {
      event.preventDefault();

      performSearch(value);

      return;
    }

    /*
     * Open suggestions with ArrowDown.
     */
    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setIsOpen(true);

      if (suggestions.length === 0) {
        return;
      }

      setActiveIndex(
        (current) =>
          current <
          suggestions.length - 1
            ? current + 1
            : 0
      );

      return;
    }

    /*
     * ArrowUp.
     */
    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setIsOpen(true);

      if (suggestions.length === 0) {
        return;
      }

      setActiveIndex(
        (current) =>
          current > 0
            ? current - 1
            : suggestions.length - 1
      );

      return;
    }

    /*
     * Escape closes suggestions.
     */
    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      setIsOpen(false);

      setActiveIndex(-1);

      return;
    }

    /*
     * Enter selects highlighted suggestion.
     */
    if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      activeIndex <
        suggestions.length
    ) {
      event.preventDefault();

      performSearch(
        suggestions[activeIndex].label
      );
    }
  }

  /*
   * Remove one recent search.
   */
  function clearRecentSearch(
    searchToRemove: string
  ) {
    const updated =
      recentSearches.filter(
        (search) =>
          search !== searchToRemove
      );

    saveRecentSearches(updated);

    setRecentSearches(updated);

    setActiveIndex(-1);
  }

  /*
   * Remove all local recent searches.
   */
  function clearAllRecentSearches() {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Unable to clear recent searches:",
        error
      );
    }

    setRecentSearches([]);

    setActiveIndex(-1);
  }

  /*
   * Icons for suggestion types.
   */
  function getSuggestionIcon(
    type: SearchSuggestionType
  ) {
    switch (type) {
      case "recent":
        return "↻";

      case "business":
        return "▣";

      case "category":
        return "◈";

      case "area":
        return "⌖";

      case "service":
        return "✦";

      default:
        return "•";
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="search"
        style={{
          display: "flex",
          width: "100%",
          background: "white",
          borderRadius: "14px",
          padding: "7px",
          boxSizing: "border-box",
          boxShadow:
            "0 12px 35px rgba(0,0,0,0.22)",
        }}
      >
        <input
          ref={inputRef}
          type="search"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onChange={(event) => {
            setValue(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            padding: "14px 16px",
            fontSize: "16px",
            color: "#172033",
            background:
              "transparent",
          }}
        />

        <button
          type="submit"
          style={{
            border: "none",
            borderRadius: "10px",
            background: "#003366",
            color: "white",
            padding: "0 24px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {isOpen &&
        suggestions.length > 0 && (
          <div
            role="listbox"
            aria-label="Search suggestions"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "white",
              borderRadius: "14px",
              boxShadow:
                "0 16px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              zIndex: 2000,
              color: "#172033",
            }}
          >
            {!value.trim() &&
              recentSearches.length >
                0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding:
                      "12px 16px 8px",
                    borderBottom:
                      "1px solid #edf0f2",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#667085",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.6px",
                    }}
                  >
                    Recent searches
                  </span>

                  <button
                    type="button"
                    onClick={
                      clearAllRecentSearches
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      color: "#c2410c",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}

            {suggestions.map(
              (
                suggestion,
                index
              ) => {
                const isActive =
                  index ===
                  activeIndex;

                return (
                  <div
                    key={`${suggestion.type}-${suggestion.label}`}
                    role="option"
                    aria-selected={
                      isActive
                    }
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      padding:
                        "12px 14px",
                      background:
                        isActive
                          ? "#f1f7f6"
                          : "white",
                      borderBottom:
                        "1px solid #f1f3f5",
                    }}
                  >
                    <button
                      type="button"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        performSearch(
                          suggestion.label
                        )
                      }
                      style={{
                        flex: 1,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "12px",
                        border: "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        textAlign:
                          "left",
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          minWidth:
                            "30px",
                          borderRadius:
                            "50%",
                          display:
                            "grid",
                          placeItems:
                            "center",
                          background:
                            "#e8f3f1",
                          color:
                            "#00695c",
                          fontSize:
                            "15px",
                        }}
                      >
                        {getSuggestionIcon(
                          suggestion.type
                        )}
                      </span>

                      <span>
                        <span
                          style={{
                            display:
                              "block",
                            fontSize:
                              "15px",
                            fontWeight:
                              600,
                            color:
                              "#172033",
                          }}
                        >
                          {
                            suggestion.label
                          }
                        </span>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop:
                              "2px",
                            fontSize:
                              "11px",
                            color:
                              "#667085",
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {
                            suggestion.type
                          }
                        </span>
                      </span>
                    </button>

                    {suggestion.type ===
                      "recent" && (
                      <button
                        type="button"
                        aria-label={`Remove ${suggestion.label} from recent searches`}
                        onClick={() =>
                          clearRecentSearch(
                            suggestion.label
                          )
                        }
                        style={{
                          border: "none",
                          background:
                            "transparent",
                          color:
                            "#98a2b3",
                          cursor:
                            "pointer",
                          fontSize:
                            "18px",
                          padding:
                            "4px 8px",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
    </div>
  );
}

export default ECOSSearch;