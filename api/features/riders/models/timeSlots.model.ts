import { Schema, model } from "mongoose";
import { ITimeSlotDocument } from "../riders.interface";

const TimeSlotSchema = new Schema<ITimeSlotDocument>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    riderId: { type: String, ref: "Rider", required: true },
  },
  {
    timestamps: true,
  }
);

export const TimeSlot = model<ITimeSlotDocument>("TimeSlot", TimeSlotSchema);
