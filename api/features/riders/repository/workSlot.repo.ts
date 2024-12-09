import { Coordinates } from "../../../types";
import { HandleException } from "../../../utils";
import { RiderBooking, RidersWorkSlotSession, WorkArea } from "../models/workSlot.model";
import { ClientSession } from "mongoose";
import { IRiderDocument, IWorkAreaDocument, IWorkSlotSessionDocument } from "../riders.interface";

/**
Repository for managing time slots for riders.
@class
*/
class WorkSlotRepository {
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

    const area = await this.validateWorkAreaExists(areaId);

    let workSlotSession = await RidersWorkSlotSession.findOne(
      { area: areaId, date, session }
    );

    if (!workSlotSession) {
      workSlotSession = new RidersWorkSlotSession({
        area: areaId,
        date,
        session,
        availableSlots: area.maxSlotsRequired,
        numberOfSlotsBooked: 0,
      });
    }

    await this.checkExistingBooking(riderId, workSlotSession._id);

    if (workSlotSession.availableSlots === 0) {
      throw new HandleException(
        400,
        "The location is fully booked for this session. Please choose another session."
      );
    }

    workSlotSession.availableSlots -= 1;
    workSlotSession.numberOfSlotsBooked += 1;
    await workSlotSession.save();
    // Todo: use transactions to ensure booking is atomic

    const booking = new RiderBooking({
      rider: riderId,
      workSlotSession: workSlotSession._id,
    });
    await booking.save();

    return workSlotSession;
  }

  private async validateWorkAreaExists(areaId: string):
    Promise<IWorkAreaDocument> {
    const area = await WorkArea.findById(areaId);
    if (!area) {
      throw new HandleException(
        400,
        "The location is invalid or has not been added yet"
      );
    }
    return area;
  }

  /**
 * Checks if rider has already booked this session
 */
  private async checkExistingBooking(
    riderId: IRiderDocument["_id"],
    workSlotSessionId: IWorkSlotSessionDocument["_id"])
    : Promise<void> {
    const existingBooking = await RiderBooking.exists({
      rider: riderId,
      workSlotSession: workSlotSessionId
    });

    if (existingBooking) {
      throw new HandleException(
        409,
        "You have already booked this session"
      );
    }
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
    const slot = await RidersWorkSlotSession.findByIdAndUpdate(
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

export const workSlotRepo = new WorkSlotRepository();
