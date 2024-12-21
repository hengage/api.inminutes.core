import { ORDER_STATUS } from "../../../constants";
import { createPaginationOptions } from "../../../utils";
import { Order } from "../../orders";

/**
 * A service class that handles orders-related operations for customers.
 * @class
 */
export class CustomersOrdersService {
  private orderModel = Order;

  /**
   * @async
   * Retrieves the number of orders with different statuses
   * (PENDING, DELIVERED, CANCELLED) for a specific customer.
   * @param customerId
   * @returns
   */
  async orderMetrics(customerId: string) {
    const [pendingOrdersCount, successfulOrdersCount, cancelledOrdersCount] =
      await Promise.all([
        this.orderModel.countDocuments({
          customer: customerId,
          status: ORDER_STATUS.PENDING,
        }),
        this.orderModel.countDocuments({
          customer: customerId,
          status: ORDER_STATUS.DELIVERED,
        }),
        this.orderModel.countDocuments({
          customer: customerId,
          status: ORDER_STATUS.CANCELLED,
        }),
      ]);

    return {
      pendingOrdersCount,
      successfulOrdersCount,
      cancelledOrdersCount,
    };
  }

  /**
   * @async
   * Retrieves a list of orders for a specific customer.
   * @param {string} param.customerId - The ID of the customer to retrieve orders for.
   * @param {number} param.page - The page number to retrieve.
   */
  async orders(params: { customerId: string; page: number }) {
    const { customerId, page } = params;
    const query: { customer: typeof customerId } = { customer: customerId };

    const options = createPaginationOptions(
      page,
      {
        select: "deliveryAddress status",
        populate: [{ path: "vendor", select: "businessName" }]
      }
    );

    const orders = await this.orderModel.paginate(query, options);
    return orders;
  }
}
