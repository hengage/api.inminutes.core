import { Request, Response } from "express";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { AdminOpsWalletService } from "../services/wallet.service";
import { HTTP_STATUS_CODES } from "../../../constants";

export class AdminOpsWalletController {
  private walletService = new AdminOpsWalletService();

  getWalletForMerchant = async (req: Request, res: Response): Promise<void> => {
    try {
      const wallet = await this.walletService.getWalletForMerchant(
        req.params.merchantId,
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, wallet);
    } catch (error) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
