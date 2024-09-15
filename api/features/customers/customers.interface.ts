import { Document } from "mongoose";
import { Coordinates } from "../../types";

type BasicCustomerInfo = Record<
  | "fullName"
  | "displayName"
  | "phoneNumber"
  | "email"
  | "password"
  | "deliveryAddress"
  | "displayPhoto",
  string
>;

export interface ICustomerDocument extends Document, BasicCustomerInfo {
  _id: string;
  dateOfBirth: Date;
  deliveryAddressCoords: {
    type: string;
    coordinates: Coordinates;
  };
}
export interface IUpdateCustomerProfile
  extends Partial<
    Pick<ICustomerDocument, "fullName" | "email" | "dateOfBirth">
  > {}

export interface ICreateCustomerData
  extends Omit<BasicCustomerInfo, "displayPhoto"> {
  dateOfBirth: string;
}
