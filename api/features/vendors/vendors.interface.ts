import { Document } from "mongoose";
import { ACCOUNT_STATUS, PAYMENT_OPTIONS, USER_APPROVAL_STATUS } from "../../constants";

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
  h3Index: string,
  residentialAddress: string;
  category: IVendorCategoryDocument;
  subCategory: IVendorSubCategoryDocument;
  paymentOptions: PAYMENT_OPTIONS[];
  accountStatus: ACCOUNT_STATUS;
  approvalStatus: USER_APPROVAL_STATUS
  approved: boolean;
  rating: {
    totalRatingSum: number;
    ratingCount: number;
    averageRating: number;
  };
}

export interface IVendorSignupData {
  businessName: string;
  businessLogo: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: string;
  location: [number, number];
  residentialAddress: string;
  category: string;
  subCategory: string;
}

export interface IVendorCategoryDocument {
  _id: string;
  name: string;
  image: string;
}

export interface IVendorSubCategoryDocument {
  _id: string;
  name: string;
  category: IVendorCategoryDocument;
}
