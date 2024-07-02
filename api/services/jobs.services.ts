import dotenv from "dotenv";
dotenv.config();

import { Agenda } from "agenda";
import { DB_URL } from "../config/secrets.config";
import { RidersService } from "../features/riders";


/**
Service for scheduling tasks and jobs.
@class
*/
export class SchedulerService {
  private static instance: SchedulerService;
  private agenda: Agenda | undefined;
  private ridersService: RidersService;

  public constructor() {
    this.ridersService = new RidersService();
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
      SchedulerService.instance.setupAgenda();
    }
    return SchedulerService.instance;
  }

  private setupAgenda() {
    if (!this.agenda) {
      this.agenda = new Agenda({
        db: {
          address: `${DB_URL}`,
          collection: 'agenda',
        },
        processEvery: '30 seconds',
      });

      this.agenda
        .on('ready', () => console.log('Agenda started!'))
        .on('error', () => console.log('Agenda connection error!'));

      this.defineJobs();
      this.agenda.start();
    }
  }

  /**
  Defines the jobs.
  @private
  */
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
      console.log("Running availability to true", job.attrs.data);
      await this.ridersService.updateAvailability({
        riderId,
        currentlyWorking: true,
      });
    });

    this.agenda?.define("end-working", async (job: any) => {
      const { riderId, slotId } = job.attrs.data;
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

  async riderStartWorking(params: { startTime: string, riderId: string, slotId: string }) {
    const { startTime, riderId, slotId } = params;
    await this.agenda?.schedule(startTime, "start-working", {
      riderId,
      slotId,
    });
  }

  async riderEndWorking(params: { endTime: string, riderId: string, slotId: string }) {
    const { endTime, riderId, slotId } = params;
    await this.agenda?.schedule(endTime, "end-working", {
      riderId,
      slotId,
    });
  }

  async cancelRiderSlot(slotId: string) {
    const cancelledJobs = await this.agenda?.cancel({
      "data.slotId": slotId,
    });

    return cancelledJobs;
  }
}
