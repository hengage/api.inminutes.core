import { PaginateResult } from "mongoose";
import { ITransactionHistoryDocument } from "../../transactions/transactions.interface";
import { TransactionHistory } from "../../transactions/models/transaction.model";
import { QUERY_LIMIT } from "../../../constants";
import { FilterQuery } from "mongoose";
import { buildFilterQuery } from "../../../utils/db.utils";
import { DateTime } from "luxon";

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
            if (lowestAmount || highestAmount) {
                filterQuery.$expr = {
                    $and: []
                };
                if (lowestAmount) {
                    filterQuery.$expr.$and.push({
                        $gte: [{ $convert: { input: "$amount", to: "double" } }, parseFloat(lowestAmount)]
                    });
                }
                if (highestAmount) {
                    filterQuery.$expr.$and.push({
                        $lte: [{ $convert: { input: "$amount", to: "double" } }, parseFloat(highestAmount)]
                    });
                }
            }
            // Handle date range
            if (fromDate || toDate) {
                filterQuery.createdAt = {};
                if (fromDate) {
                    filterQuery.createdAt.$gte = DateTime.fromISO(fromDate).startOf('day').toJSDate();
                }
                if (toDate) {
                    filterQuery.createdAt.$lte = DateTime.fromISO(toDate).endOf('day').toJSDate();
                }
            }
            // Handle other filters
            const recordFilter: Record<string, string> = Object.fromEntries(
                Object.entries(otherFilters).filter(([_, v]) => v !== undefined),
            );

            const searchFields = ["reference", "transferCode"];
            console.log(filterQuery);

            buildFilterQuery(recordFilter, filterQuery, searchFields);
        }
        console.log(filterQuery);

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