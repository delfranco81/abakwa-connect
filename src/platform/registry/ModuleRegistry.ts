import { Logger } from "../../core/logging";

export interface PlatformModule {
  id: string;
  name: string;
  version: string;
  initialize(): Promise<void>;
}

export class ModuleRegistry {
  private static modules = new Map<string, PlatformModule>();
  private static initialized = new Set<string>();

  static register(module: PlatformModule) {
    if (this.modules.has(module.id)) {
      Logger.warn(
        `Module already registered: ${module.id}`
      );
      return;
    }

    this.modules.set(
      module.id,
      module
    );

    Logger.info(
      `Module registered: ${module.name} (${module.version})`
    );
  }

  static async initializeAll() {
    for (const module of this.modules.values()) {
      if (this.initialized.has(module.id)) {
        continue;
      }

      try {
        Logger.info(
          `Initializing module: ${module.name}`
        );

        await module.initialize();

        this.initialized.add(
          module.id
        );

        Logger.success(
          `Module ready: ${module.name}`
        );
      } catch (error) {
        Logger.error(
          `Module failed: ${module.name} - ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );

        throw error;
      }
    }
  }

  static getModules(): PlatformModule[] {
    return Array.from(
      this.modules.values()
    );
  }

  static getModule(
    id: string
  ): PlatformModule | undefined {
    return this.modules.get(id);
  }

  static isInitialized(
    id: string
  ): boolean {
    return this.initialized.has(id);
  }

  static clear() {
    this.modules.clear();
    this.initialized.clear();
  }
}
