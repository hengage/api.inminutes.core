import { Request, Response } from "express";
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
        data: { orderMetrics },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async orders(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const customerId = (req as any).user._id;
    try {
      const orders = await customersOrdersService.orders({ customerId, page });
      console.log({orders})
      res.status(STATUS_CODES.OK).json({
        success: true,
        data: { orders },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const customersOrdersController = new CustomersOrdersController();
