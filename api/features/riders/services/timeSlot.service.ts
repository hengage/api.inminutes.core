import { timeSlotRepo } from "../repository/timeSlot.repo";

class TimeSlotService {
  async bookSlot(params: {
    riderId: string;
    startTime: string;
    endTime: string;
  }) {
    const { riderId, startTime, endTime } = params;

    const slot = timeSlotRepo.bookSlot({ riderId, startTime, endTime });

    return slot;
  }
}

export const timeSlotService = new TimeSlotService();
