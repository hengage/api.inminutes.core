import { Coordinates } from "../../../types";
import {
  IWorkAreaDocument,
  RiderBooking,
  RidersWorkSlotSession,
  WorkArea,
} from "../../riders";
import {
  IRiderBookingDocument,
  IWorkSlotSessionDocument,
} from "../../riders/riders.interface";

export const adminOpsWorkAreaService = {
  async addWorkArea(
    workAreaData: addWorkAreaData,
  ): Promise<Partial<IWorkAreaDocument>> {
    const workArea = await WorkArea.create({
      name: workAreaData.name,
      location: {
        coordinates: workAreaData.coordinates,
      },
      maxSlotsRequired: workAreaData.maxSlotsRequired,
    });

    return {
      _id: workArea._id,
      name: workArea.name,
      maxSlotsRequired: workArea.maxSlotsRequired,
    };
  },

  async getWorkAreas(): Promise<Partial<IWorkAreaDocument>[]> {
    const workAreas = await WorkArea.find()
      .select("_id name maxSlotsRequired")
      .lean()
      .exec();
    return workAreas;
  },

  async getWorkSlotSessionsPerArea(
    areaId: string,
    date: Date,
  ): Promise<Partial<IWorkSlotSessionDocument>[]> {
    const timeSlots = await RidersWorkSlotSession.find({
      area: areaId,
      date,
    })
      .select("")
      .lean()
      .exec();

    return timeSlots;
  },

  async getBookedRidersForSession(
    workSessionId: IWorkSlotSessionDocument["_id"],
  ): Promise<IRiderBookingDocument["rider"][]> {
    const riderBookings = await RiderBooking.find({
      workSlotSession: workSessionId,
    })
      .select("rider")
      .populate({
        path: "rider",
        select: "fullName _id",
      })
      .lean()
      .exec();

    const riders = riderBookings.map((booking) => booking.rider);
    return riders;
  },
};

export interface addWorkAreaData {
  name: string;
  coordinates: Coordinates;
  maxSlotsRequired: number;
}
