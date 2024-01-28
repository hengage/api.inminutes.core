import { Schema, model } from "mongoose";
import { IWalletDocument } from "../wallet.interface";
import {
  WALLET_STATUS,
  WITHDRAWAL_CHANNEL,
  generateUniqueString,
} from "../../../utils";

const walletSchema = new Schema<IWalletDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(4),
    },
    rider: { type: String, ref: "Rider" },
    vendor: { type: String, ref: "Vendor" },
    balance: { type: String, default: "0" },
    transactionCount: { type: Number, default: 0 },
    totalEarnings: { type: String, default: "0" },
    currency: {
      type: String,
      default: "NGN",
    },
    withdrawalDetails: [
      {
        channel: {
          type: String,
          enum: Object.values(WITHDRAWAL_CHANNEL),
        },
        type: { type: String },
        bankName: String, // For bank names or mobile money service providers
        bankCode: String,
        accountName: String,
        accountNumber: String, // Account number for both bank and mobile money
        currency: String,
        recipientCode: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(WALLET_STATUS),
      default: WALLET_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWalletDocument>("Wallet", walletSchema);
