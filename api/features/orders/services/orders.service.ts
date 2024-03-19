import { agenda } from "../../../services";
import { ORDER_STATUS } from "../../../utils";
import { handleInstantOrScheduledDelivery } from "../../../utils/delivery.utils";
import { notificationService } from "../../notifications";
import { ridersService } from "../../riders";
import { Order } from "../models/orders.model";
import { orderRepo } from "../repository/orders.repo";
import { validateOrders } from "../validation/orders.validation";

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
      .populate({ path: "vendor", select: "_id" });

    if (newOrder) {
      console.log({ vendorId: newOrder.vendor._id });

      notificationService.createNotification({
        headings: { en: "New Order" },
        contents: {
          en:
            `A new order has been placed. ` +
            `Please confirm and fulfill the order as soon possible`,
        },
        data: { order: newOrder },
        userId: newOrder.vendor._id,
      });
    }

    return newOrder;
  }

  async requestConfirmed(params: { orderId: string; distanceInKM: number }) {
    const { orderId, distanceInKM } = params;

    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.REQUEST_CONFIRMED,
    });

    await Promise.all([
      notificationService.createNotification({
        // headings: { en: "Custom Title" },
        contents: { en: "Order confirmed" },
        data: { orderId: order._id },
        userId: order.customer,
      }),
      
      handleInstantOrScheduledDelivery({ order, distanceInKM }),
    ]);

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

    return { orderId: order._id };
  }

  async cancelled(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.CANCELLED,
    });

    return { orderId: order._id };
  }
}

export const ordersService = new OrdersService();
