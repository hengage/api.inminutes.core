import { Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { transferService } from "../services/transfer.service";

class TransferController {
  async createTransferReipient(req: Request, res: Response) {
    try {
      await transferService.createRecipient(req.body);
      res.status(STATUS_CODES.OK).json({ message: "success" });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const transferController = new TransferController();
