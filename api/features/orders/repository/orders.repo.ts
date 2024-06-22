import { ClientSession } from "mongoose";
import { convertLatLngToCell, redisClient } from "../../../services";
import { HandleException, ORDER_STATUS, STATUS_CODES } from "../../../utils";
import { Order, OrderFeedback } from "../models/orders.model";

export class OrdersRepository {
  create(params: { orderData: any; customer: string }) {
    const { orderData, customer } = params;
    console.log({ orderData });

    const order = Order.create({
      customer: customer,
      recipientPhoneNumber: orderData.recipientPhoneNumber,
      items: orderData.items,
      vendor: orderData.vendor,
      deliveryAddress: orderData.deliveryAddress,
      deliveryLocation: {
        coordinates: orderData.deliveryLocation,
      },
      h3Index: convertLatLngToCell(orderData.deliveryLocation),
      deliveryFee: orderData.deliveryFee,
      serviceFee: orderData.serviceFee,
      totalProductsCost: orderData.totalProductsCost,
      totalCost: orderData.totalCost,
      instruction: orderData.instruction,
      type: orderData.type,
      scheduledDeliveryTime: orderData.scheduledDeliveryTime,
    });

    return order;
  }

  async details(orderId: string) {
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
    
    redisClient
      .delete(`order:${params.orderId}`)
      .catch((error) => console.error("Error deleting order: ", error));
      
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