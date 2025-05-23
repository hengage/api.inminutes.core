import dotenv from "dotenv";
dotenv.config();

import { Agenda, Job, JobAttributesData } from "agenda";
import { DB_URL } from "../config/secrets.config";
import { ridersService } from "../features/riders";
import { AGENDA } from "../constants";

/**
Service for scheduling tasks and jobs.
@class
*/
export class SchedulerService {
  private static instance: SchedulerService;
  private agenda: Agenda | undefined;

  public constructor() {}

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
          collection: "agenda",
        },
        processEvery: "30 seconds",
      });

      this.agenda
        .on("ready", () => console.log("Agenda started!"))
        .on("error", () => console.log("Agenda connection error!"));

      this.defineJobs();
      this.agenda.start();
    }
  }

  /**
  Defines the jobs.
  @private
  */
  private defineJobs() {
    this.agenda?.define(
      AGENDA.SCHEDULE_DISPATCH_PICKUP,
      async (job: Job<JobAttributesData>) => {
        console.log("Running schedule");
        const { coordinates, distanceInKM, dispatchType, dispatchId } =
          job.attrs.data;
        await ridersService.notifyRidersForDispatchJob({
          coordinates,
          distanceInKM,
          dispatchType,
          dispatchId,
        });
      },
    );

    this.agenda?.define(
      AGENDA.START_WORK_SCHEDULE,
      async (job: Job<JobAttributesData>) => {
        const { riderId } = job.attrs.data;
        console.log("Running availability to true", job.attrs.data);
        await ridersService.updateAvailability({
          riderId,
          currentlyWorking: true,
        });
      },
    );

    this.agenda?.define(
      AGENDA.END_WORK_SCHEDULE,
      async (job: Job<JobAttributesData>) => {
        const { riderId } = job.attrs.data;
        console.log("Running availability to false", job.attrs.data);
        await ridersService.updateAvailability({
          riderId,
          currentlyWorking: false,
        });
      },
    );
  }

  /**
   * Schedules a job with the given name, time, and data.
   * @param {string} jobName - The name of the job to schedule.
   * @param {Date} scheduledTime - The time to schedule the job.
   * @param {object} jobData - The data to pass to the job.
   */
  async scheduleJob(params: {
    jobName: string;
    scheduledTime: Date | string;
    jobData: JobAttributesData;
  }) {
    const { jobName, scheduledTime, jobData } = params;
    await this.agenda?.schedule(scheduledTime, jobName, jobData);
  }

  async cancelRiderSlot(slotId: string) {
    const cancelledJobs = await this.agenda?.cancel({
      "data.slotId": slotId,
    });

    return cancelledJobs;
  }
}
