import { PaginateModel, Schema, model } from "mongoose";
import { generateUniqueString } from "../../../utils";
import { DB_SCHEMA, GEOLOCATION, ORDER_STATUS, ORDER_TYPE, } from "../../../constants";
import { IOrderFeedbackDocument, IOrdersDocument } from "../orders.interface";
import paginate from "mongoose-paginate-v2";

const orderSchema = new Schema<IOrdersDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    customer: { type: String, required: true, ref: DB_SCHEMA.CUSTOMER },
    recipientPhoneNumber: { type: String },
    rider: { type: String, ref: DB_SCHEMA.RIDER, default: null },
    items: [
      {
        product: { type: String, required: true, ref: DB_SCHEMA.PRODUCT },
        quantity: { type: Number, required: true },
        cost: { type: String, required: true },
        vendor: { type: String, required: true, ref: DB_SCHEMA.VENDOR },
        addOns: [
          {
            item: { type: String },
            cost: { type: String },
            _id: false,
          },
        ],
        _id: false,
      },
    ],
    vendor: { type: String, ref: DB_SCHEMA.VENDOR },
    deliveryAddress: { type: String, required: true },
    deliveryLocation: {
      type: { type: String, default: GEOLOCATION.POINT },
      coordinates: { type: [Number, Number], required: true },
    },
    deliveryFee: { type: String, required: true },
    serviceFee: { type: String, default: "0" },
    totalProductsCost: { type: String, required: true },
    totalCost: { type: String, required: true },
    type: { type: String, required: true, enum: Object.values(ORDER_TYPE) },
    scheduledDeliveryTime: { type: Date },
    instruction: { type: String },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

const orderFeedbackSchema = new Schema<IOrderFeedbackDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    order: { type: String, ref: DB_SCHEMA.ORDER },
    remarkOnRider: { type: String },
    remarkOnVendor: { type: String },
    vendorRating: { type: Number },
    riderRating: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

orderSchema.index({ deliveryLocation: GEOLOCATION.LOCATION_INDEX });
orderSchema.plugin(paginate);

export const Order = model<IOrdersDocument, PaginateModel<IOrdersDocument>>(
  DB_SCHEMA.ORDER,
  orderSchema
);

export const OrderFeedback = model<IOrderFeedbackDocument>(
  DB_SCHEMA.ORDER_FEEDBACK, orderFeedbackSchema
);
