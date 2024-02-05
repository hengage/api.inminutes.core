import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { IVendorDocument } from "../vendors.interface";
import {
  ACCOUNT_STATUS,
  PAYMENT_OPTIONS,
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
      set: toLowerCaseSetter,
    },
    businessLogo: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      set: toLowerCaseSetter,
    },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number, Number],
      },
    },
    h3Index: { type: String, index: true },
    residentialAddress: { type: String, required: true },
    category: { type: String, required: true, ref: "VendorCategory" },
    subCategory: { type: String, ref: "VendorSubCategory" },
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
    approved: { type: Boolean, default: false },
    rating: {
      totalRatingSum: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

vendorSchema.plugin(paginate);
vendorSchema.index({ location: "2dsphere" });

vendorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await encryptValue(this.password);
    } catch (error: any) {
      return next(error);
    }
  }
});

export const Vendor = model<IVendorDocument, PaginateModel<IVendorDocument>>(
  "Vendor",
  vendorSchema
);
