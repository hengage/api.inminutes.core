import { oneSignalClient } from "../../../config";
import { ONE_SIGNAL_APP_ID } from "../../../config/secrets.config";
import * as OneSignal from "@onesignal/node-onesignal";
import { NotificationOptions } from "../notifications.interface";

class NotificationService {
  private buildNotification(options: NotificationOptions) {
    const notification = new OneSignal.Notification();

    notification.app_id = `${ONE_SIGNAL_APP_ID}`;
    notification.contents = options.contents;
    notification.headings = options.headings;
    notification.data = options.data;
    notification.include_external_user_ids = [`${options.userId}`];
    notification.target_channel = "push";
    notification.filters = options.filters;
    return notification;
  }

  async createNotification(options: NotificationOptions) {
    const notification = this.buildNotification(options);

    try {
      const notificationResponse = await oneSignalClient.createNotification(
        notification
      );

      console.log({ notificationResponse });
    } catch (error: any) {
      console.error({ error });
    }
  }
}

export const notificationService = new NotificationService();
