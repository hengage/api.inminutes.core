import { Coordinates } from "../../../types";
import { HandleException } from "../../../utils";
import { RiderBooking, RiderTimeSlotSession, WorkArea } from "../models/timeSlots.model";
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
    areaId: string;
    date: Date;
    session: string;
  }) {
    const { riderId, areaId, date, session } = params;

    // const timeSlot = await RiderTimeSlot.create({
    //   riderId,
    //   startTime,
    //   endTime,
    // });
    const area = await WorkArea.findById(areaId);
    if (!area) {
      throw new HandleException(400, "The location is invalid or has not been inputed yet");
    }

    let timeSlot = await RiderTimeSlotSession.findOne({ area: areaId, date, session });
    if (!timeSlot) {
      timeSlot = new RiderTimeSlotSession({
        area: areaId,
        date,
        session,
        availableSlots: area.maxSlotsRequired,
        bookedSlots: 0,
        numberOfSlotsBooked: 0,
      });
    }
    if (timeSlot.availableSlots === 0) {
      throw new HandleException(
        400,
        "The location is fully booked for this session. Please choose another session."
      );
    }
    timeSlot.availableSlots -= 1;
    timeSlot.numberOfSlotsBooked += 1;
    await timeSlot.save();
    // Todo: use transactions to ensure booking is atomic

    const booking = new RiderBooking({
      rider: riderId,
      timeSlot: timeSlot._id,
    });
    await booking.save();

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
    const slot = await RiderTimeSlotSession.findByIdAndUpdate(
      slotId,
      {
        $set: { status: status },
      },
      { new: true, session }
    ).select("status");
    console.log({ slot });
    return slot;
  }

  async createWorkArea(createWorkAreadata: {
    name: string,
    coordinates: Coordinates,
    maxSlotsRequired: number
  }) {
    return await new WorkArea(createWorkAreadata).save();
  }
}

export const timeSlotRepo = new TimeSlotRepository();
