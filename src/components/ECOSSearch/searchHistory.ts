const STORAGE_KEY = "ecos-search-history";
const MAX_HISTORY_ITEMS = 12;

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function getSearchHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
      .map(normalize)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function saveSearch(value: string): string[] {
  const normalized = normalize(value);

  if (!normalized) {
    return getSearchHistory();
  }

  const current = getSearchHistory();

  const withoutDuplicate = current.filter(
    (item) => item.toLowerCase() !== normalized.toLowerCase()
  );

  const updated = [normalized, ...withoutDuplicate].slice(
    0,
    MAX_HISTORY_ITEMS
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch {
    // Ignore localStorage failures.
  }

  return updated;
}

export function removeSearch(value: string): string[] {
  const normalized = normalize(value);

  const updated = getSearchHistory().filter(
    (item) =>
      item.toLowerCase() !== normalized.toLowerCase()
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch {
    // Ignore localStorage failures.
  }

  return updated;
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage failures.
  }
}