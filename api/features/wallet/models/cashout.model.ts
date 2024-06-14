import { PaginateModel, Schema, model } from "mongoose";

import paginate from "mongoose-paginate-v2";

import { generateUniqueString } from "../../../utils";
import { ICashoutHistoryDocument } from "../wallet.interface";

const cashoutHistorySchema = new Schema<ICashoutHistoryDocument>({
  _id: {
    type: String,
    default: () => generateUniqueString(5),
  },
  wallet: { type: String, ref: "Wallet" },
  vendor: { type: String, ref: "Vendor" },
  rider: { type: String, ref: "Rider" },
  amount: { type: String, required: true },
  recipientCode: { type: String, required: true },
  reason: { type: String, required: true },
  transferCode: { type: String, required: true },
  bank: { type: String },
  bankCode: { type: String },
  accountNumber: { type: String },
  transactionFee: { type: String, default: "0" },
  status: { type: String, required: true },
});

cashoutHistorySchema.plugin(paginate);

export const CashoutHistory = model<
  ICashoutHistoryDocument,
  PaginateModel<ICashoutHistoryDocument>
>("CashoutHistory", cashoutHistorySchema);
