import mongoose from "mongoose";
import { HandleException, ORDER_STATUS } from "../../../utils";
import { handleInstantOrScheduledDelivery } from "../../../utils/delivery.utils";
import { notificationService } from "../../notifications";
import { ridersRepo, ridersService } from "../../riders";
import { Order } from "../models/orders.model";
import { orderRepo } from "../repository/orders.repo";
import { validateOrders } from "../validation/orders.validation";
import { vendorsRepo } from "../../vendors";
import { emitEvent } from "../../../services";

class OrdersService {
  //   async requestReceived(orderId: string) {
  //     const order = await orderRepo.updateStatus({
  //       orderId,
  //       status: ORDER_STATUS.REQUEST_RECEIVED,
  //     });

  //     return order;
  //   }

  async create(params: { payload: any; customer: string }) {
    const { payload, customer } = params;
    const order = await orderRepo.create({ payload, customer });
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
  }

  async requestConfirmed(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.REQUEST_CONFIRMED,
    });

      notificationService.createNotification({
        // headings: { en: "Custom Title" },
        contents: { en: "Order confirmed" },
        data: { orderId: order._id },
        userId: order.customer,
      })

    return { orderId: order._id };
  }

  async ready(params: { orderId: string; distanceInKM: number }) {
    const { orderId, distanceInKM } = params;

    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.READY,
    });

    await  handleInstantOrScheduledDelivery({ order, distanceInKM })

    return { orderId: order._id };
  }

  async assignRider(params: { orderId: string; riderId: string }) {
    await validateOrders.assignRider({
      orderId: params.orderId,
      riderId: params.riderId,
    });

    const order = await orderRepo.assignRider({
      orderId: params.orderId,
      riderId: params.riderId,
    });

    return { orderId: order._id };
  }

  async pickedUp(orderId: string) {
    console.log({ orderfromservice: orderId });
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.PICKED_UP,
    });

    await notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Your order has been picked up by the rider" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  async inTransit(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.NEARBY,
    });

    await notificationService.createNotification({
      headings: { en: "Order in transit" },
      contents: { en: "Your order is on the way to the destination" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  async nearBy(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.NEARBY,
    });

    await notificationService.createNotification({
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
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.ARRIVED,
    });

    await notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Your order has arrived the delivery location" },
      data: { orderId: order._id },
      userId: order.customer,
    });
    return { orderId: order._id };
  }

  async delivered(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.DELIVERED,
    });

    await notificationService.createNotification({
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
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.CANCELLED,
    });

    return { orderId: order._id };
  }

  async submitOrderFeedback(dto: any) {
    const {
      orderId,
      vendorId,
      riderId,
      vendorRating,
      riderRating,
      remarkOnVendor,
      remarkOnRider,
    } = dto;

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const riderRatingPromise = riderRating
        ? ridersRepo.updateRating(
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
        orderRepo.createRemarkAndRating(
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

export const ordersService = new OrdersService();
