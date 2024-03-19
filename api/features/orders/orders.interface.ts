import { Document } from "mongoose";

import { ORDER_STATUS } from "../../utils";
import { IVendorDocument } from "../vendors";

export interface IAddOn {
  item: string;
  cost: string;
}

export interface IOrderItem {
  product: string;
  quantity: number;
  cost: string;
  vendor: IVendorDocument["_id"];
  addOns?: IAddOn[];
}

export interface IOrdersDocument extends Document {
  _id: string;
  customer: string;
  recipientPhoneNumber: string;
  rider?: string;
  items: IOrderItem[];
  vendor: IVendorDocument;
  deliveryAddress: string;
  deliveryLocation: {
    type: string;
    coordinates: [number, number];
  };
  h3Index: string;
  deliveryFee: string;
  totalProductsCost: string;
  totalCost: string;
  type: "instant" | "scheduled";
  scheduledDeliveryTime: Date;
  instruction: string;
  status: ORDER_STATUS;
}
