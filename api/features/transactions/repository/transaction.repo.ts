import { ClientSession } from "mongoose";
import { createPaginationOptions, HandleException } from "../../../utils";
import { Transaction } from "../models/transaction.model";
import {
  ITransactionDocument,
  ICreateTransactionData,
  IUpdateTransactionData,
} from "../transactions.interface";
import { HTTP_STATUS_CODES } from "../../../constants";

/**
Repository class for managing transactions and related data.
@class
*/
export class TransactionRepository {
  private TransactionModel = Transaction;

  /**
  @async
  Creates a new transaction history entry.
  @param {object} createTransactionHistoryData - The data to create the transaction history entry.
  */
  async createHistory(
    createTransactionData: ICreateTransactionData,
    session?: ClientSession,
  ): Promise<ITransactionDocument> {
    const transaction = new this.TransactionModel(
      createTransactionData,
    );
    await transaction.save({ session });
    return transaction.toObject();
  }

  /**
  @async
  Updates the status of a transaction.
  @param {object} updateTransactionData - The data to update the transaction status.
  @param {string} updateTransactionData.reference - The reference number of the transaction.
  @param {string} updateTransactionData.status - The new status of the transaction.
  */
  async updateStatus(
    updateTransactionData: IUpdateTransactionData,
  ): Promise<void> {
    const { reference, ...updateFields } = updateTransactionData;
    await this.TransactionModel.findOneAndUpdate(
      { reference },
      { $set: updateFields },
    );
    console.log(`Updated transaction with reference:  ${reference}`);
  }

  async getTransactionByReference(reference: string, selectFields: string) {
    const transaction = await Transaction.findOne({ reference })
      .select(selectFields)
      .lean()
      .exec();

    if (!transaction) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Transaction now found",
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

    const options = createPaginationOptions(page, {
      select: "createdAt amount status reason",
      limit: 20
    });

    return await this.TransactionModel.paginate(query, options);
  }

  async getDetails(transactionId: string) {
    return this.TransactionModel.findById(transactionId)
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
