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
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("get-vendor-new-orders-error", error.message);
      } else {
        socket.emit("get-vendor-new-orders-error", "An unknown error occurred");
      }
    }
  });
}
