import { convertLatLngToCell } from "../../../services";
import { HandleException, ORDER_STATUS, STATUS_CODES } from "../../../utils";
import { Order } from "../models/orders.model";
import { IOrdersDocument } from "../orders.interface";

class OrderRepository {
  create(params: { payload: any; customer: string }) {
    const { payload, customer } = params;
    console.log({ payload });

    const order = Order.create({
      customer: customer,
      items: payload.items,
      deliveryAddress: payload.deliveryAddress,
      deliveryLocation: {
        coordinates: payload.deliveryLocation,
      },
      h3Index: convertLatLngToCell(payload.deliveryLocation),
      deliveryFee: payload.deliveryFee,
      totalProductsCost: payload.totalProductsCost,
      totalCost: payload.totalCost,
    });

    return order;
  }

  async updateStatus(params: {orderId: string, status: ORDER_STATUS}) {
    const order = await Order.findById(params.orderId).select("status");

    if (!order) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Order not found");
    }
    if (order?.status === ORDER_STATUS.CANCELLED) {
      throw new HandleException(
        STATUS_CODES.UNPROCESSABLE_ENTITY,
        "Order already cancelled"
      );
    }

    order.status = params.status;
    await order.save();
    return {orderId: order._id}
  }
}

export const orderRepo = new OrderRepository();
