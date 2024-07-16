import { startSession } from "mongoose";

import { string } from "joi";
import { HandleException, RIDER_WORK_SLOT_STATUS } from "../../../utils";
import { timeSlotRepo } from "../repository/timeSlot.repo";
import { SchedulerService } from "../../../services";

/**
Service for managing time slots for riders.
@class
*/
class TimeSlotService {
  private jobscheduleService: SchedulerService;
  constructor() {
    this.jobscheduleService = SchedulerService.getInstance();
  }

  /**
   * @async
  Books a work time slot for a rider.
  @param {string} params.riderId - The ID of the rider booking the slot.
  @param {string} params.startTime - The start time of the slot.
  @param {string} params.endTime - The end time of the slot.
  */
  async bookSlot(params: {
    riderId: string;
    startTime: string;
    endTime: string;
  }) {
    const { riderId, startTime, endTime } = params;

    const slot = await timeSlotRepo.bookSlot({ riderId, startTime, endTime });

    await this.jobscheduleService.scheduleJob({
      jobName: "start-work-schedule",
      scheduledTime: startTime,
      jobData: { riderId, slotId: slot._id },
    });

    await this.jobscheduleService.scheduleJob({
      jobName: "end-work-schedule",
      scheduledTime: endTime,
      jobData: { riderId, slotId: slot._id },
    });

    return slot;
  }

  /**
  Cancels a booked time slot.
  @param {string} slotId - The ID of the time slot to cancel.
  @returns {object} The cancelled time slot document.
  */
  async cancelSlot(slotId: string) {
    console.log({ slotId });
    const session = await startSession();
    session.startTransaction();
    try {
      const cancelledTimeSlot = await this.jobscheduleService.cancelRiderSlot(
        slotId
      );

      await timeSlotRepo.updateStatus({
        slotId,
        status: RIDER_WORK_SLOT_STATUS.CANCELLED,
        session,
      });

      await session.commitTransaction();
      return cancelledTimeSlot;
    } catch (error: any) {
      await session.abortTransaction();
      throw new HandleException(error.status, error.message);
    } finally {
      session.endSession();
    }
  }
}

export const timeSlotService = new TimeSlotService();
