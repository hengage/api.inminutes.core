import { Request, Response } from "express";

import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { orderRepo } from "../repository/orders.repo";
import { ordersService } from "../services/orders.service";
import { validateOrders } from "../validation/orders.validation";

class OrderController {
  async create(req: Request, res: Response) {
    const customer = (req as any).user._id;

    try {
      await validateOrders.create(req.body);
      const order = await ordersService.create({ payload: req.body, customer });

      res.status(STATUS_CODES.CREATED).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async orderDetails(req: Request, res: Response) {
    try {
      const order = await orderRepo.orderDetails(req.params.orderId);
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async submitOrderFeedback(req: Request, res: Response) {
    const {
      vendorId,
      vendorRating,
      riderId,
      riderRating,
      remarkOnVendor,
      remarkOnRider,
    } = req.body;
    const { orderId } = req.params;
    try {
      await validateOrders.orderFeedback(req.body)
      await ordersService.submitOrderFeedback({
        orderId,
        vendorId,
        vendorRating,
        riderRating,
        riderId,
        remarkOnVendor,
        remarkOnRider,
      });
      res.status(200).json({
        message: "Success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const ordersController = new OrderController();
