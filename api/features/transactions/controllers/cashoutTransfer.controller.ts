import { Request, Response } from "express";
import {
  HandleException,
  HTTP_STATUS_CODES,
  handleErrorResponse,
} from "../../../utils";
import { cashoutTransferService } from "../services/cashoutTransfer.service";
import { validateTransactions } from "../validation/transactions.validate";

class CashoutTransferController {
  async addCashoutAccount(req: Request, res: Response) {
    try {
      await cashoutTransferService.addCashoutAccount(
        req.body.accountDetails,
        req.body.walletId
      );
      res.status(HTTP_STATUS_CODES.OK).json({ message: "success" });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async initialize(req: Request, res: Response) {
    try {
      await validateTransactions.cashoutTransfer(req.body)
      await cashoutTransferService.initialize(req.body);
      res
        .status(HTTP_STATUS_CODES.OK)
        .json({ message: "success", data: "Cashout approved" });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const cashoutTransferController = new CashoutTransferController();
