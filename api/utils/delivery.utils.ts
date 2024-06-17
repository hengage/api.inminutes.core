// import { RidersService } from "../features/riders";
import { ridersService } from "../features/riders";
import { agenda } from "../services";

// console.log({ridersServiceInDeliveryUtils: RidersService})
// const ridersService = new RidersService();

async function handleInstantOrScheduledDelivery(params: {
  order: any;
  distanceInKM: number;
}) {
  const { order, distanceInKM } = params;

  if (order.type === "scheduled") {
    console.log("Scheduled order", { order });
    const fiveMinutesBefore = new Date(
      order.scheduledDeliveryTime.getTime() - 5 * 60000
    );

    await agenda.schedule(
      order.scheduledDeliveryTime,
      "schedule-order-delivery",
      {
        coordinates: order.vendor.location.coordinates,
        distanceInKM,
        orderId: order._id,
      }
    );
  } else {
    console.log("Instant order");
    await ridersService.findAndNotifyRIdersOfOrder({
      coordinates: order.vendor.location.coordinates,
      distanceInKM,
      orderId: order._id,
    });
  }
}

export { handleInstantOrScheduledDelivery };
