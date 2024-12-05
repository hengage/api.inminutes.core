import { PaginateModel, Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";
import {
  encryptValue,
  generateUniqueString,
  toLowerCaseSetter,
} from "../../../utils";
import { IRiderDocument } from "../riders.interface";
import { ACCOUNT_STATUS } from "../../../constants";

const riderSchema = new Schema<IRiderDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    fullName: {
      type: String, required: true,
      set: function (value: string) {
        return toLowerCaseSetter(value);
      }
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
    password: { type: String, required: true, unique: true },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number, Number],
        default: [0, 0],
      },
    },
    dateOfBirth: { type: Date, required: true },
    residentialAddress: { type: String, required: true },
    currentlyWorking: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      default: ACCOUNT_STATUS.ACTIVE,
      enum: Object.values(ACCOUNT_STATUS),
    },
    rating: {
      totalRatingSum: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

riderSchema.index({ location: "2dsphere" });
riderSchema.plugin(paginate);

riderSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await encryptValue(this.password);
    } catch (error: any) {
      return next(error);
    }
  }
});

export const Rider = model<
  IRiderDocument,
  PaginateModel<IRiderDocument>
>("Rider", riderSchema);
