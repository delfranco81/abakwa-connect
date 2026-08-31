import { PlatformBootstrap } from "./bootstrap/PlatformBootstrap";

export async function startPlatform() {
  await PlatformBootstrap.start();
}
