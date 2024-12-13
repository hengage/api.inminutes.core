import * as OneSignal from "@onesignal/node-onesignal";

import { ONE_SIGNAL_API_KEY } from "./secrets.config";

const configuration = OneSignal.createConfiguration({
  // userKey: `${ONE_SIGNAL_API_KEY}`,
  appKey: `${ONE_SIGNAL_API_KEY}`,
});

export const oneSignalClient = new OneSignal.DefaultApi(configuration);
