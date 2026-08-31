export class NotificationCenter {
  static notify(event: string) {
    console.log("[ECOS EVENT]", event);
  }
}