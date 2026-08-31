type EventHandler = (payload: unknown) => void;

export class EventBus {
  private static listeners = new Map<string, EventHandler[]>();

  static subscribe(event: string, handler: EventHandler) {
    const handlers = this.listeners.get(event) ?? [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
  }

  static publish(event: string, payload: unknown) {
    const handlers = this.listeners.get(event) ?? [];

    handlers.forEach(handler => handler(payload));
  }
}