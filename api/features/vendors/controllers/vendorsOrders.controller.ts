import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../../../constants";
import { handleErrorResponse } from "../../../utils";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { vendorsOrdersService } from "../services/vendorsOrders.service";

class VendorsOrdersController {
  async orderMetrics(req: Request, res: Response) {
    const vendorId = (req as any).user._id;
    try {
      const orderMetrics = await vendorsOrdersService.orderMetrics(vendorId);

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { orderMetrics });
    } catch (error: unknown) {
      console.error("Error fetching order metrics:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const vendorsOrdersController = new VendorsOrdersController();
