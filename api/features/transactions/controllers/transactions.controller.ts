import { Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { paymentTransactionService } from "../services/paymentTransaction.service";
import { validateTransactions } from "../validation/transactions.validate";

class TransactionController {
  async initialize(req: Request, res: Response) {
    console.log({ reqBody: req.body });
    try {
      await validateTransactions.initializeTransaction(req.body);
      const response = await paymentTransactionService.initialize(req.body);
      res.status(200).json({
        message: "success",
        data: response,
      });
    } catch (error: any) {
      console.error('Error initializing transaction:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
      
    }
  }

  webhook(req: Request, res: Response) {
    try {
      paymentTransactionService.webhook(req);
      res.sendStatus(HTTP_STATUS_CODES.OK);
    } catch (error: any) {
      console.log({ error });
      res.sendStatus(error.status);
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
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "success",
        data: transactionHistory,
      });
    } catch (error: any) {
      console.error('Error fetching transaction history:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const transactionDetails = await paymentTransactionService.getDetails(
        req.params.transactionId
      );
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "success",
        data: { transactionDetails },
      });
    } catch (error: any) {
      console.error('Error fetching transaction details:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const transactionController = new TransactionController();
