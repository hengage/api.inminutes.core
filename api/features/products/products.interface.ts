import { Document } from "mongoose";
import { IVendorDocument } from "../vendors";

export interface IProductCategoryDocument extends Document {
  _id: string;
  name: string;
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
  approved: boolean;
}
