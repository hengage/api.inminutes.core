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
}

export const customersOrdersService = new CustomersOrdersService();
