import { Logger } from "../../core/logging";
import { Kernel } from "../kernel/Kernel";
import { ModuleRegistry } from "../registry/ModuleRegistry";
import { registerPlatformModules } from "../modules";

export class PlatformBootstrap {
  private static started = false;

  static async start() {
    if (this.started) {
      Logger.warn(
        "ECOS Platform already started."
      );
      return;
    }

    Logger.info(
      "Starting ECOS..."
    );

    registerPlatformModules();

    await Kernel.boot();

    await ModuleRegistry.initializeAll();

    this.started = true;

    Logger.success(
      "Platform Ready"
    );
  }

  static isStarted() {
    return this.started;
  }
}
