import { PaginateModel, model, Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

import { generateUniqueString } from "../../../utils";
import {
  IErrandDocument,
  IErrandPackageTypeDocument,
} from "../errand.interface";
import { ErrandStatus } from "../../../config/constants.config";

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
    receiver: {
      name: { type: String, required: true, maxlength: 50 },
      phoneNumber: { type: String, required: true, maxlength: 50 },
    },
    rider: { type: String, ref: "Rider" },
    pickupAddress: { type: String, required: true },
    pickupCoordinates: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number, Number], required: true },
    },
    dropoffAddress: { type: String, required: true },
    dropoffCoordinates: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number, Number], required: true },
    },
    dispatchFee: { type: String, required: true },
    type: { type: String, required: true },
    scheduledPickupTime: { type: Date },
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

errandSchema.plugin(paginate);

export const Errand = model<IErrandDocument, PaginateModel<IErrandDocument>>(
  "Errand",
  errandSchema
);

export const ErrandPackageType = model<IErrandPackageTypeDocument>(
  "ErrandPackageType",
  errandPackageTypeSchema
);
