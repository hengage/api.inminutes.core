import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { transactionService } from "../services/transaction.service";
import { validateTransactions } from "../validation/transactions.validate";

class TransactionController {
  async initialize(req: Request, res: Response) {
    console.log({ reqBody: req.body });
    try {
      await validateTransactions.initializeTransaction(req.body);
      const response = await transactionService.initialize(req.body);
      res.status(200).json({
        message: "success",
        data: response,
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  webhook(req: Request, res: Response) {
    try {
      transactionService.webhook(req);
      res.sendStatus(STATUS_CODES.OK);
    } catch (error: any) {
      console.log({ error });
      res.sendStatus(error.status);
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const transactionHistory = await transactionService.getHistory({
        walletId: req.params.walletId,
        page: parseInt(req.query.page as string) || 1,
        startDate: req.query.start as string,
        endDate: req.query.end as string,
      });
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: transactionHistory,
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const transactionDetails = await transactionService.getDetails(
        req.params.transactionId
      );
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { transactionDetails },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const transactionController = new TransactionController();
