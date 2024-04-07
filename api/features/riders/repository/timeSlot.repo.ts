import { RiderTimeSlot } from "../models/timeSlots.model";
import { ClientSession } from "mongoose";

class TimeSlotRepository {
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

  async updateStatus(params: { slotId: string; status: string, session: ClientSession }) {
    const { slotId, status, session } = params;
    const slot = await RiderTimeSlot.findByIdAndUpdate(
      slotId,
      {
        $set: { status: status },
      },
      { new: true, session }
    ).select("status");
    console.log({slot})
    return slot
  }
}

export const timeSlotRepo = new TimeSlotRepository();
