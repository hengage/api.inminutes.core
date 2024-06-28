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
    recipientCode: { type: String, required: true },
    reason: { type: String, required: true },
    transferCode: { type: String, required: true },
    type: { type: String, required: true, enum: ["credit", "debit"] },
    bank: { type: String },
    bankCode: { type: String },
    accountNumber: { type: String },
    transactionFee: { type: String, default: "0" },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

transactionHistorySchema.plugin(paginate);

export const TransactionHistory = model<
  ITransactionHistoryDocument,
  PaginateModel<ITransactionHistoryDocument>
>("TransactionHistory", transactionHistorySchema);
