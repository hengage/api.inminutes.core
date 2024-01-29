import dotenv from "dotenv";
dotenv.config();

import { App } from "./app/app";
import { NODE_ENV, PORT } from "./config";
import { vendorsRepo } from "./features/vendors/repository/vendors.repo";

const app = new App();

(async () => {
  await vendorsRepo.findVendorsByLocation(
    [
      // 6.491115447705142, 3.3566839017924868
      // adeniran ogunsanya

      6.528357408401941, 3.402751494848868,
      // Third mainland bridge

      // 6.47419818312704, 3.356589369631228
      // F9F4+HJJ, Ijora, Lagos 101241, Lagos, Nigeria
    ],
    1,
    10
  );
})();

app.listenToPort(PORT, NODE_ENV);
