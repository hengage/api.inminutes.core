import { Schema, model } from "mongoose";
import { IVendorDocument } from "../vendors.interface";
import {
  ACCOUNT_STATUS,
  PAYMENT_OPTIONS,
  generateUniqueString,
} from "../../../utils";

const vendorSchema = new Schema<IVendorDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    businessName: {
      type: String,
      required: true,
      unique: true,
    },
    businessLogo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number, Number],
      },
    },
    paymentOptions: [
      {
        type: String,
        enum: Object.values(PAYMENT_OPTIONS),
      },
    ],
    accountStatus: {
      type: String,
      default: ACCOUNT_STATUS.INACTIVE,
      enum: Object.values(ACCOUNT_STATUS),
    },
    rating: {
      totalRatingSum: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Vendor = model<IVendorDocument>("vendor", vendorSchema);
