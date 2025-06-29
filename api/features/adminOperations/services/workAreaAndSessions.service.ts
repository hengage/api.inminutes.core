import { HTTP_STATUS_CODES } from "../../../constants";
import { Coordinates } from "../../../types";
import { HandleException, Msg } from "../../../utils";
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
    workAreaData: addWorkAreaData
  ): Promise<Partial<IWorkAreaDocument>> {
    const { name: areaName } = workAreaData;

    const existingWorkArea = await WorkArea.findOne({
      name: areaName.toLowerCase(),
    });
    if (existingWorkArea) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        Msg.ERROR_WORK_AREA_ALREADY_EXISTS(areaName)
      );
    }

    const workArea = await WorkArea.create({
      name: areaName.toLowerCase(),
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

  async getWorkSessionsPerArea(
    areaId: string,
    date: Date
  ): Promise<Partial<IWorkSlotSessionDocument>[]> {
    const parsedDate = new Date(date);
    const timeSlots = await RidersWorkSlotSession.find({
      area: areaId,
      date: parsedDate,
    })
      .sort({ session: "asc" })
      .lean()
      .exec();
    return timeSlots;
  },

  async getBookedRidersForSession(
    workSessionId: IWorkSlotSessionDocument["_id"]
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
