import { ORDER_STATUS } from "../../../utils";
import { Order } from "../../orders";

class CustomersOrdersService {
  async orderMetrics(customerId: string) {
    const pendingOrdersCount = await Order.countDocuments({
      customer: customerId,
      status: ORDER_STATUS.PENDING,
    });
    const successfulOrdersCount = await Order.countDocuments({
      customer: customerId,
      status: ORDER_STATUS.DELIVERED,
    });
    const cancelledOrdersCount = await Order.countDocuments({
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
    };

    const orders = Order.paginate(query, options);
    return orders;
  }
}

export const customersOrdersService = new CustomersOrdersService();
