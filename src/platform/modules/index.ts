import { ModuleRegistry } from "../registry/ModuleRegistry";
import { PlatformCoreModule } from "./PlatformCoreModule";

export function registerPlatformModules() {
  ModuleRegistry.register(
    PlatformCoreModule
  );
}
