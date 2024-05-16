import { ClientSession, Document } from "mongoose";
import { WALLET_STATUS } from "../../utils";
import { IRiderDocument } from "../riders";
import { IVendorDocument } from "../vendors";
import { Model } from "mongoose";

export interface IWalletDocument extends Document {
  _id: string;
  rider: IRiderDocument;
  vendor: IVendorDocument;
  balance: string;
  transactionCount: number;
  totalEarnings: string;
  currency: "NGN";
  withdrawalDetails: [IWithdrawalDetails];
  status: WALLET_STATUS;
}


export interface IWalletMethodsDocument extends Model<IWalletDocument> {
  creditWallet(
    dto: {amount: string, riderId?: string, vendorId?: string},
    session?: ClientSession
  ): Promise<IWalletDocument>;
  debitWallet(
    dto: {amount: string, riderId?: string, vendorId?: string},
    session?: ClientSession
  ): Promise<IWalletDocument>;
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
