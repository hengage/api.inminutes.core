import { RidersService } from "../features/riders";
import { SchedulerService } from "./jobs.services";

export class DeliveryService {
  private ridersService: RidersService;
  private jobscheduleService: SchedulerService;

  constructor() {
    this.ridersService = new RidersService();
    this.jobscheduleService = SchedulerService.getInstance();
  }

  handleInstantOrScheduledDelivery = async (params: {
    order: any;
    distanceInKM: number;
  }) => {
    const { order, distanceInKM } = params;

    if (order.type === "scheduled") {
      console.log("Scheduled order", { order });
      const fiveMinutesBefore = new Date(
        order.scheduledDeliveryTime.getTime() - 5 * 60000
      );

      await this.jobscheduleService.scheduleOrderDelivery({
        scheduledTime: order.scheduledDeliveryTime,
        coordinates: order.vendor.location.coordinates,
        distanceInKM: distanceInKM,
        orderId: order._id,
      });
    } else {
      console.log("Instant order");
      await this.ridersService.findAndNotifyRidersOfOrder({
        coordinates: order.vendor.location.coordinates,
        distanceInKM,
        orderId: order._id,
      });
    }
  };
}
