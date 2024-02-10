import { oneSignalClient } from "../../../config";
import { ONE_SIGNAL_APP_ID } from "../../../config/secrets.config";
import * as OneSignal from "@onesignal/node-onesignal";

class NotificationService {
  async createNotification(userId: string) {
    const notification = new OneSignal.Notification();

    notification.app_id = `${ONE_SIGNAL_APP_ID}`;
    notification.contents = {
      en: "Content",
    };

    // required for Huawei
    notification.headings = {
      en: "Title",
    };

    notification.include_external_user_ids = [userId]

    // notification.filters = [
    //     {
    //         field: 'last_session',
    //         relation: '>',
    //         value: "1"
    //     },
    // ];
    notification.data = {orderId: "hello"}

    notification.target_channel = "push"

    try {
      const notificationResponse = await oneSignalClient.createNotification(
        notification
      );

      console.log({ notificationResponse });
    } catch (error: any) {
      console.error({ error: error });
    }
  }
}

export const notificationService = new NotificationService();
