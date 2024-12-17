import { Request, Response } from "express";
import { adminOpsTransactionsService } from "../services/transactions.service";
import { HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse, handleSuccessResponse } from "../../../utils/response.utils";

export const adminOpsTransactionsController = {
    async getTransactions(req: Request, res: Response) {

        try {
            const transactions = await adminOpsTransactionsService.getTransactions(
                req.query.page as unknown as number)

            handleSuccessResponse(res, HTTP_STATUS_CODES.OK, transactions)
        } catch (error: unknown) {
            console.error("Error getting transactions: ", error);
            const { statusCode, errorJSON } = handleErrorResponse(error);
            res.status(statusCode).json(errorJSON);
        }
    },
};
