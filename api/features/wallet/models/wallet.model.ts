import { ClientSession, Schema, model } from "mongoose";

import Big from "big.js";

import { IWalletDocument, IWalletMethodsDocument } from "../wallet.interface";
import {
  CASHOUT_CHANNEL,
  HandleException,
  STATUS_CODES,
  WALLET_STATUS,
  generateUniqueString,
} from "../../../utils";

const walletSchema = new Schema<IWalletDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(4),
    },
    rider: { type: String, ref: "Rider", index: true },
    vendor: { type: String, ref: "Vendor", index: true },
    balance: { type: String, default: "0" },
    transactionCount: { type: Number, default: 0 },
    totalEarnings: { type: String, default: "0" },
    currency: {
      type: String,
      default: "NGN",
    },
    cashoutAccounts: {
      type: [
        {
          channel: {
            type: String,
            enum: Object.values(CASHOUT_CHANNEL),
          },
          bankName: String,
          bankCode: String,
          accountName: String,
          accountNumber: String,
          currency: { type: String, default: "NGN" },
          recipientType: { type: String, default: "nuban" },
          recipientCode: String,
          _id: false,
        },
      ],
    },
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

walletSchema.pre("validate", function (next) {
  if (this.cashoutAccounts.length >= 3) {
    next(new Error("You can only have a maximum of two accounts for cashout"));
  } else {
    next();
  }
});

walletSchema.statics.creditWallet = async function (
  dto: { amount: string; riderId?: string; vendorId?: string },
  session?: ClientSession
) {
  const query: { rider?: string; vendor?: string } = {};

  if (dto.riderId) {
    query.rider = dto.riderId;
  } else {
    query.vendor = dto.vendorId;
  }

  const wallet = await this.findOne(query)
    .select("balance totalEarnings transactionCount")
    .session(session);

  if (!wallet) {
    throw new HandleException(STATUS_CODES.NOT_FOUND, "wallet not found");
  }

  wallet.balance = Big(wallet.balance).plus(dto.amount);
  wallet.totalEarnings = Big(wallet.totalEarnings).plus(dto.amount);
  wallet.transactionCount++;
  await wallet.save({ session });

  return wallet;
};

walletSchema.statics.debitWallet = async function (
  dto: { amount: string; riderId?: string; vendorId?: string },
  session?: ClientSession
) {
  const query: { rider?: string; vendor?: string } = {};

  if (dto.riderId) {
    query.rider = dto.riderId;
  } else {
    query.vendor = dto.vendorId;
  }

  const wallet = await this.findOne(query)
    .select("balance totalEarnings")
    .session(session);

  if (!wallet) {
    throw new HandleException(STATUS_CODES.NOT_FOUND, "wallet not found");
  }

  wallet.balance = Big(wallet.balance).minus(dto.amount);
  await wallet.save({ session });

  return wallet;
};

export const Wallet = model<IWalletDocument, IWalletMethodsDocument>(
  "Wallet",
  walletSchema
);
