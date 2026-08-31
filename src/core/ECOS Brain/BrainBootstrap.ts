import { Logger } from "../logging";
import { BrainRegistry } from "./BrainRegistry";
import { platformKnowledge } from "./Platform Knowledge/PlatformKnowledge";
import { businessKnowledge } from "./Business Knowledge/BusinessKnowledge";

export class BrainBootstrap {
  private static started = false;

  static initialize(): void {
    if (this.started) {
      Logger.warn("ECOS Brain already initialized.");
      return;
    }

    Logger.info("Loading ECOS Brain knowledge...");

    try {
      /*
       * -------------------------------------------------------
       * PLATFORM KNOWLEDGE
       * -------------------------------------------------------
       */

      for (const entry of platformKnowledge) {
        BrainRegistry.register(entry);
      }

      /*
       * -------------------------------------------------------
       * BUSINESS KNOWLEDGE
       * -------------------------------------------------------
       */

      for (const entry of businessKnowledge) {
        BrainRegistry.register(entry);
      }

      /*
       * -------------------------------------------------------
       * INITIALIZE REGISTRY
       * -------------------------------------------------------
       */

      BrainRegistry.initialize();

      this.started = true;

      Logger.success(
        `ECOS Brain initialized with ${BrainRegistry.getState().entries} knowledge entries.`
      );
    } catch (error) {
      Logger.error(
        `ECOS Brain bootstrap failed: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );

      throw error;
    }
  }

  static isInitialized(): boolean {
    return this.started;
  }

  static reset(): void {
    BrainRegistry.clear();
    this.started = false;
  }
}
