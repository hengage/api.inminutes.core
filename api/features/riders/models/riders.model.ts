import { Schema, model } from "mongoose";
import { IRiderDocument } from "../riders.interface";
import {
  encryptValue,
  generateUniqueString,
  toLowerCaseSetter,
} from "../../../utils";

const riderSchema = new Schema<IRiderDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    fullName: { type: String, required: true, set: toLowerCaseSetter },
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
    password: { type: String, required: true, unique: true },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number, Number],
        default: [0, 0]
      },
    },
    dateOfBirth: { type: Date, required: true },
    residentialAddress: { type: String, required: true },
  },
  { timestamps: true }
);

riderSchema.index({ location: "2dsphere" });

riderSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await encryptValue(this.password);
    } catch (error: any) {
      return next(error);
    }
  }
});

export const Rider = model<IRiderDocument>("Rider", riderSchema);
