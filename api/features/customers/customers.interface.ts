import { Document } from "mongoose";
import { Coordinates } from "../../types";

// type BasicCustomerInfo = Record<
//   | "fullName"
//   | "displayName"
//   | "phoneNumber"
//   | "email"
//   | "password"
//   | "deliveryAddress"
//   | "displayPhoto",
//   string
// >;

enum BasicUserData {
  fullName = "fullName",
  displayName = "displayName",
  phoneNumber = "phoneNumber",
  email = "email",
  password = "password",
  deliveryAddress = "deliveryAddress",
  displayPhoto = "displayPhoto",
}

type BasicCustomerInfo = Record<BasicUserData, string>;
export interface ICustomerDocument extends Document, BasicCustomerInfo {
  _id: string;
  dateOfBirth: Date;
  deliveryAddressCoords: {
    type: string;
    coordinates: Coordinates;
  };
}

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
    Pick<
      ICustomerDocument,
      BasicUserData.fullName | BasicUserData.displayPhoto | "dateOfBirth"
    >
  > {}

// export interface IUpdateCustomerProfile
//   extends Partial<
//     Pick<ICustomerDocument, "fullName" | "email" | "dateOfBirth">
//   > {}

export interface ICreateCustomerData
  extends Omit<BasicCustomerInfo, "displayPhoto"> {
  dateOfBirth: string;
}
