import { Request, Response } from "express";

import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { OrdersRepository } from "../repository/orders.repo";
import { ordersService } from "../services/orders.service";
import { ValidateOrders } from "../validation/orders.validation";

export class OrdersController {
  private ordersRepo: OrdersRepository;
  private validateOrders: ValidateOrders;

  constructor() {
    this.ordersRepo = new OrdersRepository();
    this.validateOrders = new ValidateOrders();
  }
  create = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;

    try {
      const order = await ordersService.create({
        orderData: req.body,
        customer,
      });
      res.status(HTTP_STATUS_CODES.CREATED).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  orderDetails = async (req: Request, res: Response) => {
    try {
      const order = await ordersService.details(req.params.orderId);
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "success",
        data: { order },
      });
    } catch (error: any) {
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  submitOrderFeedback = async (req: Request, res: Response) => {
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
      await this.validateOrders.orderFeedback(req.body);
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
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
