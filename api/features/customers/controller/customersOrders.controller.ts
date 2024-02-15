import {Request, Response } from "express";
import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { customersOrdersService } from "../services/customerOrders.service";

class CustomersOrdersController {
  async orderMetrics(req: Request, res: Response) {
    const customerId = (req as any).user._id;
    try {
      const orderMetrics = await customersOrdersService.orderMetrics(
        customerId
      );
      res.status(STATUS_CODES.OK).json({
        success: true,
        data: {orderMetrics}
      })
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const customersOrdersController = new CustomersOrdersController();
