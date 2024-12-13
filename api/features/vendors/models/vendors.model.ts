import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { IVendorDocument } from "../vendors.interface";
import {
  ACCOUNT_STATUS,
  DB_SCHEMA,
  GEOLOCATION,
  PAYMENT_OPTIONS,
  USER_APPROVAL_STATUS,
} from "../../../constants";

import {
  encryptValue,
  generateUniqueString,
  toLowerCaseSetter,
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
      set: function (value: string) {
        return toLowerCaseSetter(value);
      },
      index: true,
    },
    businessLogo: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      set: function (value: string) {
        return toLowerCaseSetter(value);
      },
      index: true,
    },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        default: GEOLOCATION.POINT,
      },
      coordinates: {
        type: [Number, Number],
      },
    },
    residentialAddress: { type: String, required: true },
    category: { type: String, required: true, ref: DB_SCHEMA.VENDOR_CATEGORY },
    subCategory: { type: String, ref: DB_SCHEMA.VENDOR_SUB_CATEGORY },
    paymentOptions: [
      {
        type: String,
        enum: Object.values(PAYMENT_OPTIONS),
      },
    ],
    accountStatus: {
      type: String,
      default: ACCOUNT_STATUS.ACTIVE,
      enum: Object.values(ACCOUNT_STATUS),
    },
    approvalStatus: {
      type: String,
      default: USER_APPROVAL_STATUS.PENDING,
    },
    rating: {
      totalRatingSum: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

vendorSchema.plugin(paginate);
vendorSchema.index({ location: GEOLOCATION.LOCATION_INDEX });

vendorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await encryptValue(this.password);
    } catch (error) {
      return next(error instanceof Error ? error : new Error(String(error)));
    }
  }
});

export const Vendor = model<IVendorDocument, PaginateModel<IVendorDocument>>(
  DB_SCHEMA.VENDOR,
  vendorSchema,
);
