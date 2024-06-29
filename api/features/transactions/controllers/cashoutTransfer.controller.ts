import { Request, Response } from "express";
import {
  HandleException,
  STATUS_CODES,
  handleErrorResponse,
} from "../../../utils";
import { cashoutTransferService } from "../services/cashoutTransfer.service";

class CashoutTransferController {
  async addCashoutAccount(req: Request, res: Response) {
    try {
      await cashoutTransferService.addCashoutAccount(
        req.body.accountDetails,
        req.body.walletId
      );
      res.status(STATUS_CODES.OK).json({ message: "success" });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async initialize(req: Request, res: Response) {
    try {
      await cashoutTransferService.initialize(req.body);
      res
        .status(STATUS_CODES.OK)
        .json({ message: "success", data: "Cashout initiated successfully" });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const cashoutTransferController = new CashoutTransferController();
