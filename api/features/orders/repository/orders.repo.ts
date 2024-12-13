import { ClientSession } from "mongoose";
import { redisClient } from "../../../services";
import { HandleException, Msg } from "../../../utils";
import { Order, OrderFeedback } from "../models/orders.model";
import {
  ICreateOrderData,
  IOrderFeedbackDocument,
  IOrderRatingAndRemarkData,
  IOrdersDocument,
} from "../orders.interface";
import { HTTP_STATUS_CODES, ORDER_STATUS } from "../../../constants";

/**
 * A repository class that handles orders-related database operations.
 * @class
 */
export class OrdersRepository {
  /**
   * @async
   *  Creates a new order.
   * @param {object} params - The assignment parameters.
   * @param  {string} params.customer - The id of the customer making the order
   * @param  {CreateOrderParams} params.orderData - The other  creation data for the order.
   **/
  async create(params: { orderData: ICreateOrderData; customer: string }) {
    const { orderData, customer } = params;
    console.log({ orderData });

    const payload = {
      customer,
      ...orderData,
      deliveryLocation: {
        coordinates: orderData.deliveryLocation,
      },
    };
    const order = await Order.create(payload);

    return order;
  }

  /**
   * @async
   * Retrieves the details of a single order.
   * @param orderId - The ID of the order to retrieve.
   */
  async details(orderId: string): Promise<IOrdersDocument> {
    const order = await Order.findById(orderId)
      .select({
        deliveryAddress: 1,
        deliveryLocation: {
          coordinates: 1,
        },
        totalProductsCost: 1,
        deliveryFee: 1,
        totalCost: 1,
        status: 1,
        createdAt: 1,
      })
      .populate({
        path: "customer",
        select: "fullName phoneNumber",
      })
      .populate({ path: "vendor", select: "businessName phoneNumber email" })
      .populate({ path: "rider", select: "fullName phoneNumber" })
      .lean()
      .exec();

    if (!order) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_ORDER_NOT_FOUND(orderId),
      );
    }

    return order;
  }

  async getNewOrdersForVendors(vendorId: string): Promise<IOrdersDocument[]> {
    return await Order.find({
      vendor: vendorId,
      status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.REQUEST_CONFIRMED] },
    })
      .select("items totalProductsCost status deliveryLocation.coordinates")
      .lean()
      .exec();
  }

  /**
    * @async
    * Assigns a rider to an order.
    * @param {object} params - The update parameters.
    @param {string} params.orderId - The ID of the order.
    @param {string} params.riderId - The ID of the rider.
  */
  async assignRider(params: {
    orderId: string;
    riderId: string;
  }): Promise<IOrdersDocument> {
    const { orderId, riderId } = params;
    console.log({ orderrepo: orderId });

    await this.checkRiderIsAlreadyAssigned(orderId);
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { rider: riderId },
      },
      { new: true },
    ).select("rider status customer");

    if (!order) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_ORDER_NOT_FOUND(orderId),
      );
    }

    return order;
  }

  /**
   * @async
    Updates the status of an order.
    @param {object} params - The update parameters.
    @param {string} params.orderId - The ID of the order.
    @param {ORDER_STATUS} params.status - The new status.
  */
  async updateStatus(params: { orderId: string; status: ORDER_STATUS }) {
    const order = await Order.findById(params.orderId)
      .select(
        "status customer type scheduledDeliveryTime totalProductsCost rider deliveryFee",
      )
      .populate({ path: "vendor", select: "location.coordinates" });

    if (!order) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_ORDER_NOT_FOUND(params.orderId),
      );
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new HandleException(
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
        "Order already cancelled",
      );
    }

    order.status = params.status;
    await order.save();

    redisClient
      .delete(`order:${params.orderId}`)
      .catch((error) => console.error("Error deleting order: ", error));

    return order;
  }

  /**
   * @async
    Checks if a rider is already assigned to an order.
    @param {string} orderId - The ID of the order.
    @throws {HandleException error} If the order is already assigned to a rider.
  */
  private async checkRiderIsAlreadyAssigned(orderId: string): Promise<void> {
    const order = await Order.findById(orderId).select("rider").lean().exec();

    if (!order) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_ORDER_NOT_FOUND(orderId),
      );
    }

    if (order.rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
        "Order already assigned to a rider",
      );
    }
  }

  /**
  Creates a new remark and rating for an order.
  @param {object} createRemarkData - The remark and rating data.
  @param {ClientSession} session - The database session.
  */
  public async createRemarkAndRating(
    createRemarkData: IOrderRatingAndRemarkData,
    session: ClientSession,
  ): Promise<IOrderFeedbackDocument> {
    const remark = new OrderFeedback({
      order: createRemarkData.orderId,
      ...createRemarkData,
    });

    return await remark.save({ session });
  }
}
