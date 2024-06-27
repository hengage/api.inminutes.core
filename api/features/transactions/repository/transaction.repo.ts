import { TransactionHistory } from "../models/transaction.model";
import { ITransactionHistoryDocument, ICreateTransactionHistoryData } from "../transactions.interface";

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
}
