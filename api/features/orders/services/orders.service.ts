import mongoose from "mongoose";
import { DeliveryService, HandleException, ORDER_STATUS } from "../../../utils";
import { NotificationService } from "../../notifications";
import { Order } from "../models/orders.model";
import { OrdersRepository } from "../repository/orders.repo";
import { ValidateOrders } from "../validation/orders.validation";
import { vendorsRepo } from "../../vendors";
import { emitEvent, redisClient } from "../../../services";
import { RidersService } from "../../riders/";

export class OrdersService {
  private notificationService: NotificationService;
  private validateOrders: ValidateOrders;
  private ordersRepo: OrdersRepository;
  private ridersService: RidersService;
  private deliveryService: DeliveryService;

  constructor() {
    this.notificationService = new NotificationService();
    this.ordersRepo = new OrdersRepository();
    this.validateOrders = new ValidateOrders();
    this.ridersService = new RidersService();
    this.deliveryService = new DeliveryService();
  }

  create = async (params: { orderData: any; customer: string }) => {
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

    return newOrder;
  };

  async details(orderId: string) {
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

  async requestConfirmed(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.REQUEST_CONFIRMED,
    });

    this.notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Order confirmed" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  async ready(params: { orderId: string; distanceInKM: number }) {
    const { orderId, distanceInKM } = params;

    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.READY,
    });

    await this.deliveryService.handleInstantOrScheduledDelivery({
      order,
      distanceInKM,
    });

    return { orderId: order._id };
  }

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

  async inTransit(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.NEARBY,
    });

    await this.notificationService.createNotification({
      headings: { en: "Order in transit" },
      contents: { en: "Your order is on the way to the destination" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

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

    emitEvent("credit-vendor", {
      vendorId: order.vendor._id,
      amount: order.totalProductsCost,
    });

    emitEvent("credit-rider", {
      riderId: order.rider,
      amount: order.deliveryFee,
    });

    return { orderId: order._id };
  }

  async cancelled(orderId: string) {
    const order = await this.ordersRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.CANCELLED,
    });

    return { orderId: order._id };
  }

  async submitOrderFeedback(feedbackData: any) {
    const {
      orderId,
      vendorId,
      riderId,
      vendorRating,
      riderRating,
      remarkOnVendor,
      remarkOnRider,
    } = feedbackData;

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const riderRatingPromise = riderRating
        ? this.ridersService.updateRating(
            { riderId, rating: parseInt(riderRating) },
            session
          )
        : Promise.resolve(); // Resolve to empty if no rider rating

      const vendorRatingPromise = vendorRating
        ? vendorsRepo.updateRating(
            { vendorId, rating: parseInt(vendorRating) },
            session
          )
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
      await session.endSession();
    } catch (error: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new HandleException(error.status, error.message);
    } finally {
      await session.endSession();
    }
  }
}
