import dotenv from "dotenv";
dotenv.config();

import { Agenda } from "agenda";
import { DB_URL } from "../config/secrets.config";
import { RidersService } from "../features/riders";

export class SchedulerService {
  private agenda: Agenda | undefined;
  private ridersService: RidersService;

  constructor() {
    this.ridersService = new RidersService();
    this.agenda = undefined;

    // Initialize Agenda only if not in test environment
    if (process.env.NODE_ENV !== "test") {
      this.agenda = new Agenda({
        db: {
          address: `${DB_URL}`,
          collection: "agenda",
        },
        processEvery: "30 seconds",
      });

      this.agenda.on("ready", () => console.log("Agenda started!"));
      this.agenda.on("error", (error) =>
        console.log("Agenda connection error:", error)
      );

      // Define agenda jobs
      this.defineJobs();
    }
  }

  public async start() {
    if (this.agenda) {
      await this.agenda.start();
    }
  }

  private defineJobs() {
    this.agenda?.define("schedule-order-delivery", async (job: any) => {
      console.log("Running schedule");

      const { coordinates, distanceInKM, orderId } = job.attrs.data;

      await this.ridersService.findAndNotifyRidersOfOrder({
        coordinates,
        distanceInKM,
        orderId,
      });
    });

    this.agenda?.define("start-working", async (job: any) => {
      const { riderId, slotId } = job.attrs.data;

      // Update rider's currentlyWorking field to true
      console.log("Running availability to true", job.attrs.data);
      await this.ridersService.updateAvailability({
        riderId,
        currentlyWorking: true,
      });
    });

    this.agenda?.define("end-working", async (job: any) => {
      const { riderId, slotId } = job.attrs.data;

      // Update rider's currentlyWorking field to false
      console.log("Running availability to false", job.attrs.data);
      await this.ridersService.updateAvailability({
        riderId,
        currentlyWorking: false,
      });
    });
  }

  public async scheduleOrderDelivery(params: {
    scheduledTime: Date;
    coordinates: [number, number];
    distanceInKM: number;
    orderId: string;
  }) {
    const { scheduledTime, coordinates, distanceInKM, orderId } = params;

    await this.agenda?.schedule(scheduledTime, "schedule-order-delivery", {
      coordinates,
      distanceInKM,
      orderId,
    });
  }
}
