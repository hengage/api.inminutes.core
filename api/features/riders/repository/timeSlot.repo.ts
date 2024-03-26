import { RiderTimeSlot } from "../models/timeSlots.model";

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
}

export const timeSlotRepo = new TimeSlotRepository();
