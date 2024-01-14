import { Document } from "mongoose";
import { ACCOUNT_STATUS, PAYMENT_OPTIONS } from "../../utils";

export interface IVendorDocument extends Document {
  _id: string;
  businessName: string;
  businessLogo: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  residentialAddress: string;
  paymentOptions: PAYMENT_OPTIONS[];
  accountStatus: ACCOUNT_STATUS;
  approved: boolean;
  rating: {
    totalRatingSum: number;
    ratingCount: number;
    averageRating: number;
  };
}

export interface IVendorSignup {
  businessName: string;
  businessLogo: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: string;
  residentialAddress: string;
  location: [number, number];
}
