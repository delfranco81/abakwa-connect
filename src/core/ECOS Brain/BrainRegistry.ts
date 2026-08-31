import { Logger } from "../logging";

import type {
  EcosKnowledgeDomain,
  EcosKnowledgeEntry,
  EcosBrainState,
} from "./BrainTypes";

export class BrainRegistry {
  private static entries =
    new Map<string, EcosKnowledgeEntry>();

  private static state: EcosBrainState = {
    status: "offline",
    initializedAt: null,
    entries: 0,
    lastError: null,
  };

  static register(
    entry: EcosKnowledgeEntry
  ): void {
    if (this.entries.has(entry.id)) {
      Logger.warn(
        `ECOS knowledge already registered: ${entry.id}`
      );

      return;
    }

    this.entries.set(
      entry.id,
      entry
    );

    this.state.entries =
      this.entries.size;

    Logger.info(
      `ECOS knowledge registered: ${entry.name}`
    );
  }

  static get(
    id: string
  ): EcosKnowledgeEntry | undefined {
    return this.entries.get(id);
  }

  static getAll(): EcosKnowledgeEntry[] {
    return Array.from(
      this.entries.values()
    );
  }

  static getByDomain(
    domain: EcosKnowledgeDomain
  ): EcosKnowledgeEntry[] {
    return this.getAll().filter(
      (entry) =>
        entry.domain === domain &&
        entry.enabled
    );
  }

  static findByKeyword(
    keyword: string
  ): EcosKnowledgeEntry[] {
    const normalized =
      keyword
        .toLowerCase()
        .trim();

    if (!normalized) {
      return [];
    }

    return this.getAll().filter(
      (entry) =>
        entry.enabled &&
        (
          entry.name
            .toLowerCase()
            .includes(normalized) ||
          entry.description
            .toLowerCase()
            .includes(normalized) ||
          entry.keywords.some(
            (item) =>
              item
                .toLowerCase()
                .includes(normalized)
          )
        )
    );
  }

  static initialize(): void {
    if (
      this.state.status ===
      "ready"
    ) {
      return;
    }

    this.state.status =
      "starting";

    this.state.lastError =
      null;

    try {
      Logger.info(
        "Initializing ECOS Brain..."
      );

      this.state.status =
        "ready";

      this.state.initializedAt =
        new Date().toISOString();

      this.state.entries =
        this.entries.size;

      Logger.success(
        "ECOS Brain Ready"
      );
    } catch (error) {
      this.state.status =
        "error";

      this.state.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      Logger.error(
        `ECOS Brain initialization failed: ${this.state.lastError}`
      );

      throw error;
    }
  }

  static getState(): EcosBrainState {
    return {
      ...this.state,
      entries:
        this.entries.size,
    };
  }

  static isReady(): boolean {
    return (
      this.state.status ===
      "ready"
    );
  }

  static clear(): void {
    this.entries.clear();

    this.state.entries = 0;
    this.state.status =
      "offline";
    this.state.initializedAt =
      null;
    this.state.lastError =
      null;
  }
}
