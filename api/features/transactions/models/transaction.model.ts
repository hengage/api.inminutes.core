import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { generateUniqueString } from "../../../utils";
import { ITransactionHistoryDocument } from "../transactions.interface";

const transactionHistorySchema = new Schema<ITransactionHistoryDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    wallet: { type: String, ref: "Wallet" },
    amount: { type: String, required: true },
    reference: { type: String, required: true },
    recipientCode: { type: String },
    reason: { type: String, required: true },
    transferCode: { type: String, },
    type: { type: String, enum: ["credit", "debit"] },
    customer: { type: String, ref: "Customer" },
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    transactionFee: { type: String, default: "0" },
    status: { type: String, default: "pending" },
    paidAt: {type: Date},
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true }
);

transactionHistorySchema.plugin(paginate);

export const TransactionHistory = model<
  ITransactionHistoryDocument,
  PaginateModel<ITransactionHistoryDocument>
>("TransactionHistory", transactionHistorySchema);
