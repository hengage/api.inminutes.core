import { ORDER_STATUS } from "../../../utils";
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

    return order;
  }

//   async pickedUp(orderId: string) {
//     const order = await orderRepo.updateStatus({
//       orderId,
//       status: ORDER_STATUS.PICKED_UP,
//     });

//     return order;
//   }

  async inTransit(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.IN_TRANSIT,
    });

    return order;
  }

  async nearBy(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.NEARBY,
    });

    return order;
  }

  async arrived(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.ARRIVED,
    });

    return order;
  }

  async delivered(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.DELIVERED,
    });

    return order;
  }

  async cancelled(orderId: string) {
    const order = await orderRepo.updateStatus({
      orderId,
      status: ORDER_STATUS.CANCELLED,
    });

    return order;
  }
}

export const ordersService = new OrdersService();
