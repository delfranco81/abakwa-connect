import { Logger } from "../../core/logging";

export class ServiceRegistry {
  private static services =
    new Map<string, unknown>();

  static register(
    name: string,
    service: unknown
  ) {
    if (this.services.has(name)) {
      Logger.warn(
        `Service already registered: ${name}`
      );
      return;
    }

    this.services.set(
      name,
      service
    );

    Logger.info(
      `Service registered: ${name}`
    );
  }

  static resolve<T>(
    name: string
  ): T | undefined {
    return this.services.get(
      name
    ) as T | undefined;
  }

  static has(
    name: string
  ): boolean {
    return this.services.has(name);
  }

  static remove(
    name: string
  ) {
    this.services.delete(name);
  }

  static clear() {
    this.services.clear();
  }
}
