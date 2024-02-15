import { ORDER_STATUS } from "../../../utils";
import { Order } from "../../orders";

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
}

export const vendorsOrdersService = new VendorsOrdersService();
