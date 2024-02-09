import * as OneSignal from "onesignal-node";
import { ONE_SIGNAL_API_KEY, ONE_SIGNAL_APP_ID } from "./secrets.config";

export const client = new OneSignal.Client(
  `${ONE_SIGNAL_APP_ID}`,
  `${ONE_SIGNAL_API_KEY}`
);
