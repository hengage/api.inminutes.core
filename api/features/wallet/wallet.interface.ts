import { ClientSession, Document } from "mongoose";
import { WALLET_STATUS } from "../../utils";
import { IRiderDocument } from "../riders";
import { IVendorDocument } from "../vendors";
import { Model } from "mongoose";

export interface IWalletDocument extends Document {
  _id: string;
  merchantId: string; // Can be rider ID or vendor ID
  merchantType: 'rider' | 'vendor';
  balance: string;
  transactionCount: number;
  totalEarnings: string;
  currency: "NGN";
  cashoutAccounts: [ICashoutAccount];
  status: WALLET_STATUS;
}

export interface IWalletMethodsDocument extends Model<IWalletDocument> {
  creditWallet(
    data: { amount: string; walletId?: string },
    session?: ClientSession
  ): Promise<IWalletDocument>;
  debitWallet(
    data: { amount: string; walletId?: string },
    session?: ClientSession
  ): Promise<IWalletDocument>;
}

export interface ICashoutAccount {
  channel: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  recipientType: string;
  recipientCode: string;
}
