import { Document } from "mongoose";

export interface ICustomerDocument extends Document {
  _id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  deliveryAddress: string;
  deliveryAddressCoords: {
    type: string;
    coordinates: [number, number];
  };
  displayPhoto: string;
}

export interface IUpdateCustomerProfile {
  fullName: string;
  email: string;
  dateOfBirth: Date;
  address: string;
}

export interface ICreateCustomerData {
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  dateOfBirth: string;
  deliveryAddress: string;
}
