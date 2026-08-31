import { Logger } from "../../logging";
import { AIEngine } from "./AIEngine";

export type AIManagerStatus =
  | "offline"
  | "starting"
  | "ready"
  | "error";

export class AIManager {
  private static status: AIManagerStatus =
    "offline";

  private static startedAt:
    string | null = null;

  private static lastError:
    string | null = null;

  static async start(): Promise<void> {
    if (this.status === "ready") {
      Logger.warn(
        "AI Manager already started."
      );

      return;
    }

    Logger.info(
      "Starting ECOS AI Manager..."
    );

    this.status = "starting";
    this.lastError = null;

    try {
      await AIEngine.initialize();

      /*
       * AI may legitimately start without
       * an external provider. The provider
       * registry determines whether actual
       * generation is currently available.
       */

      this.status = "ready";
      this.startedAt =
        new Date().toISOString();

      Logger.success(
        "ECOS AI Manager Ready"
      );
    } catch (error) {
      this.status = "error";

      this.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      Logger.error(
        `ECOS AI Manager startup failed: ${this.lastError}`
      );

      throw error;
    }
  }

  static getStatus(): AIManagerStatus {
    return this.status;
  }

  static getState() {
    return {
      status: this.status,
      startedAt: this.startedAt,
      lastError: this.lastError,
      hasProvider:
        AIEngine.hasProvider(),
    };
  }

  static isReady(): boolean {
    return this.status === "ready";
  }

  static isAvailable(): boolean {
    return (
      this.status === "ready" &&
      AIEngine.hasProvider()
    );
  }

  static reset(): void {
    this.status = "offline";
    this.startedAt = null;
    this.lastError = null;
  }
}
