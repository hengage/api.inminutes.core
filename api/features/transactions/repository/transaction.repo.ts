import { TransactionHistory } from "../models/transaction.model";
import {
  ITransactionHistoryDocument,
  ICreateTransactionHistoryData,
} from "../transactions.interface";

export class TransactionRepository {
  private TransactionHistoryModel = TransactionHistory;

  async createHistory(
    createTransactionHistoryData: ICreateTransactionHistoryData
  ): Promise<ITransactionHistoryDocument> {
    const transactionHistory = new this.TransactionHistoryModel(
      createTransactionHistoryData
    );
    await transactionHistory.save();
    return transactionHistory.toObject();
  }

  async updateStatus(updateTransactionData: {
    reference: string;
    status: string;
  }): Promise<void> {
    const { reference, status } = updateTransactionData;
    await this.TransactionHistoryModel.findOneAndUpdate(
      { reference },
      { $set: { status } }
    ).select("reference status");
    console.log(
      `Updated transaction with reference:  ${reference}. Status: ${status}`
    );
  }
}
