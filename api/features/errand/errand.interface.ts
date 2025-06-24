import { Document } from "mongoose";
import { ICustomerDocument } from "../customers";
import { IRiderDocument } from "../riders";
import { ErrandStatus } from "../../constants";
import { Coordinates } from "../../types";

export interface IErrandDocument extends Document {
  _id: string;
  packageType: [IErrandPackageTypeDocument];
  customer: ICustomerDocument["_id"];
  receiver: {
    name: string;
    phoneNumber: string;
  };
  rider: IRiderDocument;
  description?: string;
  pickupAddress: string;
  pickupCoordinates: {
    type: string;
    coordinates: Coordinates;
  };
  dropoffAddress: string;
  dropoffCoordinates: {
    type: string;
    coordinates: Coordinates;
  };
  dispatchFee: string;
  status: ErrandStatus;
  type: "instant" | "scheduled";
  scheduledPickupTime: Date;
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

export interface ICreateErrandData
  extends Pick<
    IErrandDocument,
    | "packageType"
    | "customer"
    | "receiver"
    | "description"
    | "pickupAddress"
    | "pickupCoordinates"
    | "dropoffAddress"
    | "dropoffCoordinates"
    | "dispatchFee"
    | "type"
  > {
  scheduledPickupTime?: Date;
}
