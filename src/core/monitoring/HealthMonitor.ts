export interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastChecked: Date;
}

export class HealthMonitor {
  private static services: ServiceHealth[] = [];

  static report(service: string, healthy: boolean) {
    const existing = this.services.find(s => s.service === service);

    if (existing) {
      existing.healthy = healthy;
      existing.lastChecked = new Date();
      return;
    }

    this.services.push({
      service,
      healthy,
      lastChecked: new Date(),
    });
  }

  static getStatus() {
    return this.services;
  }
}