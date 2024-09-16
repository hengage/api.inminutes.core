import { ClientSession, Schema, model } from "mongoose";

import Big from "big.js";

import { IWalletDocument, IWalletMethodsDocument } from "../wallet.interface";
import {
  // CASHOUT_CHANNEL,
  // CASHOUT_CHANNEL,
  HandleException,
  HTTP_STATUS_CODES,
  // WALLET_STATUS,
  generateUniqueString,
} from "../../../utils";
import { CASHOUT_CHANNEL, WALLET_STATUS } from "../../../config/constants.config";

const walletSchema = new Schema<IWalletDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(4),
    },
    merchantId: {
      type: String,
      required: true,
    },
    merchantType: {
      type: String,
      required: true,
      enum: ["rider", "vendor"],
    },
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
  if (Array.isArray(this.cashoutAccounts) && this.cashoutAccounts.length >= 3) {
    next(new Error("You can only have a maximum of two accounts for cashout"));
  } else {
    next();
  }
});

walletSchema.statics.creditWallet = async function (
  creditData: {
    amount: string;
    walletId: string;
  },
  session: ClientSession
) {
  const { amount, walletId } = creditData;

  const wallet = await this.findById(walletId).select(
    "balance merchantId transactionCount totalEarnings"
  ).session(session);

  if (!wallet) {
    throw new HandleException(HTTP_STATUS_CODES.NOT_FOUND, "wallet not found");
  }

  wallet.balance = Big(wallet.balance).plus(amount).toFixed(2);
  wallet.totalEarnings = Big(wallet.totalEarnings).plus(amount).toFixed(2);
  wallet.transactionCount++;
  await wallet.save({session});
  return wallet;
};

walletSchema.statics.debitWallet = async function (
  debitData: { amount: string; walletId: string },
  session: ClientSession
) {
  const { amount, walletId } = debitData;

  const wallet = await this.findById(walletId)
    .select("balance transactionCount")
    .session(session);

  if (!wallet) {
    throw new HandleException(HTTP_STATUS_CODES.NOT_FOUND, "wallet not found");
  }

  if (Big(wallet.balance).lt(Big(amount))) {
    throw new HandleException(
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
      "Insufficient balance"
    );
  }
  wallet.balance = Big(wallet.balance).minus(amount).toFixed(2);
  wallet.transactionCount++;
  await wallet.save({ session });
  return wallet;
};

export const Wallet = model<IWalletDocument, IWalletMethodsDocument>(
  "Wallet",
  walletSchema
);
