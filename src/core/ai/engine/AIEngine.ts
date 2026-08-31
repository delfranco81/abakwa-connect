import { Logger } from "../../logging";
import {
  AIRegistry,
} from "./AIRegistry";

import type {
  AIProviderRequest,
  AIProviderResponse,
} from "./AIProvider";

export class AIEngine {
  static async initialize(): Promise<void> {
    const providers =
      AIRegistry.getEnabled();

    if (!providers.length) {
      Logger.warn(
        "No enabled AI providers are registered."
      );

      return;
    }

    for (const provider of providers) {
      try {
        await provider.initialize();

        Logger.success(
          `AI provider initialized: ${provider.name}`
        );
      } catch (error) {
        Logger.error(
          `AI provider initialization failed: ${
            provider.name
          } - ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );
      }
    }
  }

  static async generate(
    request: AIProviderRequest
  ): Promise<AIProviderResponse> {
    const providers =
      AIRegistry.getReady();

    if (!providers.length) {
      throw new Error(
        "No ready AI provider is available."
      );
    }

    const provider =
      providers[0];

    Logger.info(
      `AI request routed to provider: ${provider.name}`
    );

    return provider.generate(
      request
    );
  }

  static hasProvider(): boolean {
    return (
      AIRegistry.getReady().length >
      0
    );
  }
}
