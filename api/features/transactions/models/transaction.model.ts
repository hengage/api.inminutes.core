import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { generateUniqueString } from "../../../utils";
import { ITransactionHistoryDocument } from "../transactions.interface";
import { Currency, DB_SCHEMA, TRANSACTION_TYPE } from "../../../constants";

const transactionHistorySchema = new Schema<ITransactionHistoryDocument>(
  {
    _id: {
      type: String,
      default: () => generateUniqueString(5),
    },
    wallet: { type: String, ref: DB_SCHEMA.WALLET },
    amount: { type: String, required: true },
    reference: { type: String, required: true },
    recipientCode: { type: String },
    reason: { type: String, required: true },
    transferCode: { type: String },
    type: {
      type: String,
      enum: [TRANSACTION_TYPE.CREDIT, TRANSACTION_TYPE.DEBIT],
    },
    customer: { type: String, ref: DB_SCHEMA.CUSTOMER },
    bankName: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    transactionFee: { type: String, default: "0" },
    status: { type: String, default: "pending" },
    paidAt: { type: Date },
    currency: { type: String, default: Currency.NGN },
  },
  { timestamps: true },
);

transactionHistorySchema.plugin(paginate);

export const TransactionHistory = model<
  ITransactionHistoryDocument,
  PaginateModel<ITransactionHistoryDocument>
>("TransactionHistory", transactionHistorySchema);
// Todo: use Transaction as Model name instead of TransactionHistory
