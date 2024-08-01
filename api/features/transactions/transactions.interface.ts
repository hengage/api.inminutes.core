import { IWalletDocument } from "../wallet/wallet.interface";

export interface IInitializeTransaction {
  email: string;
  amount: string;
  metadata: {
    customerId: string;
    reason: string;
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
  wallet: IWalletDocument["_id"];
  amount: string;
  recipientCode?: string;
  accountName?: string;
  accountNumber?: string;
  transferCode?: string;
  reference: string;
  reason: string;
  type: string;
  transactionFee: string;
  customer?: string;
  bankName?: string;
  status: string;
  paidAt: Date;
  currency: string;
}

export interface ICreateTransactionHistoryData {
  amount: string;
  wallet?: string;
  reference: string;
  recipientCode?: string;
  customer?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  transferCode?: string;
  status: string;
  type?: "credit" | "debit";
  reason: string;
}

export interface IUpdateTransactionHistoryData {
  reference: string;
  status: string;
  paidAt?: Date;
  channel?: string;
  currency?: string;
}
export interface InitializeCashoutTransferData {
  amount: string;
  walletId: string;
  recipientCode: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  reason: string;
}
