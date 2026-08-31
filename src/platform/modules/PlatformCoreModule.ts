import { Logger } from "../../core/logging";
import { EcosKernel } from "../../core/ECOS Kernel";
import type { PlatformModule } from "../registry/ModuleRegistry";

export const PlatformCoreModule: PlatformModule = {
  id: "ecos.platform",
  name: "ECOS Platform",
  version: "1.0.0",

  async initialize() {
    Logger.info(
      "Initializing ECOS Platform module..."
    );

    /*
     * -------------------------------------------------------
     * ECOS INTELLIGENCE KERNEL
     * -------------------------------------------------------
     *
     * The platform module is the bridge between the
     * application platform lifecycle and the ECOS intelligence
     * foundation.
     *
     * EcosKernel.boot() initializes:
     *
     *   ECOS Brain
     *   ├── Platform Knowledge
     *   └── Business Knowledge
     *
     * followed by the ECOS Kernel itself.
     */
    await EcosKernel.boot();

    if (!EcosKernel.isReady()) {
      throw new Error(
        "ECOS Kernel failed to initialize."
      );
    }

    Logger.success(
      "ECOS Platform module connected to ECOS Kernel."
    );
  },
};
