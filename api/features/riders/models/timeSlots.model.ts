import { Schema, model } from "mongoose";
import { IRiderTimeSlotDocument } from "../riders.interface";
import {  generateUniqueString } from "../../../utils";
import { RIDER_WORK_SLOT_STATUS, } from "../../../constants";

const TimeSlotSchema = new Schema<IRiderTimeSlotDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(7),
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    riderId: { type: String, ref: "Rider", required: true },
    status: {
      type: String,
      enum: Object.values(RIDER_WORK_SLOT_STATUS),
      default: RIDER_WORK_SLOT_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export const RiderTimeSlot = model<IRiderTimeSlotDocument>(
  "TimeSlot",
  TimeSlotSchema
);
