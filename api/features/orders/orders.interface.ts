import { Document } from "mongoose";

import { IVendorDocument } from "../vendors";
import { IRiderDocument } from "../riders";
import { ORDER_STATUS } from "../../constants";

export interface IAddOn {
  item: string;
  cost: string;
}

export interface IOrderItems {
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
  rider?: IRiderDocument;
  items: IOrderItems[];
  vendor: IVendorDocument;
  deliveryAddress: string;
  deliveryLocation: {
    type: string;
    coordinates: [number, number];
  };
  h3Index: string;
  deliveryFee: string;
  serviceFee: string;
  totalProductsCost: string;
  totalCost: string;
  type: "instant" | "scheduled";
  scheduledDeliveryTime: Date;
  instruction: string;
  status: ORDER_STATUS;
}

export interface ICreateOrderData {
  items: IOrderItems[];
  recipientPhoneNumber: string;
  vendor: string;
  deliveryAddress: string;
  deliveryLocation: {
    coordinates: [lng: number, lat: number];
  };
  deliveryFee: string;
  serviceFee: string;
  totalProductsCost: string;
  totalCost: string;
  instruction: string;
  type: "instant" | "scheduled";
  scheduledDeliveryTime: Date;
}

export interface IOrderFeedbackDocument {
  _id: string;
  order: IOrdersDocument;
  remarkOnRider: string;
  riderRating: number;
  remarkOnVendor: string;
  vendorRating: number;
}

export interface IOrderRatingAndRemarkData {
  orderId: string;
  remarkOnRider: string;
  riderRating: number;
  remarkOnVendor: string;
  vendorRating: number;
}

export interface IOrderAndMerchantsRatingData {
  orderId: string;
  vendorId: string;
  riderId: string;
  vendorRating: number;
  riderRating: number;
  remarkOnVendor: string;
  remarkOnRider: string;
}
