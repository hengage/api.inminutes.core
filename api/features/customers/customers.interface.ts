import { Document } from "mongoose";

export interface ICustomerDocument extends Document {
  _id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  address: string;
  displayPhoto: string;
}

export interface IUpdateCustomerProfile {
  fullName: string;
  email: string;
  dateOfBirth: Date;
  address: string;
}
