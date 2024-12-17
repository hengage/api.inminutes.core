import { PaginateResult } from "mongoose";
import { ITransactionHistoryDocument } from "../../transactions/transactions.interface";
import { TransactionHistory } from "../../transactions/models/transaction.model";
import { QUERY_LIMIT } from "../../../constants";

export const adminOpsTransactionsService = {
    async getTransactions(page = 1): Promise<PaginateResult<ITransactionHistoryDocument>> {
        const options = {
            sort: { createdAt: -1 },
            page,
            limit: QUERY_LIMIT,
            lean: true,
            leanWithId: false,
        };

        const transactions = await TransactionHistory.paginate({}, options);

        return transactions;
    }
}