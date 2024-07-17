import { model, Schema } from "mongoose";
import { generateUniqueString } from "../../../utils";
import {
  IErrandDocument,
  IErrandPackageTypeDocument,
} from "../errand.interface";
import { ErrandStatus } from "../../../utils/constants.utils";

const errandSchema = new Schema<IErrandDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    packageType: [
      {
        type: String,
        ref: "ErrandPackageType",
        required: true,
      },
    ],
    description: { type: String, maxlength: 50 },
    customer: { type: String, ref: "Customer" },
    rider: { type: String, ref: "Rider" },
    pickupAddress: { type: String, required: true },
    pickupCoordinates: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number, Number], required: true },
    },
    dropoffAddress: { type: String, required: true },
    dropoffCoordinates: { type: [Number, Number], required: true },
    dispatchFee: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ErrandStatus),
      default: ErrandStatus.PENDING,
    },
  },
  { timestamps: true }
);

const errandPackageTypeSchema = new Schema<IErrandPackageTypeDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    packageType: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Errand = model<IErrandDocument>("Errand", errandSchema);

export const ErrandPackageType = model<IErrandPackageTypeDocument>(
  "ErrandPackageType",
  errandPackageTypeSchema
);
