import { Document } from "mongoose";

export interface ProductCategory extends Document {
  _id: string;
  name: string;
}
