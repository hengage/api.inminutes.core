import { Schema, model } from "mongoose";
import { generateUniqueString } from "../../../utils";
import {
  IProductCategoryDocument,
  IProductDocument,
} from "../products.interface";

const productCategprySchema = new Schema<IProductCategoryDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const productSchema = new Schema<IProductDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    cost: { type: String, required: true },
    tags: [{ type: String }],
    addOns: [
      {
        item: { type: String },
        cost: { type: String },
      },
    ],
    category: { type: String, required: true, ref: "ProductCategory" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProductCategory = model<IProductCategoryDocument>(
  "productCategory",
  productCategprySchema
);
export const Product = model<IProductDocument>("product", productSchema);
