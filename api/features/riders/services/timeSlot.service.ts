import { agenda } from "../../../services";
import { timeSlotRepo } from "../repository/timeSlot.repo";

class TimeSlotService {
  async bookSlot(params: {
    riderId: string;
    startTime: string;
    endTime: string;
  }) {
    const { riderId, startTime, endTime } = params;

    const slot = await timeSlotRepo.bookSlot({ riderId, startTime, endTime });
    await agenda.schedule(startTime, "start-working", {
      riderId,
      slotId: slot._id,
    });

    await agenda.schedule(endTime, "end-working", {
      riderId,
      slotId: slot._id,
    });

    return slot;
  }
}

export const timeSlotService = new TimeSlotService();
