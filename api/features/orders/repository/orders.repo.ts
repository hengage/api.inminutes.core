import { ClientSession } from "mongoose";
import { convertLatLngToCell } from "../../../services";
import { HandleException, ORDER_STATUS, STATUS_CODES } from "../../../utils";
import { Order, OrderFeedback } from "../models/orders.model";

class OrderRepository {
  create(params: { payload: any; customer: string }) {
    const { payload, customer } = params;
    console.log({ payload });

    const order = Order.create({
      customer: customer,
      recipientPhoneNumber: payload.recipientPhoneNumber,
      items: payload.items,
      vendor: payload.vendor,
      deliveryAddress: payload.deliveryAddress,
      deliveryLocation: {
        coordinates: payload.deliveryLocation,
      },
      h3Index: convertLatLngToCell(payload.deliveryLocation),
      deliveryFee: payload.deliveryFee,
      totalProductsCost: payload.totalProductsCost,
      totalCost: payload.totalCost,
      instruction: payload.instruction,
      type: payload.type,
      scheduledDeliveryTime: payload.scheduledDeliveryTime,
    });

    return order;
  }

  async orderDetails(orderId: string) {
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
    return order;
  }

  async assignRider(params: { orderId: string; riderId: string }) {
    const { orderId, riderId } = params;
    console.log({ orderrepo: orderId });

    await this.checkRiderIsAlreadyAssigned(orderId);
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { rider: riderId },
      },
      { new: true }
    ).select("rider status customer");

    if (!order) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Order not found");
    }

    return order;
  }

  async updateStatus(params: { orderId: string; status: ORDER_STATUS }) {
    const order = await Order.findById(params.orderId)
      .select(
        "status customer type scheduledDeliveryTime totalProductsCost rider deliveryFee"
      )
      .populate({ path: "vendor", select: "location.coordinates" });

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
    return order;
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

  public async createRemarkAndRating(
    createRemarkDto: any,
    session: ClientSession
  ) {
    const {
      orderId,
      remarkOnRider,
      remarkOnVendor,
      riderRating,
      vendorRating,
    } = createRemarkDto;

    const remark = new OrderFeedback({
      order: orderId,
      remarkOnRider,
      remarkOnVendor,
      riderRating,
      vendorRating,
    });

    return await remark.save({ session });
  }
}

export const orderRepo = new OrderRepository();
