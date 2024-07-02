import { TransactionHistory } from "../models/transaction.model";
import {
  ITransactionHistoryDocument,
  ICreateTransactionHistoryData,
} from "../transactions.interface";

/**
Repository class for managing transactions and related data.
@class
*/
export class TransactionRepository {
  private TransactionHistoryModel = TransactionHistory;

  /**
  @async
  Creates a new transaction history entry.
  @param {object} createTransactionHistoryData - The data to create the transaction history entry.
  */
  async createHistory(
    createTransactionHistoryData: ICreateTransactionHistoryData
  ): Promise<ITransactionHistoryDocument> {
    const transactionHistory = new this.TransactionHistoryModel(
      createTransactionHistoryData
    );
    await transactionHistory.save();
    return transactionHistory.toObject();
  }

  /**
  @async
  Updates the status of a transaction.
  @param {object} updateTransactionData - The data to update the transaction status.
  @param {string} updateTransactionData.reference - The reference number of the transaction.
  @param {string} updateTransactionData.status - The new status of the transaction.
  */
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
