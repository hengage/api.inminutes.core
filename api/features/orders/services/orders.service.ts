import { startSession } from "mongoose";

import { deliveryService, HandleException, ORDER_STATUS } from "../../../utils";
import { NotificationService } from "../../notifications";
import { Order } from "../models/orders.model";
import { OrdersRepository } from "../repository/orders.repo";
import { ValidateOrders } from "../validation/orders.validation";
import { vendorsRepo } from "../../vendors";
import { emitEvent, redisClient } from "../../../services";
import { ridersService } from "../../riders/";
import {
  ICreateOrderData,
  IOrderAndMerchantsRatingData,
  IOrdersDocument,
} from "../orders.interface";
import { Events } from "../../../constants";

/**
CustomersOrdersService
A service class that handles orders-related operations.
@class
*/
class OrdersService {
  private notificationService: NotificationService;
  private validateOrders: ValidateOrders;
  private ordersRepo: OrdersRepository;

  constructor() {
    this.notificationService = new NotificationService();
    this.ordersRepo = new OrdersRepository();
    this.validateOrders = new ValidateOrders();
  }

  create = async (params: {
    orderData: ICreateOrderData;
    customer: string;
  }) => {
    const { orderData, customer } = params;
    await this.validateOrders.create(orderData);

    const order = await this.ordersRepo.create({ orderData, customer });
    const newOrder = await Order.findById(order.id)
      .select({
        deliveryAddress: 1,
        deliveryLocation: { coordinates: 1 },
        items: 1,
        totalProductsCost: 1,
        deliveryFee: 1,
        totalCost: 1,
        status: 1,
      })
      .populate({ path: "vendor", select: "_id" })
      .populate({ path: "items.product", select: "name image" })
      .lean()
      .exec();

    emitEvent.emit("vendor-new-orders", {
      vendorId: newOrder?.vendor._id,
    });
    return newOrder;
  };

  async details(orderId: string): Promise<IOrdersDocument> {
    const cacheKey = `order:${orderId}`;
    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
      return JSON.parse(cachedOrder);
    }
    const order = await this.ordersRepo.details(orderId);

    redisClient
      .setWithExpiry(cacheKey, JSON.stringify(order), 3600)
      .catch((error) => console.error("Error caching order: ", error));

    return order;
  }

  /**
   * @async
   * Confirms order and sends notification, confirmed by vendor.
   * @param orderId
   */
  async requestConfirmed(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.REQUEST_CONFIRMED,
    });

    console.log({ vendorId: order?.vendor._id });
    emitEvent.emit("vendor-new-orders", {
      vendorId: order?.vendor._id,
    });

    this.notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Order confirmed" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  /**
  @async
  Updates an order status to READY, indicating it's ready for rider pickup.
  @param {object} params - The order and distance parameters.
  @param {string} params.orderId - The ID of the order to update.
  @param {number} params.distanceInKM - The distance in kilometers for delivery.
  */
  async ready(params: { orderId: string; distanceInKM: number }) {
    const { orderId, distanceInKM } = params;

    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.READY,
    });

    await deliveryService.handleInstantOrScheduledItemsOrder({
      order,
      distanceInKM,
    });

    return { orderId: order._id };
  }

  /**
    * @async
    * Assigns a rider to an order.
    * @param {object} params - The update parameters.
    @param {string} params.orderId - The ID of the order.
    @param {string} params.riderId - The ID of the rider.
  */
  async assignRider(params: { orderId: string; riderId: string }) {
    const { orderId, riderId } = params;

    await this.validateOrders.assignRider({
      orderId: orderId,
      riderId: riderId,
    });

    const order = await this.ordersRepo.assignRider({
      orderId: orderId,
      riderId: riderId,
    });

    redisClient
      .delete(`order:${orderId}`)
      .catch((error) => console.error("Error deleting order: ", error));

    return { orderId: order._id };
  }

  /**
   * @async
   * Updates an order status to PICKED_UP,
   * indicating the rider has picked up the order.
   * @param orderId - The ID of the order to update.
   */
  async pickedUp(orderId: string) {
    console.log({ orderfromservice: orderId });
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.PICKED_UP,
    });

    await this.notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Your order has been picked up by the rider" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  /**
   *@async
   *Updates an order status to IN_TRANSIT, indicating the order is en route to the customer.
   *@param {string} orderId - The ID of the order to update.
   */
  async inTransit(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.IN_TRANSIT,
    });

    await this.notificationService.createNotification({
      headings: { en: "Order in transit" },
      contents: { en: "Your order is on the way to the destination" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  /**
   * @async
   * Updates an order status to NEARBY, indicating the order is near the customer's location.
   * @param orderId - The ID of the order to update.
   */
  async nearBy(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.NEARBY,
    });

    await this.notificationService.createNotification({
      contents: {
        en:
          `Your order is close. ` +
          `Please ensure you are at the delivery location`,
      },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  /**
   * @async
   * Updates an order status to ARRIVED,
   * indicating the order has reached the delivery location.
   * @param orderId - The ID of the order to update.
   */
  async arrived(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.ARRIVED,
    });

    await this.notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Your order has arrived the delivery location" },
      data: { orderId: order._id },
      userId: order.customer,
    });
    return { orderId: order._id };
  }

  /**
   * @async
   * Updates an order status to DELIVERED, indicating the order has been successfully delivered.
   * @param orderId  - The ID of the order to update.
   */
  async delivered(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.DELIVERED,
    });

    await this.notificationService.createNotification({
      headings: { en: "Order delivered" },
      contents: { en: "Thank you for choosing InMinutes" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    emitEvent.emit(Events.CREDIT_VENDOR, {
      vendorId: order.vendor._id,
      amount: order.totalProductsCost,
    });

    emitEvent.emit(Events.CREDIT_RIDER, {
      riderId: order.rider,
      amount: order.deliveryFee,
    });

    return { orderId: order._id };
  }

  /**
   * @async
   * Updates an order status to CANCELLED,
   * indicating the order has been cancelled.
   * @param orderId - The ID of the order to update.
   */
  async cancelled(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.CANCELLED,
    });

    return { orderId: order._id };
  }

  async getNewOrdersForVendors(vendorId: string) {
    return await this.ordersRepo.getNewOrdersForVendors(vendorId);
  }

  /**
   * @async
   * Submits feedback for an order.
   * Updating ratings and remarks for the vendor and rider.
    @param {object} feedbackData - The feedback data to submit.
   */
  async submitOrderFeedback(feedbackData: IOrderAndMerchantsRatingData) {
    const {
      orderId,
      vendorId,
      riderId,
      vendorRating,
      riderRating,
      remarkOnVendor,
      remarkOnRider,
    } = feedbackData;

    const session = await startSession();
    session.startTransaction();

    try {

      const riderRatingPromise = riderRating
        ? ridersService.updateRating({ riderId, rating: riderRating }, session)
        : Promise.resolve(); // Resolve to empty if no rider rating

      const vendorRatingPromise = vendorRating
        ? vendorsRepo.updateRating({ vendorId, rating: vendorRating }, session)
        : Promise.resolve(); // Resolve to empty if no vendor rating

      await Promise.all([
        riderRatingPromise,
        vendorRatingPromise,
        this.ordersRepo.createRemarkAndRating(
          { orderId, vendorRating, riderRating, remarkOnVendor, remarkOnRider },
          session
        ),
      ]);

      await session.commitTransaction();
    } catch (error: any) {
      await session.abortTransaction();
      throw new HandleException(error.status, error.message);
    } finally {
      await session.endSession();
    }
  }
}

export const ordersService = new OrdersService();
