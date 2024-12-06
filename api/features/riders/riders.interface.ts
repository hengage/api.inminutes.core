import { Document } from "mongoose";
<<<<<<< HEAD
import {
  USER_APPROVAL_STATUS,
  ACCOUNT_STATUS,
  RIDER_WORK_SLOT_STATUS
} from "../../constants";
=======
import { RIDER_WORK_SLOT_STATUS } from "../../utils";
import { RIDERS_SLOT_SESSIONS } from "../../constants";
import { Coordinates } from "../../types";
>>>>>>> dev

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
  rating: {
    totalRatingSum: number;
    ratingCount: number;
    averageRating: number;
  };
}

export interface ICreateRiderData {
  fullName: string,
  displayName: string,
  email: string,
  phoneNumber: string,
  password: string,
  dateOfBirth: string,
  residentialAddress: string,
}

export interface IRiderTimeSlotDocument extends Document {

  // status: RIDER_WORK_SLOT_STATUS;
  _id: string;
  area: IWorkAreaDocument;
  date: Date;
  session: RIDERS_SLOT_SESSIONS;
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
  timeSlot: string;
  status: RIDER_WORK_SLOT_STATUS;
}
