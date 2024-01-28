import { Document } from "mongoose";
import { WALLET_STATUS } from "../../utils";
import { IRiderDocument } from "../riders";
import { IVendorDocument } from "../vendors";

export interface IWalletDocument extends Document {
  _id: string;
  rider: IRiderDocument;
  vendor: IVendorDocument;
  ownerAccountType: string;
  balance: string;
  transactionCount: number;
  totalEarnings: string;
  currency: "NGN";
  withdrawalDetails: [IWithdrawalDetails];
  status: WALLET_STATUS;
}

export interface IWithdrawalDetails {
  channel: string;
  type: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  recipientCode: string;
}
