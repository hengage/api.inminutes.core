import { Document } from "mongoose";
import {
  USER_APPROVAL_STATUS,
  ACCOUNT_STATUS,
  RIDER_WORK_SLOT_STATUS,
} from "../../constants";
import { WORK_SLOT_SESSIONS } from "../../constants";
import { Coordinates } from "../../types";

export interface IRiderDocument extends Document {
  _id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  h3Index: string;
  dateOfBirth: Date;
  residentialAddress: string;
  currentlyWorking: boolean;
  accountStatus: ACCOUNT_STATUS;
  approvalStatus: USER_APPROVAL_STATUS;
  isDeleted: boolean;
  rating: {
    totalRatingSum: number;
    ratingCount: number;
    averageRating: number;
  };
}

export interface ICreateRiderData {
  fullName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  password: string;
  dateOfBirth: string;
  residentialAddress: string;
}

export interface IWorkSlotSessionDocument extends Document {
  // status: RIDER_WORK_SLOT_STATUS;
  _id: string;
  area: IWorkAreaDocument;
  date: Date;
  session: WORK_SLOT_SESSIONS;
  availableSlots: number;
  numberOfSlotsBooked: number;
}

export interface IWorkAreaDocument extends Document {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: Coordinates;
  };
  maxSlotsRequired: number;
}

export interface IRiderBookingDocument extends Document {
  rider: string;
  workSlotSession: string;
  status: RIDER_WORK_SLOT_STATUS;
}

export interface IBookSlotData {
  riderId: IRiderDocument["_id"];
  areaId: IWorkAreaDocument["_id"];
  date: Date;
  session: WORK_SLOT_SESSIONS;
}

export interface ICreateWorkSlotSession {
  areaId: IWorkAreaDocument["_id"];
  date: Date;
  session: WORK_SLOT_SESSIONS;
  maxSlots: number;
}
