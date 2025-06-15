import { FilterQuery, PaginateResult } from "mongoose";
import { HTTP_STATUS_CODES } from "../../../constants";
import {
  addAmountRangeFilter,
  addDateRangeFilter,
  buildFilterQuery,
  createPaginationOptions,
  excludeObjectKeys,
  HandleException,
  Msg,
} from "../../../utils";
import { Transaction } from "../../transactions/models/transaction.model";
import { ITransactionDocument } from "../../transactions/transactions.interface";
import { GetTransactionsQueryParams } from "../interfaces/transactions.interface";

export const adminOpsTransactionsService = {
  async getTransactions(
    filter: GetTransactionsQueryParams
  ): Promise<PaginateResult<ITransactionDocument>> {
    const page = Number(filter.page);
    const limit = Number(filter.limit);

    const options = createPaginationOptions(
      { select: "amount reason status _id reference createdAt" },
      isNaN(page) ? undefined : page,
      isNaN(limit) ? undefined : limit
    );

    const filterQuery: FilterQuery<ITransactionDocument> = {};
    if (filter) {
      const { lowestAmount, highestAmount, fromDate, toDate, ...otherFilters } =
        filter;

      // Handle amount range
      addAmountRangeFilter(filterQuery, lowestAmount, highestAmount);

      // Handle date range
      addDateRangeFilter(filterQuery, fromDate, toDate);

      const queryFilters: Partial<GetTransactionsQueryParams> =
        excludeObjectKeys(otherFilters, ["page", "limit", "sortOrder"]);

      const searchFields = ["reference", "transferCode"];
      buildFilterQuery(queryFilters, filterQuery, searchFields);
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
