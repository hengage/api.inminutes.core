import dotenv from "dotenv";
dotenv.config();

import { Agenda } from "agenda";
import { DB_URL } from "../config/secrets.config";
import { ridersService } from "../features/riders";

const agenda = new Agenda({
  db: {
    address: `${DB_URL}`,
    collection: "agenda",
  },
  processEvery: "30 seconds",
});

agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

agenda.define("schedule-order-delivery", async (job: any) => {
  console.log("Running schedule");

  const { coordinates, distanceInKM, orderId } = job.attrs.data;

  ridersService.findAndNotifyRIdersOfOrder({
    coordinates,
    distanceInKM,
    orderId,
  });
});

agenda.define("start-working", async (job: any) => {
  const { riderId } = job.attrs.data;

  // Update rider's currentlyWorking field to true
  await ridersService.updateAvailability({ riderId, currentlyWorking: true });
});

agenda.define("end-working", async (job: any) => {
  const { riderId } = job.attrs.data;

  // Update rider's currentlyWorking field to false
  await ridersService.updateAvailability({ riderId, currentlyWorking: false });
});

export { agenda };
