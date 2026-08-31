import { NotificationCenter } from "../../core/notifications/NotificationCenter";

export const notifications = {
  notify(message: string) {
    NotificationCenter.notify(message);
  },
};