import { Schema, model } from "mongoose";
import {
  IRiderBookingDocument,
  IWorkSlotSessionDocument,
  IWorkAreaDocument,
} from "../riders.interface";
import { generateUniqueString } from "../../../utils";
import {
  DB_SCHEMA,
  GEOLOCATION,
  RIDER_WORK_SLOT_STATUS,
  WORK_SLOT_SESSIONS,
} from "../../../constants";
import paginate from "mongoose-paginate-v2";
import { PaginateModel } from "mongoose";

// const TimeSlotSchema = new Schema<IRiderTimeSlotDocument>(
//   {
//     _id: {
//       type: String,
//       default: () => generateUniqueString(7),
//     },
//     startTime: { type: Date, required: true },
//     endTime: { type: Date, required: true },
//     riderId: { type: String, ref: "Rider", required: true },
//     status: {
//       type: String,
//       enum: Object.values(RIDER_WORK_SLOT_STATUS),
//       default: RIDER_WORK_SLOT_STATUS.PENDING,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

const workSlotSessionSchema = new Schema<IWorkSlotSessionDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(7),
    },
    area: {
      type: String,
      ref: DB_SCHEMA.WORK_AREA,
      required: true,
    },
    date: { type: Date, required: true },
    session: {
      type: String,
      enum: Object.values(WORK_SLOT_SESSIONS),
      required: true,
    },
    availableSlots: { type: Number, required: true },
    numberOfSlotsBooked: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const riderBookingSchema = new Schema<IRiderBookingDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(7),
    },
    rider: {
      type: String,
      ref: DB_SCHEMA.RIDER,
      required: true,
      index: true,
    },
    workSlotSession: {
      type: String,
      ref: DB_SCHEMA.WORK_TIME_SESSION,
      required: true,
      index: true,
    },
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

const areaSchema = new Schema<IWorkAreaDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(7),
    },
    name: { type: String, required: true, unique: true },
    location: {
      type: {
        type: String,
        default: GEOLOCATION.POINT,
      },
      coordinates: {
        type: [Number, Number],
        required: true,
      },
    },
    maxSlotsRequired: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

areaSchema.plugin(paginate);

export const RiderBooking = model<IRiderBookingDocument>(
  DB_SCHEMA.RIDER_BOOKING,
  riderBookingSchema
);

export const WorkArea = model<
  IWorkAreaDocument,
  PaginateModel<IWorkAreaDocument>
>(DB_SCHEMA.WORK_AREA, areaSchema);

export const RidersWorkSlotSession = model<IWorkSlotSessionDocument>(
  DB_SCHEMA.WORK_TIME_SESSION,
  workSlotSessionSchema
);
