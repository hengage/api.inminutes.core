import { Socket } from "socket.io";
import { vendorsOrdersService } from "../../features/vendors";

export function listenToVendorEvents(socket: Socket) {
  socket.on("get-new-vendor-orders", async (message) => {
    try {
      const newOrders =  await vendorsOrdersService.getNewOrders(socket.data.user?._id);
      console.log({newOrders})
      socket.emit("new-vendor-orders", newOrders);
    } catch (error: any) {
      console.error('Error getting new vendor orders: ', error)
      socket.emit("update-rider-location-error", error.message);
    }
  });
}
