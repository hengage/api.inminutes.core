import { Request, Response } from "express";

import { HTTP_STATUS_CODES, handleErrorResponse } from "../../../utils";
import { OrdersRepository } from "../repository/orders.repo";
import { ordersService } from "../services/orders.service";
import { ValidateOrders } from "../validation/orders.validation";
import { handleSuccessResponse } from "../../../utils/response.utils";

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
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { order },
      );
    } catch (error: unknown) {
      console.error("Error creating order:", error);
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

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { order },
      );
    } catch (error: unknown) {
      console.error("Error fetching order details:", error);
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

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        "Order feedback submitted"
      );
    } catch (error: unknown) {
      console.error("Error submitting order feedback:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
