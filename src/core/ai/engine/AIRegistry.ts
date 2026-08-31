import { Logger } from "../../logging";
import type { AIProvider } from "./AIProvider";

export class AIRegistry {
  private static providers =
    new Map<string, AIProvider>();

  static register(
    provider: AIProvider
  ): void {
    if (this.providers.has(provider.id)) {
      Logger.warn(
        `AI provider already registered: ${provider.id}`
      );

      return;
    }

    this.providers.set(
      provider.id,
      provider
    );

    Logger.info(
      `AI provider registered: ${provider.name}`
    );
  }

  static get(
    id: string
  ): AIProvider | undefined {
    return this.providers.get(id);
  }

  static getAll(): AIProvider[] {
    return Array.from(
      this.providers.values()
    );
  }

  static getEnabled(): AIProvider[] {
    return this.getAll().filter(
      (provider) =>
        provider.enabled
    );
  }

  static getReady(): AIProvider[] {
    return this.getEnabled().filter(
      (provider) =>
        provider.isReady()
    );
  }

  static clear(): void {
    this.providers.clear();
  }
}
