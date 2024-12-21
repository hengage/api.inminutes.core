import { PaginateResult } from "mongoose";
import { ITransactionDocument } from "../../transactions/transactions.interface";
import { Transaction } from "../../transactions/models/transaction.model";
import { HTTP_STATUS_CODES, QUERY_LIMIT } from "../../../constants";
import { FilterQuery } from "mongoose";
import { addAmountRangeFilter, addDateRangeFilter, buildFilterQuery, HandleException, Msg } from "../../../utils";

export const adminOpsTransactionsService = {
    async getTransactions(page = 1, filter: GetTransactionsFilter): Promise<PaginateResult<ITransactionDocument>> {
        const options = {
            sort: { createdAt: -1 },
            page,
            limit: QUERY_LIMIT,
            select: "amount reason status _id reference createdAt",
            lean: true,
            leanWithId: false,
        };

        const filterQuery: FilterQuery<ITransactionDocument> = {};
        if (filter) {
            const { lowestAmount, highestAmount, fromDate, toDate, ...otherFilters } = filter;

            // Handle amount range
            addAmountRangeFilter(filterQuery, lowestAmount, highestAmount);

            // Handle date range 
            addDateRangeFilter(filterQuery, fromDate, toDate);

            // Handle other filters
            const recordFilter: Record<string, string> = Object.fromEntries(
                Object.entries(otherFilters).filter(([_, v]) => v !== undefined),
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
                Msg.ERROR_NOT_FOUND('transaction', transactionId)
            );
        }

        return transaction as ITransactionDocument;
    }
}


interface GetTransactionsFilter {
    searchQuery?: string;
    status?: string;
    reason?: string
    type?: string;
    lowestAmount?: string;
    highestAmount?: string;
    fromDate?: string;
    toDate?: string;
}