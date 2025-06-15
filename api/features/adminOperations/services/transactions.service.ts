import { PaginateResult } from "mongoose";
import { ITransactionDocument } from "../../transactions/transactions.interface";
import { Transaction } from "../../transactions/models/transaction.model";
import { HTTP_STATUS_CODES } from "../../../constants";
import { FilterQuery } from "mongoose";
import {
  addAmountRangeFilter,
  addDateRangeFilter,
  buildFilterQuery,
  createPaginationOptions,
  HandleException,
  Msg,
} from "../../../utils";

export const adminOpsTransactionsService = {
  async getTransactions(
    page: string | number,
    filter: GetTransactionsFilter,
    limit: string | number
  ): Promise<PaginateResult<ITransactionDocument>> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const options = createPaginationOptions(
      { select: "amount reason status _id reference createdAt" },
      pageNum,

      limitNum
    );

    const filterQuery: FilterQuery<ITransactionDocument> = {};
    if (filter) {
      const { lowestAmount, highestAmount, fromDate, toDate, ...otherFilters } =
        filter;

      // Handle amount range
      addAmountRangeFilter(filterQuery, lowestAmount, highestAmount);

      // Handle date range
      addDateRangeFilter(filterQuery, fromDate, toDate);

      // Handle other filters
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(otherFilters).filter(([, v]) => v !== undefined)
      );

      const searchFields = ["reference", "transferCode"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
    }
    const transactions = await Transaction.paginate(filterQuery, options);
    return transactions;
  },

  async getDetails(transactionId: string): Promise<ITransactionDocument> {
    const transaction = await Transaction.findById(transactionId)
      .select("-updatedAt -__v")
      .lean()
      .exec();

    if (!transaction) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND("transaction", transactionId)
      );
    }

    return transaction as ITransactionDocument;
  },
};

interface GetTransactionsFilter {
  searchQuery?: string;
  status?: string;
  reason?: string;
  type?: string;
  lowestAmount?: string;
  highestAmount?: string;
  fromDate?: string;
  toDate?: string;
}
