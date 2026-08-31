import type {
  EcosSearchResult,
} from "./SearchTypes";

/*
 * =========================================================
 * ECOS SEARCH INDEX
 * =========================================================
 *
 * SearchIndex provides the internal in-memory representation
 * of records that ECOS can search.
 *
 * The index does NOT replace Supabase.
 *
 * Supabase remains the source of truth.
 * The index is a search-layer structure that allows ECOS
 * to work with a normalized collection of results.
 */

/*
 * =========================================================
 * INDEX ENTRY
 * =========================================================
 */

export type EcosSearchIndexEntry = {
  id: string;

  type: EcosSearchResult["type"];

  name: string;

  searchableText: string;

  result: EcosSearchResult;
};

/*
 * =========================================================
 * SEARCH INDEX
 * =========================================================
 */

export class EcosSearchIndex {
  private entries: EcosSearchIndexEntry[] = [];

  /*
   * -------------------------------------------------------
   * CLEAR
   * -------------------------------------------------------
   */

  clear(): void {
    this.entries = [];
  }

  /*
   * -------------------------------------------------------
   * SIZE
   * -------------------------------------------------------
   */

  get size(): number {
    return this.entries.length;
  }

  /*
   * -------------------------------------------------------
   * ADD RESULT
   * -------------------------------------------------------
   */

  add(result: EcosSearchResult): void {
    const entry =
      this.createEntry(result);

    /*
     * Replace an existing record with the same
     * type + ID.
     */

    const existingIndex =
      this.entries.findIndex(
        (item) =>
          item.id === entry.id &&
          item.type === entry.type
      );

    if (existingIndex >= 0) {
      this.entries[existingIndex] =
        entry;

      return;
    }

    this.entries.push(entry);
  }

  /*
   * -------------------------------------------------------
   * ADD MANY
   * -------------------------------------------------------
   */

  addMany(
    results: EcosSearchResult[]
  ): void {
    for (const result of results) {
      this.add(result);
    }
  }

  /*
   * -------------------------------------------------------
   * REMOVE
   * -------------------------------------------------------
   */

  remove(
    id: string,
    type?: EcosSearchResult["type"]
  ): void {
    this.entries =
      this.entries.filter(
        (entry) => {
          if (entry.id !== id) {
            return true;
          }

          if (
            type &&
            entry.type !== type
          ) {
            return true;
          }

          return false;
        }
      );
  }

  /*
   * -------------------------------------------------------
   * GET ALL
   * -------------------------------------------------------
   */

  getAll(): EcosSearchIndexEntry[] {
    return [...this.entries];
  }

  /*
   * -------------------------------------------------------
   * GET RESULTS
   * -------------------------------------------------------
   */

  getResults(): EcosSearchResult[] {
    return this.entries.map(
      (entry) => entry.result
    );
  }

  /*
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  findById(
    id: string,
    type?: EcosSearchResult["type"]
  ): EcosSearchIndexEntry | undefined {
    return this.entries.find(
      (entry) =>
        entry.id === id &&
        (!type ||
          entry.type === type)
    );
  }

  /*
   * -------------------------------------------------------
   * SEARCH INDEX
   * -------------------------------------------------------
   *
   * This is intentionally simple at this stage.
   *
   * Ranking remains the responsibility of
   * SearchRanking.ts / the ECOS search pipeline.
   */

  search(
    query: string
  ): EcosSearchResult[] {
    const normalizedQuery =
      normalizeIndexText(query);

    if (!normalizedQuery) {
      return [];
    }

    const words =
      normalizedQuery
        .split(/\s+/)
        .filter(
          (word) =>
            word.length >= 2
        );

    if (words.length === 0) {
      return [];
    }

    return this.entries
      .filter(
        (entry) =>
          words.every(
            (word) =>
              entry.searchableText.includes(
                word
              )
          )
      )
      .map(
        (entry) =>
          entry.result
      );
  }

  /*
   * -------------------------------------------------------
   * CREATE INDEX ENTRY
   * -------------------------------------------------------
   */

  private createEntry(
    result: EcosSearchResult
  ): EcosSearchIndexEntry {
    const searchableText =
      normalizeIndexText(
        [
          result.name,
          result.category,
          result.description,
          result.address,
          result.area,
          result.city,
          result.phone,
          result.website,
        ]
          .filter(Boolean)
          .join(" ")
      );

    return {
      id: result.id,

      type: result.type,

      name: result.name,

      searchableText,

      result,
    };
  }
}

/*
 * =========================================================
 * TEXT NORMALIZATION
 * =========================================================
 */

function normalizeIndexText(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /\s+/g,
      " "
    );
}

/*
 * =========================================================
 * FACTORY
 * =========================================================
 */

export function createEcosSearchIndex(
  results: EcosSearchResult[] = []
): EcosSearchIndex {
  const index =
    new EcosSearchIndex();

  index.addMany(results);

  return index;
}
