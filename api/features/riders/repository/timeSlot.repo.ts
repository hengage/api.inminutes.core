import { RiderTimeSlot } from "../models/timeSlots.model";
import { ClientSession } from "mongoose";

/**
Repository for managing time slots for riders.
@class
*/
class TimeSlotRepository {
  /*
  @async
  Books a working time slot for a rider.
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

    const timeSlot = await RiderTimeSlot.create({
      riderId,
      startTime,
      endTime,
    });

    return timeSlot;
  }

  /** Updates the status of a time slot.
  @param {string} params.slotId - The ID of the time slot to update.
  @param {string} params.status - The new status of the time slot.
  @param {ClientSession} params.session - The database session.
  */
  async updateStatus(params: {
    slotId: string;
    status: string;
    session: ClientSession;
  }) {
    const { slotId, status, session } = params;
    const slot = await RiderTimeSlot.findByIdAndUpdate(
      slotId,
      {
        $set: { status: status },
      },
      { new: true, session }
    ).select("status");
    console.log({ slot });
    return slot;
  }
}

export const timeSlotRepo = new TimeSlotRepository();
