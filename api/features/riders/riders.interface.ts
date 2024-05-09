import { Document } from "mongoose";
import { RIDER_WORK_SLOT_STATUS } from "../../utils";

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
  rating: {
    totalRatingSum: number;
    ratingCount: number;
    averageRating: number;
  };
}

export interface IRiderTimeSlotDocument extends Document {
  startTime: Date;
  endTime: Date;
  riderId: IRiderDocument;
  status: RIDER_WORK_SLOT_STATUS;
}
