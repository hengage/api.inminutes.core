// import * as OneSignal from "onesignal-node";
import * as OneSignal from "@onesignal/node-onesignal";

import { ONE_SIGNAL_API_KEY, ONE_SIGNAL_APP_ID } from "./secrets.config";

// export const oneSignalClient = new OneSignal.Client(
//   `${ONE_SIGNAL_APP_ID}`,
//   `${ONE_SIGNAL_API_KEY}`
// );

// const app_key_provider = {
//   getToken() {
//     return `${ONE_SIGNAL_API_KEY}`;
//   },
// };

// const configuration = OneSignal.createConfiguration({
//   authMethods: {
//     app_key: {
//       tokenProvider: app_key_provider,
//     },
//   },
// });

const configuration = OneSignal.createConfiguration({
  // userKey: `${ONE_SIGNAL_API_KEY}`,
  appKey: `${ONE_SIGNAL_API_KEY}`,
});

export const oneSignalClient = new OneSignal.DefaultApi(configuration);
