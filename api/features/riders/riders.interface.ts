import { Document } from "mongoose";

export interface IRiderDocument extends Document {
  _id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  residentialAddress: string;
}
