import { Request, Response } from "express";
import { adminOpsTransactionsService } from "../services/transactions.service";
import { HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse, handleSuccessResponse } from "../../../utils/response.utils";

export const adminOpsTransactionsController = {
    async getTransactions(req: Request, res: Response) {
        try {
            const transactions = await adminOpsTransactionsService.getTransactions(
                req.query.page as unknown as number,
                {
                    searchQuery: req.query.searchQuery as string,
                    status: req.query.status as string,
                    reason: req.query.reason as string,
                    type: req.query.type as string,
                    lowestAmount: req.query.lowestAmount as string,
                    highestAmount: req.query.highestAmount as string,
                    fromDate: req.query.fromDate as string,
                    toDate: req.query.toDate as string
                },
                req.query.limit as unknown as number,
            )

            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { transactions })
        } catch (error: unknown) {
            console.error("Error getting transactions: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },

    async getDetails(req: Request, res: Response) {
        try {
            const transaction = await adminOpsTransactionsService.getDetails(req.params.transactionId)
            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { transaction })

        } catch (error: unknown) {
            console.error("Error getting transaction details: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    }
}