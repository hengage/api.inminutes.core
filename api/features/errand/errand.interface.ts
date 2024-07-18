import { Document } from "mongoose";
import { ICustomerDocument } from "../customers";
import { IRiderDocument } from "../riders";
import { ErrandStatus } from "../../utils/constants.utils";

export interface IErrandDocument extends Document {
  _id: string;
  packageType: [IErrandPackageTypeDocument];
  customer: ICustomerDocument["_id"];
  receiver: {
    name: string;
    phoneNumber: string;
  };
  rider: IRiderDocument["_id"];
  description?: string;
  pickupAddress: string;
  pickupCoordinates: {
    type: string;
    coordinates: [number, number];
  };
  dropoffAddress: string;
  dropoffCoordinates: {
    type: string;
    coordinates: [number, number];
  };
  dispatchFee: string;
  status: ErrandStatus;
  type: "instant" | "scheduled";
  scheduledPickUpTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IErrandPackageTypeDocument extends Document {
  _id: string;
  packageType: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateErrandData {
  packageType: [IErrandPackageTypeDocument];
  customer: ICustomerDocument["_id"];
  receiver: {
    name: string;
    phoneNumber: string;
  };
  description?: string;
  pickupAddress: string;
  pickupCoordinates: {
    type: string;
    coordinates: [number, number];
  };
  dropoffAddress: string;
  dropoffCoordinates: {
    type: string;
    coordinates: [number, number];
  };
  dispatchFee: string;
  type: "instant" | "scheduled";
  scheduledPickUpTime?: Date;
}
