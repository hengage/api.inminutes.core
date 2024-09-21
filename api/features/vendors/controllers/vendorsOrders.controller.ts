import {Request, Response } from "express";
import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { vendorsOrdersService } from "../services/vendorsOrders.service";

class VendorsOrdersController {
  async orderMetrics(req: Request, res: Response) {
    const vendorId = (req as any).user._id;
    try {
      const orderMetrics = await vendorsOrdersService.orderMetrics(
        vendorId
      );
      res.status(HTTP_STATUS_CODES.OK).json({
        success: true,
        data: {orderMetrics}
      })
    } catch (error: any) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  }
}

export const vendorsOrdersController = new VendorsOrdersController();
