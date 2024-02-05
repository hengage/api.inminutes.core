import { Schema, model } from "mongoose";
import { ORDER_STATUS, generateUniqueString } from "../../../utils";
import { IOrdersDocument } from "../orders.interface";

const orderSchema = new Schema<IOrdersDocument>({
  _id: {
    type: String,
    default: () => generateUniqueString(5),
  },
  customer: { type: String, required: true, ref: "Customer" },
  rider: { type: String, ref: "Rider", default: null },
  items: [
    {
      product: { type: String, required: true, ref: "Product" },
      quantity: { type: Number, required: true },
      cost: { type: String, required: true },
      vendor: { type: String, required: true, ref: "Vendor" },
      addOns: [
        {
          items: { type: String },
          cost: { type: String },
        },
      ],
    },
  ],
  deliveryAddress: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  h3Index: { type: String, required: true, index: true },
  deliveryFee: { type: String, required: true },
  totalProductCost: { type: String, required: true },
  totalCost: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING,
  },
});

orderSchema.index({ deliveryLocation: "2dsphere" });

export const Order = model<IOrdersDocument>("Order", orderSchema);
