import { Schema, model } from "mongoose";

import { generateUniqueString } from "../../../utils";
import {
  IVendorCategoryDocument,
  IVendorSubCategoryDocument,
} from "../vendors.interface";

const vendorCategorySchema = new Schema<IVendorCategoryDocument>(
  {
    _id: {
      type: String,
      required: true,
      default: () => generateUniqueString(4),
    },
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const vendorSubCategorySchema = new Schema<IVendorSubCategoryDocument>(
  {
    _id: {
      type: String,
      required: true,
      default: () => generateUniqueString(4),
    },
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true, ref: "VendorCategory" },
  },
  { timestamps: true, _id: false }
);

export const VendorSubCategory = model<IVendorSubCategoryDocument>(
  "vendorsubcategory",
  vendorSubCategorySchema
);

export const VendorCategory = model<IVendorCategoryDocument>(
  "vendorcategory",
  vendorCategorySchema
);