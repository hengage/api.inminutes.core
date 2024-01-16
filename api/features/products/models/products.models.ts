import { Schema, model } from "mongoose";
import { generateUniqueString } from "../../../utils";

const productCategprySchema = new Schema(
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

export const ProductCategory = model("productCategory", productCategprySchema);
