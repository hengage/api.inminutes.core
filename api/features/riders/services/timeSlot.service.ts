import { startSession } from "mongoose";

import { string } from "joi";
import { HandleException, RIDER_WORK_SLOT_STATUS } from "../../../utils";
import { timeSlotRepo } from "../repository/timeSlot.repo";
import { SchedulerService } from "../../../services";
import { AGENDA, TIME_SESSIONS } from "../../../constants";

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
    areaId: string;
    date: Date
    session: string;
  }) {
    const { riderId, areaId, date, session } = params;
    // Todo: add validation
    // Todo: use transactions for this operation

    const slot = await timeSlotRepo.bookSlot({
      riderId,
      areaId,
      date,
      session,
    });

    const [startTime, endTime] = this.getStartEndTimes(date, session);

    await Promise.all([
      this.jobscheduleService.scheduleJob({
        jobName: AGENDA.START_WORK_SCHEDULE,
        scheduledTime: startTime,
        jobData: { riderId, slotId: slot._id },
      }),
      this.jobscheduleService.scheduleJob({
        jobName: AGENDA.END_WORK_SCHEDULE,
        scheduledTime: endTime,
        jobData: { riderId, slotId: slot._id },
      })
    ]);

    return slot;
  }

  /**
  *Cancels a booked time slot.
  *@param {string} slotId - The ID of the time slot to cancel.
  *@returns {object} The cancelled time slot document.
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

  private getStartEndTimes(date: Date, session: string): [Date, Date] {
    console.log({Date: date})
    const startTime = new Date(date);
    const endTime = new Date(date);
    switch (session) {
      case TIME_SESSIONS.FIRST:
        startTime.setHours(9, 0, 0);
        endTime.setHours(12, 0, 0);
        break;
      case TIME_SESSIONS.SECOND:
        startTime.setHours(12, 0, 0);
        endTime.setHours(15, 0, 0);
        break;
      case TIME_SESSIONS.THIRD:
        startTime.setHours(15, 0, 0);
        endTime.setHours(18, 0, 0);
        break;
      case TIME_SESSIONS.FOURTH:
        startTime.setHours(18, 0, 0);
        endTime.setHours(21, 0, 0);
        break;
    }
    console.log({startTime, endTime})
    return [startTime, endTime];
  }
}


export const timeSlotService = new TimeSlotService();
