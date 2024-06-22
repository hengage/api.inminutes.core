import { ORDER_STATUS } from "../../../utils";
import { Order } from "../../orders";

export class CustomersOrdersService {
  private orderModel = Order
  
  async orderMetrics(customerId: string) {
    const pendingOrdersCount = await this.orderModel.countDocuments({
      customer: customerId,
      status: ORDER_STATUS.PENDING,
    });

    const successfulOrdersCount = await this.orderModel.countDocuments({
      customer: customerId,
      status: ORDER_STATUS.DELIVERED,
    });

    const cancelledOrdersCount = await this.orderModel.countDocuments({
      customer: customerId,
      status: ORDER_STATUS.CANCELLED,
    });

    return {
      pendingOrdersCount,
      successfulOrdersCount,
      cancelledOrdersCount,
    };
  }

  async orders(params: { customerId: string; page: number }) {
    const { customerId, page } = params;
    const query = { customer: customerId };

    const options = {
      page,
      limit: 16,
      select: "deliveryAddress status",
      populate: [{ path: "vendor", select: "businessName" }],
      lean: true,
      leanWithId: false,
      sort: {createdAt: -1}
    };

    const orders = this.orderModel.paginate(query, options);
    return orders;
  }
}