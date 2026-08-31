import { NotificationCenter } from "../../core/notifications/NotificationCenter";

export class NotificationService {
  notify(message: string) {
    NotificationCenter.notify(message);
  }
}