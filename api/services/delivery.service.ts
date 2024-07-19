import { IErrandDocument } from "../features/errand";
import { IOrdersDocument } from "../features/orders/orders.interface";
import { ridersService } from "../features/riders";
import { SchedulerService } from "./jobs.services";

/**
 Handles the logistics of delivery for orders
 @class
 */
class DeliveryService {
  private jobScheduleService: SchedulerService;

  constructor() {
    this.jobScheduleService = SchedulerService.getInstance();
  }

  /**
  @async
  Handles instant or scheduled delivery based on the order type.
  If the order is scheduled, schedules the delivery with the SchedulerService.
  If the order is instant, notifies riders of the order through the RidersService.
  @param {any} params.order - Order object.
  @param {number} params.distanceInKM - Distance in kilometers.
  */
  handleInstantOrScheduledItemsOrder = async (params: {
    order: IOrdersDocument;
    distanceInKM: number;
  }) => {
    const { order, distanceInKM } = params;

    if (order.type === "scheduled") {
      console.log("Scheduled order", { order });
      const fiveMinutesBefore = new Date(
        order.scheduledDeliveryTime?.getTime() - 5 * 60000
      );

      await this.jobScheduleService.scheduleJob({
        jobName: "schedule-dispatch-pickup",
        scheduledTime: order.scheduledDeliveryTime,
        jobData: {
          coordinates: order.vendor.location.coordinates,
          distanceInKM: distanceInKM,
          dispatchType: "order",
          dispatchId: order._id,
        },
      });
    } else {
      console.log("Instant order");
      await ridersService.notifyRidersForDispatchJob({
        coordinates: order.vendor.location.coordinates,
        distanceInKM,
        dispatchType: "errand",
        dispatchId: order._id,
      });
    }
  };

  handleInstantOrScheduledErrand = async (errand: IErrandDocument) => {
    if (errand.type === "scheduled") {
      console.log("Scheduled errand", { errand });
      await this.jobScheduleService.scheduleJob({
        jobName: "schedule-dispatch-pickup",
        scheduledTime: errand.scheduledPickUpTime,
        jobData: {
          coordinates: errand.pickupCoordinates.coordinates,
          distanceInKM: 20,
          dispatchType: "errand",
          dispatchId: errand._id,
        },
      });
    } else if (errand.type === "instant") {
      console.log("Instant errand", { errand });
      await ridersService.notifyRidersForDispatchJob({
        coordinates: errand.pickupCoordinates.coordinates,
        distanceInKM: 20,
        dispatchType: "errand",
        dispatchId: errand._id,
      });
    }
  };
}

export const deliveryService = new DeliveryService();
