import { Request, Response } from "express";
import {
  HandleException,
  STATUS_CODES,
  handleErrorResponse,
} from "../../../utils";
import { transferService } from "../services/transfer.service";

class TransferController {
  async createTransferReipient(req: Request, res: Response) {
    const user = (req as any).user._id;
    console.log(user);
    const merchantType = req.query.merchant as "vendor" | "rider";
    console.log({ merchantType });
    try {
      if (!merchantType) {
        throw new HandleException(
          STATUS_CODES.BAD_REQUEST,
          "Merchant type not specified"
        );
      }
      await transferService.createRecipient(req.body, merchantType, user);
      res.status(STATUS_CODES.OK).json({ message: "success" });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const transferController = new TransferController();
