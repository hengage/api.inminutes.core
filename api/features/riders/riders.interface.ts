import { Document } from "mongoose";

export interface IRiderDocument extends Document {
  _id: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  email: string;
  password: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  h3Index: string;
  dateOfBirth: Date;
  residentialAddress: string;
}
