import { Document } from "mongoose";
import { IVendorDocument } from "../vendors";
import { PRODUCT_STATUS } from "../../constants";

export interface IProductCategoryDocument extends Document {
  _id: string;
  name: string;
}

export interface IProductSubCategoryDocument extends Document {
  _id: string;
  name: string;
  category: IProductCategoryDocument;
}

export interface IProductDocument extends Document {
  _id: string;
  name: string;
  image: string;
  description: string;
  quantity: number;
  cost: string;
  tags: string[];
  addOns: [{ item: string; cost: string }];
  category: IProductCategoryDocument;
  vendor: IVendorDocument["_id"];
  status: PRODUCT_STATUS;
  isDeleted: boolean;
}

export interface IAddProductData extends Document {
  name: string;
  image: string;
  description: string;
  quantity: number;
  cost: string;
  category: string;
  tags: Array<string>;
  addOns: Array<string>;
}
export interface IWishListDocument extends Document {
  _id: string;
  customer: string;
  products: Array<IProductDocument["_id"]>;
}
