import { Request, Response } from "express";
import { adminOpsTransactionsService } from "../services/transactions.service";
import { HTTP_STATUS_CODES } from "../../../constants";
import {
  handleErrorResponse,
  handleSuccessResponse,
} from "../../../utils/response.utils";
import { GetTransactionsQueryParams } from "../interfaces/transactions.interface";
import { ValidateAdminOpsTransactions } from "../validators/adminOpsTransactions.validate";

export const adminOpsTransactionsController = {
  async getTransactions(req: Request, res: Response) {
    try {
      const query: GetTransactionsQueryParams = req.query;
      await ValidateAdminOpsTransactions.getList(query);
      const transactions =
        await adminOpsTransactionsService.getTransactions(query);

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { transactions });
    } catch (error: unknown) {
      console.error("Error getting transactions: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },

  async getDetails(req: Request, res: Response) {
    try {
      const transaction = await adminOpsTransactionsService.getDetails(
        req.params.transactionId
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { transaction });
    } catch (error: unknown) {
      console.error("Error getting transaction details: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  },
};
