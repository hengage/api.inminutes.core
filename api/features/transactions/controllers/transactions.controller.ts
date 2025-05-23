import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { paymentTransactionService } from "../services/paymentTransaction.service";
import { validateTransactions } from "../validation/transactions.validate";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class TransactionController {
  async initialize(req: Request, res: Response) {
    console.log({ reqBody: req.body });
    try {
      await validateTransactions.initializeTransaction(req.body);
      const response = await paymentTransactionService.initialize(req.body);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        response,
        "Transaction initialized",
      );
    } catch (error: unknown) {
      console.error("Error initializing transaction:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  webhook(req: Request, res: Response) {
    try {
      paymentTransactionService.webhook(req);
      res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error: unknown) {
      console.log({ error });
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const transactionHistory = await paymentTransactionService.getHistory({
        walletId: req.params.walletId,
        page: parseInt(req.query.page as string) || 1,
        startDate: req.query.start as string,
        endDate: req.query.end as string,
      });

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, transactionHistory);
    } catch (error: unknown) {
      console.error("Error fetching transaction history:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const transactionDetails = await paymentTransactionService.getDetails(
        req.params.transactionId,
      );

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, transactionDetails);
    } catch (error: unknown) {
      console.error("Error fetching transaction details:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const transactionController = new TransactionController();
