import { PaginateModel, Schema, model } from "mongoose";
import { ICustomerDocument } from "../customers.interface";
import {
  encryptValue,
  generateUniqueString,
  toLowerCaseSetter,
} from "../../../utils";
import { ACCOUNT_STATUS, DB_SCHEMA, GEOLOCATION } from "../../../constants";
import paginate from "mongoose-paginate-v2";

const customerSchema = new Schema<ICustomerDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    fullName: {
      type: String,
      required: true,
      set: function (value: string) {
        return toLowerCaseSetter(value);
      },
    },
    displayName: {
      type: String,
      required: true,
      unique: true,
      set: function (value: string) {
        return toLowerCaseSetter(value);
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: function (value: string) {
        return toLowerCaseSetter(value);
      },
    },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    deliveryAddress: { type: String },
    deliveryAddressCoords: {
      type: { type: String, default: GEOLOCATION.POINT },
      coordinates: { type: [Number, Number] },
    },
    accountStatus: {
      type: String,
      default: ACCOUNT_STATUS.ACTIVE,
      enum: Object.values(ACCOUNT_STATUS),
    },
    displayPhoto: { type: String },
  },
  {
    timestamps: true,
  },
);

customerSchema.plugin(paginate);

customerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await encryptValue(this.password);
    } catch (error: any) {
      return next(error);
    }
  }
});

export const Customer = model<ICustomerDocument, PaginateModel<ICustomerDocument>>(
  DB_SCHEMA.CUSTOMER,
  customerSchema,
);
