import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { PRODUCT_STATUS, generateUniqueString } from "../../../utils";
import {
  IProductCategoryDocument,
  IProductDocument,
  IWishListDocument,
} from "../products.interface";

const productCategorySchema = new Schema<IProductCategoryDocument>(
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
    name: { type: String, required: true, index: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    cost: { type: String, required: true },
    tags: [{ type: String }],
    addOns: [
      {
        item: { type: String },
        cost: { type: String },
        _id: false,
      },
    ],
    category: { type: String, required: true, ref: "ProductCategory" },
    vendor: { type: String, required: true, ref: "Vendor" },
    status: {
      type: String,
      default: PRODUCT_STATUS.PENDING,
      enum: Object.values(PRODUCT_STATUS),
    },
  },
  { timestamps: true }
);

productSchema.plugin(paginate);

const wishListSchema = new Schema<IWishListDocument>({
  _id: {
    type: String,
    default: () => generateUniqueString(5),
  },
  customer: { type: String, ref: "Customer", required: true },
  products: [{ type: String, ref: "Product" }],
});

export const ProductCategory = model<IProductCategoryDocument>(
  "ProductCategory",
  productCategorySchema
);
export const Product = model<IProductDocument, PaginateModel<IProductDocument>>(
  "Product",
  productSchema
);

export const WishList = model<IWishListDocument>("WishList", wishListSchema);
