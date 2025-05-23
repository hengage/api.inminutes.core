import { Schema, model } from "mongoose";

import { generateUniqueString } from "../../../utils";
import {
  IVendorCategoryDocument,
  IVendorSubCategoryDocument,
} from "../vendors.interface";
import { DB_SCHEMA } from "../../../constants";
import paginate  from "mongoose-paginate-v2";
import { PaginateModel } from "mongoose";

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
  { timestamps: true, _id: false },
);

const vendorSubCategorySchema = new Schema<IVendorSubCategoryDocument>(
  {
    _id: {
      type: String,
      required: true,
      default: () => generateUniqueString(4),
    },
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true, ref: DB_SCHEMA.VENDOR_CATEGORY },
  },
  { timestamps: true, _id: false },
);

vendorCategorySchema.plugin(paginate);
interface VendorCategoryModel extends PaginateModel<IVendorCategoryDocument> {}
export const VendorSubCategory = model<IVendorSubCategoryDocument>(
  DB_SCHEMA.VENDOR_SUB_CATEGORY,
  vendorSubCategorySchema,
);

export const VendorCategory = model<IVendorCategoryDocument, VendorCategoryModel>(
  DB_SCHEMA.VENDOR_CATEGORY,
  vendorCategorySchema,
);
