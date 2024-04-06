import { string } from "joi";
import { agenda } from "../../../services";
import { RIDER_WORK_SLOT_STATUS } from "../../../utils";
import { timeSlotRepo } from "../repository/timeSlot.repo";
const mongoose = require("mongoose");

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

  async cancelSlot(slotId: string) {
    console.log({ slotId });
    const objectId = new mongoose.Types.ObjectId(slotId);
    const cancelledTimeSlot = await agenda.cancel({
      "data.slotId": objectId,
    });
    
    await timeSlotRepo.updateStatus({
      slotId: objectId,
      status: RIDER_WORK_SLOT_STATUS.CANCELLED,
    });
    return cancelledTimeSlot;
  }
}

export const timeSlotService = new TimeSlotService();
