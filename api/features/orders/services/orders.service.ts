import { ORDER_STATUS } from "../../../utils";
import { notificationService } from "../../notifications";
import { orderRepo } from "../repository/orders.repo";

class OrdersService {
  //   async requestReceived(orderId: string) {
  //     const order = await orderRepo.updateStatus({
  //       orderId,
  //       status: ORDER_STATUS.REQUEST_RECEIVED,
  //     });

  //     return order;
  //   }

  async requestConfirmed(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.REQUEST_CONFIRMED,
    });

    await notificationService.createNotification({
      // headings: { en: "Custom Title" },
      contents: { en: "Order confirmed" },
      data: { orderId: order._id },
      userId: order.customer,
    });

    return { orderId: order._id };
  }

  async pickedUp(params: { orderId: string; riderId: string }) {
    const order = await orderRepo.assignRiderAndUpdateStatusToPickedUp({
      orderId: params.orderId,
      riderId: params.riderId,
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
