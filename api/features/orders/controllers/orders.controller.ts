import { Request, Response } from "express";

import { STATUS_CODES, handleErrorResponse } from "../../../utils";
import { orderRepo } from "../repository/orders.repo";

class OrderController {
  async create(req: Request, res: Response) {
    const customer = (req as any).user._id;

    try {
      const order = await orderRepo.create({ payload: req.body, customer });

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
      const order = await orderRepo.orderDetails(req.params.orderId)
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}

export const ordersController = new OrderController();
