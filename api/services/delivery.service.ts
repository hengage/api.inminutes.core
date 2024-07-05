import { IOrdersDocument } from "../features/orders/orders.interface";
import { ridersService } from "../features/riders";
import { SchedulerService } from "./jobs.services";

/**
 Handles the logistics of delivery for orders
 @class
 */
class DeliveryService {
  private jobscheduleService: SchedulerService;

  constructor() {
    this.jobscheduleService = SchedulerService.getInstance();
  }

  /**
  @async
  Handles instant or scheduled delivery based on the order type.
  If the order is scheduled, schedules the delivery with the SchedulerService.
  If the order is instant, notifies riders of the order through the RidersService.
  @param {any} params.order - Order object.
  @param {number} params.distanceInKM - Distance in kilometers.
  */
  handleInstantOrScheduledDelivery = async (params: {
    order: IOrdersDocument;
    distanceInKM: number;
  }) => {
    const { order, distanceInKM } = params;

    if (order.type === "scheduled") {
      console.log("Scheduled order", { order });
      const fiveMinutesBefore = new Date(
        order.scheduledDeliveryTime?.getTime() - 5 * 60000
      );

      await this.jobscheduleService.scheduleOrderDelivery({
        scheduledTime: order.scheduledDeliveryTime,
        coordinates: order.vendor.location.coordinates,
        distanceInKM: distanceInKM,
        orderId: order._id,
      });
    } else {
      console.log("Instant order");
      await ridersService.findAndNotifyRidersOfOrder({
        coordinates: order.vendor.location.coordinates,
        distanceInKM,
        orderId: order._id,
      });
    }
  };
}

export const deliveryService = new DeliveryService()