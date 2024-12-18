import { PaginateResult } from "mongoose";
import { ITransactionHistoryDocument } from "../../transactions/transactions.interface";
import { TransactionHistory } from "../../transactions/models/transaction.model";
import { QUERY_LIMIT } from "../../../constants";
import { FilterQuery } from "mongoose";
import { addAmountRangeFilter, addDateRangeFilter, buildFilterQuery } from "../../../utils";

export const adminOpsTransactionsService = {
    async getTransactions(page = 1, filter: GetTransactionsFilter): Promise<PaginateResult<ITransactionHistoryDocument>> {
        const options = {
            sort: { createdAt: -1 },
            page,
            limit: QUERY_LIMIT,
            select: "amount reason status _id reference createdAt",
            lean: true,
            leanWithId: false,
        };

        const filterQuery: FilterQuery<ITransactionHistoryDocument> = {};
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

        const transactions = await TransactionHistory.paginate(filterQuery, options);
        return transactions;
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