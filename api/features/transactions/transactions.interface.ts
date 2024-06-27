import { IRiderDocument } from "../riders";
import { IVendorDocument } from "../vendors";
import { IWalletDocument } from "../wallet/wallet.interface";

export interface IInitializeTransaction {
  email: string;
  amount: string;
  metadata: {
    customerId: string;
    purpose: string;
    orderId: string; //orderId represents orders for item purchase and delivery pickup
    vendorId?: string;
  };
}

export interface ICreateTransferRecipient {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  currency: string;
  recipientType: string;
  metadata: {
    channel: string;
  };
}

export interface ITransactionHistoryDocument extends Document {
  _id: string;
  wallet: IWalletDocument;
  amount: string;
  recipientCode?: string;
  transferCode?: string;
  reference: string;
  reason: string;
  transactionFee: string;
  bank?: string;
  bankCode?: string;
  accountNumber?: string;
  status: string;
  currency: string;
}

export interface ICreateTransactionHistoryData {
  amount: string;
  wallet: string;
  reference: string;
  recipientCode?: string;
  transferCode?: string;
  status: string;
  type: "credit" | "debit";
  reason: string;
}

export interface InitializeTransferData {
  amount: string;
  recipientCode: string;
  reason: string;
  walletId: string;
}
