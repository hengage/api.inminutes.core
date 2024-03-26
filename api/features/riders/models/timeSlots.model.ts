import { Schema, model } from "mongoose";
import { IRiderTimeSlotDocument } from "../riders.interface";

const TimeSlotSchema = new Schema<IRiderTimeSlotDocument>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    riderId: { type: String, ref: "Rider", required: true },
  },
  {
    timestamps: true,
  }
);

export const RiderTimeSlot = model<IRiderTimeSlotDocument>("TimeSlot", TimeSlotSchema);
