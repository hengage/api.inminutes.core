import { HandleException, STATUS_CODES } from "../../../utils";
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

  async getTransactionByReference(reference: string, selectFields: string) {
    const transaction = await TransactionHistory.findOne({ reference })
      .select(selectFields)
      .lean()
      .exec();

    if (!transaction) {
      throw new HandleException(
        STATUS_CODES.NOT_FOUND,
        "Transaction now found"
      );
    }

    return transaction;
  }

  async getHistory(params: {
    walletId: string;
    page?: number;
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    const { walletId, page, startDate, endDate } = params;
    const query: { wallet: string; createdAt?: {} } = {
      wallet: walletId,
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const options = {
      page,
      limit: 10,
      select: "createdAt amount status reason",
      lean: true,
      sort: { createdAt: -1 },
      leanWithId: false,
    };

    return await this.TransactionHistoryModel.paginate(query, options);
  }

  async getDetails(transactionId: string) {
    return this.TransactionHistoryModel.findById(transactionId)
      .select({
        amount: 1,
        status: 1,
        reason: 1,
        reference: 1,
        transactionFee: 1,
        bankName: 1,
        accountName: 1,
        accountNumber: 1,
      })
      .lean()
      .exec();
  }
}
