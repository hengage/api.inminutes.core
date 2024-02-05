import { convertLatLngToCell } from "../../../services";
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
}

export const orderRepo = new OrderRepository();
