import { startSession } from "mongoose";

import { DateTime } from 'luxon';
import { HandleException, RIDER_WORK_SLOT_STATUS } from "../../../utils";
import { timeSlotRepo } from "../repository/timeSlot.repo";
import { SchedulerService } from "../../../services";
import { AGENDA, RIDERS_SLOT_SESSIONS } from "../../../constants";

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
   * Books a work time slot for a rider in a specific area and time session.
   * @param {string} params.riderId - The ID of the rider booking the slot.
   * @param {string} params.areaId - The ID of the work area for the slot.
   * @param {Date} params.date - The date for the slot.
   * @param {string} params.session - The time session (e.g. '9am-12pm', '12pm-3pm', etc).
   * @returns {Promise<object>} The booked time slot document.
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

  private getStartEndTimes(date: Date | string, session: string): [Date, Date] {
    let startTime = DateTime.fromISO(`${date}`),
      endTime = DateTime.fromISO(`${date}`);

    switch (session) {
      case RIDERS_SLOT_SESSIONS.FIRST:
        startTime = startTime.set({ hour: 9, minute: 0, second: 0 });
        endTime = endTime.set({ hour: 12, minute: 0, second: 0 });
        break;
      case RIDERS_SLOT_SESSIONS.SECOND:
        startTime = startTime.set({ hour: 12, minute: 0, second: 0 });
        endTime = endTime.set({ hour: 15, minute: 0, second: 0 });
        break;
      case RIDERS_SLOT_SESSIONS.THIRD:
        startTime = startTime.set({ hour: 15, minute: 0, second: 0 })
        endTime = endTime.set({ hour: 18, minute: 0, second: 0 })
        break;
      case RIDERS_SLOT_SESSIONS.FOURTH:
        startTime = startTime.set({ hour: 18, minute: 0, second: 0 })
        endTime = endTime.set({ hour: 21, minute: 0, second: 0 })
        break;
    }
    return [startTime.toJSDate(), endTime.toJSDate()];
  }
}


export const timeSlotService = new TimeSlotService();
