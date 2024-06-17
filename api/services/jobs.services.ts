import dotenv from "dotenv";
dotenv.config();

import { Agenda } from "agenda";
import { DB_URL } from "../config/secrets.config";
import { RidersService } from "../features/riders";
import { ridersService } from "../features/riders";


// const ridersService = new RidersService();
// console.log({ RidersService });
console.log({ ridersServiceInJObs: ridersService });


var agenda: Agenda;
if (process.env.NODE_ENV !== "test") {
  agenda = new Agenda({
    db: {
      address: `${DB_URL}`,
      collection: "agenda",
    },
    processEvery: "30 seconds",
  });

  agenda
    .on("ready", () => console.log("Agenda started!"))
    .on("error", () => console.log("Agenda connection error!"))
    .stop();

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
    const { riderId, slotId } = job.attrs.data;

    // Update rider's currentlyWorking field to true
    console.log("Runing avalalbility to true", job.attrs.data);
    await ridersService.updateAvailability({ riderId, currentlyWorking: true });
  });

  agenda.define("end-working", async (job: any) => {
    const { riderId, slotId } = job.attrs.data;

    console.log("Runing avalalbility to false", job.attrs.data);
    // Update rider's currentlyWorking field to false
    await ridersService.updateAvailability({
      riderId,
      currentlyWorking: false,
    });
  });
}

export { agenda };
