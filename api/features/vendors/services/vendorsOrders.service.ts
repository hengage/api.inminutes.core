import { ORDER_STATUS } from "../../../utils";
import { Order, ordersService } from "../../orders";

class VendorsOrdersService {
  async orderMetrics(vendorId: string) {
    const pendingOrdersCount = await Order.countDocuments({
      "items.vendor": vendorId,
      status: ORDER_STATUS.PENDING,
    });
    const successfulOrdersCount = await Order.countDocuments({
      "items.vendor": vendorId,
      status: ORDER_STATUS.DELIVERED,
    });
    const cancelledOrdersCount = await Order.countDocuments({
      "items.vendor": vendorId,
      status: ORDER_STATUS.CANCELLED,
    });

    return {
      pendingOrdersCount,
      successfulOrdersCount,
      cancelledOrdersCount,
    };
  }

  async getNewOrders(vendorId: string) {
    return ordersService.getNewOrdersForVendors(vendorId);
  }
}

export const vendorsOrdersService = new VendorsOrdersService();
