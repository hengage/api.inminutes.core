import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { cashoutTransferService } from "../services/cashoutTransfer.service";
import { validateTransactions } from "../validation/transactions.validate";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class CashoutTransferController {
  async addCashoutAccount(req: Request, res: Response): Promise<void> {
    try {
      await cashoutTransferService.addCashoutAccount(
        req.body.accountDetails,
        req.body.walletId
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        null,
        "Account added successfully"
      );

    } catch (error: unknown) {
      console.error('Error adding cashout account:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }

  async initialize(req: Request, res: Response): Promise<void> {
    try {
      await validateTransactions.cashoutTransfer(req.body)
      await cashoutTransferService.initialize(req.body);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Cashout request approved"
      );
    } catch (error: unknown) {
      console.error('Error initializing cashout transfer:', error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const cashoutTransferController = new CashoutTransferController();
