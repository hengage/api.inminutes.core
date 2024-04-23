import { Schema, model } from "mongoose";
import { ICustomerDocument } from "../customers.interface";
import {
  encryptValue,
  generateUniqueString,
  toLowerCaseSetter,
} from "../../../utils";

const customerSchema = new Schema<ICustomerDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    fullName: {
      type: String,
      required: true,
      set: toLowerCaseSetter,
    },
    displayName: {
      type: String,
      required: true,
      unique: true,
      set: toLowerCaseSetter,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: toLowerCaseSetter,
    },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    deliveryAddress: { type: String },
    deliveryAddressCoords: { 
      type: { type: String, default: "Point" },
      coordinates: { type: [Number, Number] },
     },
    displayPhoto: { type: String },
  },
  {
    timestamps: true,
  }
);

customerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await encryptValue(this.password);
    } catch (error: any) {
      return next(error);
    }
  }
});

export const Customer = model<ICustomerDocument>("Customer", customerSchema);
