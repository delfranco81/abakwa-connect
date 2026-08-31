import { Logger } from "../../core/logging";
import { Environment } from "../config/Environment";
import { FeatureFlags } from "../config/FeatureFlags";
import { PlatformStatus } from "../status/PlatformStatus";

export class Kernel {
  private static started = false;

  static async boot() {
    if (this.started) {
      Logger.warn("Kernel already started.");
      return;
    }

    Logger.info("Booting Kernel...");

    PlatformStatus.platform = "starting";
    PlatformStatus.error = null;

    try {
      /*
       * -------------------------------------------------------
       * ENVIRONMENT
       * -------------------------------------------------------
       */

      if (!Environment.appName) {
        throw new Error(
          "ECOS application name is missing."
        );
      }

      Logger.info(
        `Environment: ${Environment.environment}`
      );

      Logger.info(
        `ECOS Version: ${Environment.version}`
      );

      /*
       * -------------------------------------------------------
       * DATABASE
       * -------------------------------------------------------
       *
       * Supabase configuration is already validated by the
       * existing database layer.
       *
       * We therefore record the database as configured here
       * without creating another Supabase client.
       */

      if (
        Environment.supabaseUrl &&
        Environment.supabaseKey
      ) {
        PlatformStatus.database = "ready";
      } else {
        PlatformStatus.database = "error";

        throw new Error(
          "Supabase environment configuration is missing."
        );
      }

      /*
       * -------------------------------------------------------
       * SEARCH
       * -------------------------------------------------------
       *
       * ECOS search already exists in the application.
       */

      PlatformStatus.search = "ready";

      /*
       * -------------------------------------------------------
       * NOTIFICATIONS
       * -------------------------------------------------------
       *
       * NotificationCenter currently exists and is usable.
       */

      PlatformStatus.notifications = "ready";

      /*
       * -------------------------------------------------------
       * AI
       * -------------------------------------------------------
       *
       * The AI SDK currently exists but is not connected to
       * an external AI provider yet.
       *
       * Therefore we do NOT falsely report AI as ready.
       */

      PlatformStatus.ai =
        FeatureFlags.aiAssistant
          ? "offline"
          : "disabled";

      /*
       * -------------------------------------------------------
       * GUARDIAN
       * -------------------------------------------------------
       */

      PlatformStatus.guardian =
        FeatureFlags.guardian
          ? "starting"
          : "disabled";

      /*
       * -------------------------------------------------------
       * PLATFORM READY
       * -------------------------------------------------------
       */

      PlatformStatus.platform = "ready";
      PlatformStatus.startedAt =
        new Date().toISOString();

      this.started = true;

      Logger.success("Kernel Ready");
    } catch (error) {
      PlatformStatus.platform = "error";

      PlatformStatus.error =
        error instanceof Error
          ? error.message
          : String(error);

      Logger.error(
        `Kernel startup failed: ${PlatformStatus.error}`
      );

      throw error;
    }
  }

  static isStarted() {
    return this.started;
  }
}
