import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { DB_SCHEMA, PRODUCT_STATUS } from "../../../constants";
import { generateUniqueString } from "../../../utils";
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
  { timestamps: true },
);

productCategorySchema.plugin(paginate);

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
    category: { type: String, required: true, ref: DB_SCHEMA.PRODUCT_CATEGORY },
    vendor: { type: String, required: true, ref: DB_SCHEMA.VENDOR },
    status: {
      type: String,
      default: PRODUCT_STATUS.PENDING,
      enum: Object.values(PRODUCT_STATUS),
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.plugin(paginate);

const wishListSchema = new Schema<IWishListDocument>({
  _id: {
    type: String,
    default: () => generateUniqueString(5),
  },
  customer: { type: String, ref: DB_SCHEMA.CUSTOMER, required: true },
  products: [{ type: String, ref: DB_SCHEMA.PRODUCT }],
});

export const ProductCategory = model<IProductCategoryDocument, PaginateModel<IProductCategoryDocument>>(
  DB_SCHEMA.PRODUCT_CATEGORY,
  productCategorySchema,
);
export const Product = model<IProductDocument, PaginateModel<IProductDocument>>(
  DB_SCHEMA.PRODUCT,
  productSchema,
);

export const WishList = model<IWishListDocument>(
  DB_SCHEMA.WISHLIST,
  wishListSchema,
);
