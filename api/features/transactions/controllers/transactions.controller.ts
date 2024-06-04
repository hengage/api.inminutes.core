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
}

export const transactionController = new TransactionController();
