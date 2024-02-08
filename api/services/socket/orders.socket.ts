import { Socket } from "socket.io";
import { ordersService } from "../../features/orders";

function listenToOrderevents(socket: Socket) {
  socket.on("confirm-order-request", async (message) => {
    console.log({ message });
    try {
      const order = await ordersService.requestConfirmed(message.orderId);
      socket.emit("order-request-confirmed", order);
    } catch (error: any) {
      socket.emit("confirm-order-request-error", error.message);
    }
  });

  socket.on("order-in-transit", async (message) => {
    try {
      const order = await ordersService.inTransit(message.orderId);
      socket.emit("order-now-in-transit", order);
    } catch (error: any) {
      socket.emit("order-in-transit-error", error.message);
    }
  });

  socket.on("order-near-destination", async (message) => {
    try {
      const order = await ordersService.nearBy(message.orderId);
      socket.emit("order-nearby", order);
    } catch (error: any) {
      socket.emit("order-nearby-destination-error", error.message);
    }
  });

  socket.on("order-arrived-destination", async (message) => {
    try {
      const order = await ordersService.arrived(message.orderId);
      socket.emit("order-arrived", order);
    } catch (error: any) {
      socket.emit("order-arrived-destination-error", error.message);
    }
  });

  socket.on("order-delivered", async (message) => {
    try {
      const order = await ordersService.delivered(message.orderId);
      socket.emit("order-delivered-to-customer", order);
    } catch (error: any) {
      socket.emit("order-delivered-error", error.message);
    }
  });
  
  socket.on("cancel-order", async (message) => {
    try {
      const order = await ordersService.cancelled(message.orderId);
      socket.emit("order-cancelled", order);
    } catch (error: any) {
      socket.emit("cancel-order-error", error.message);
    }
  });

  
}

export { listenToOrderevents };
