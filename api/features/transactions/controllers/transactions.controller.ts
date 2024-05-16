import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { transactionService } from "../services/transaction.service";

class TransactionController {
  async initialize(req: Request, res: Response) {
    console.log({reqBody: req.body})
    try {
      const response = await transactionService.initialize(req.body);
      res.status(200).json({
        message: "success",
        data: response,
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const transactionController = new TransactionController();
