import { Coordinates } from "../../../types";
import { createPaginationOptions, HandleException } from "../../../utils";
import {
  RiderBooking,
  RidersWorkSlotSession,
  WorkArea,
} from "../models/workSlot.model";
import { ClientSession } from "mongoose";
import {
  IBookSlotData,
  ICreateWorkSlotSession,
  IRiderDocument,
  IWorkAreaDocument,
  IWorkSlotSessionDocument,
} from "../riders.interface";
import { WORK_SLOT_SESSIONS } from "../../../constants";
import { session } from "passport";

/**
Repository for managing time slots for riders.
@class
*/
class WorkSlotRepository {
  async bookSlot(bookSlotData: IBookSlotData) {
    const { riderId, areaId, date, session } = bookSlotData;

    const area = await this.validateWorkAreaExists(areaId);

    // Get or create work slot session
    const workSlotSession = await this.getOrCreateWorkSlotSession({
      areaId,
      date,
      session,
      maxSlots: area.maxSlotsRequired,
    });

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

    return booking;
  }

  private async validateWorkAreaExists(
    areaId: string
  ): Promise<IWorkAreaDocument> {
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
    workSlotSessionId: IWorkSlotSessionDocument["_id"]
  ): Promise<void> {
    const existingBooking = await RiderBooking.exists({
      rider: riderId,
      workSlotSession: workSlotSessionId,
    });

    if (existingBooking) {
      throw new HandleException(409, "You have already booked this session");
    }
  }

  /**
   * Gets or creates a work slot session
   */
  private async getOrCreateWorkSlotSession(
    createWorkSessionData: ICreateWorkSlotSession
  ): Promise<IWorkSlotSessionDocument> {
    const { areaId, date, session, maxSlots } = createWorkSessionData;

    let workSlotSession = await RidersWorkSlotSession.findOne({
      area: areaId,
      date,
      session,
    });

    if (!workSlotSession) {
      workSlotSession = new RidersWorkSlotSession({
        area: areaId,
        date,
        session,
        availableSlots: maxSlots,
        numberOfSlotsBooked: 0,
      });
    }

    return workSlotSession;
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
    name: string;
    coordinates: Coordinates;
    maxSlotsRequired: number;
  }) {
    return await new WorkArea(createWorkAreadata).save();
  }

  /**
   * @async
   * Retrieves a list of work areas.
   * @param {object} params.query - Query parameters for filtering work areas.
   * @param {number} params.page - The page number to retrieve.
   */
  async getWorkAreas(params: { limit?: number; page?: number }) {
    const { limit, page } = params;
    const options = createPaginationOptions(
      {},
      isNaN(Number(page)) ? undefined : page,
      isNaN(Number(limit)) ? undefined : limit
    );
    const workAreas = await WorkArea.paginate({}, options);

    return workAreas;
  }

  /**
   * @async
   * Retrieves a list of work sessions for a given area.
   * @param {string} areaId - The ID of the area to retrieve work sessions for.
   * @param {Date} date - The date to retrieve work sessions for.
   */
  async getWorkSessionsForArea(areaId: string, date: Date) {
    const area = await WorkArea.findById(areaId);
    if (!area) {
      throw new HandleException(400, "Invalid work area");
    }

    // Get existing sessions
    const existingSessions = await RidersWorkSlotSession.find({
      area: areaId,
      date,
    })
      .select("-__v -createdAt -updatedAt")
      .lean();

    // Create a map of existing sessions
    const sessionMap = new Map(
      existingSessions.map((session) => [session.session, session])
    );

    // Create all four sessions if they don't exist
    const allSessions = Object.values(WORK_SLOT_SESSIONS).map((sessionTime) => {
      const existingSession = sessionMap.get(sessionTime);
      if (existingSession) {
        return existingSession;
      }

      // Return default session object if not booked yet
      return {
        _id: null, // Will be created when first booked
        area: areaId,
        date,
        session: sessionTime,
        availableSlots: area.maxSlotsRequired,
        numberOfSlotsBooked: 0,
      };
    });

    // Sort sessions by time and determine bookability
    return allSessions
      .sort(
        (a, b) =>
          Object.values(WORK_SLOT_SESSIONS).indexOf(a.session) -
          Object.values(WORK_SLOT_SESSIONS).indexOf(b.session)
      )
      .map((session) => {
        return {
          ...session,
          isBookable: session.availableSlots > 0,
        };
      });
  }
}

export const workSlotRepo = new WorkSlotRepository();
