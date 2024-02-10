import * as OneSignal from "@onesignal/node-onesignal";

export interface NotificationOptions {
    contents: Record<string, string>;
    headings?: Record<string, string>;
    data?: Record<string, string>;
    userId?: string;
    filters?: OneSignal.Notification["filters"];
  }
  