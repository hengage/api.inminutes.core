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

  async updateStatus(params: { orderId: string; status: ORDER_STATUS }) {
    const order = await Order.findById(params.orderId).select("status customer");

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
    return order
  }

  async assignRiderAndUpdateStatusToInTransit(params: {
    orderId: string;
    riderId: string;
  }) {
    const { orderId, riderId } = params;
    console.log({ orderrepo: orderId });

    await this.checkRiderIsAlreadyAssigned(orderId);
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { rider: riderId, status: ORDER_STATUS.IN_TRANSIT },
      },
      { new: true }
    ).select("rider status");

    if (!order) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Order not found");
    }

    return order._id;
  }

  private async checkRiderIsAlreadyAssigned(orderId: string) {
    const order = await Order.findById(orderId).select("rider").lean().exec();

    if (!order) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Order not found");
    }

    if (order.rider) {
      throw new HandleException(
        STATUS_CODES.UNPROCESSABLE_ENTITY,
        "Order already assigned to a rider"
      );
    }
  }
}

export const orderRepo = new OrderRepository();
