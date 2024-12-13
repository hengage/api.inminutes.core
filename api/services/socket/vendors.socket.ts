import { Socket } from "socket.io";
import { vendorsOrdersService } from "../../features/vendors";

export function listenToVendorEvents(socket: Socket) {
  socket.on("get-vendor-new-orders", async (message) => {
    console.log({ message });
    try {
      const newOrders = await vendorsOrdersService.getNewOrders(
        message.vendorId,
      );
      console.log({ newOrders });
      socket.emit("vendor-new-orders", newOrders);
    } catch (error: any) {
      console.error("Error getting new vendor orders: ", error);
      socket.emit("update-rider-location-error", error.message);
    }
  });
}
