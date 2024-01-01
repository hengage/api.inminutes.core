import { Schema, model } from "mongoose";
import { ICustomer } from "../customers.interface";
import {
  encryptValue,
  generateUniqueString,
  toLowerCaseSetter,
} from "../../../utils";

const customerSchema = new Schema<ICustomer>(
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
      set: toLowerCaseSetter,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: toLowerCaseSetter,
    },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
    // _id: false,
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

export const Customer = model<ICustomer>("Customer", customerSchema);
