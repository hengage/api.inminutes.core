import { Socket } from "socket.io";
import { ordersService } from "../../features/orders";

function listenToOrderevents(socket: Socket) {
  socket.on("confirm-order-request", async (message) => {
    console.log({ message });
    const { orderId } = message;
    try {
      const order = await ordersService.requestConfirmed(orderId);
      socket.emit("order-request-confirmed", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("confirm-order-request-error", error.message);
      } else {
        socket.emit("confirm-order-request-error", "An unknown error occurred");
      }
    }
  });

  socket.on("order-ready-for-pick", async (message) => {
    console.log({ message });
    const { orderId } = message;
    try {
      const order = await ordersService.ready({
        orderId,
        distanceInKM: 20,
      });
      socket.emit("order-now-ready-for-pick", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("order-ready-for-pick-error", error.message);
      } else {
        socket.emit("order-ready-for-pick-error", "An unknown error occurred");
      }
    }
  });

  socket.on("assign-rider-to-order", async (message) => {
    const { orderId } = message;
    try {
      const order = await ordersService.assignRider({
        orderId,
        riderId: socket.data.user?._id,
      });
      console.log("assigned rider");
      socket.emit("rider-assigned-to-order", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
        socket.emit("assign-rider-to-order-error", error.message);
      } else {
        socket.emit("assign-rider-to-order-error", "An unknown error occurred");
      }
    }
  });

  socket.on("pick_up-order", async (message) => {
    const { orderId } = message;
    console.log(orderId);
    try {
      const order = await ordersService.pickedUp(orderId);
      socket.emit("order-picked_up", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("pick_up-order-error", error.message);
      } else {
        socket.emit("pick_up-order-error", "An unknown error occurred");
      }
    }
  });

  socket.on("order-in-transit", async (message) => {
    const { orderId } = message;
    console.log({ message });
    try {
      const order = await ordersService.inTransit(orderId);
      socket.emit("order-now-in-transit", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("order-in-transit-error", error.message);
      } else {
        socket.emit("order-in-transit-error", "An unknown error occurred");
      }
    }
  });

  socket.on("order-near-destination", async (message) => {
    try {
      const order = await ordersService.nearBy(message.orderId);
      socket.emit("order-nearby", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("order-nearby-destination-error", error.message);
      } else {
        socket.emit(
          "order-nearby-destination-error",
          "An unknown error occurred",
        );
      }
    }
  });

  socket.on("order-arrived-destination", async (message) => {
    try {
      const order = await ordersService.arrived(message.orderId);
      socket.emit("order-arrived", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("order-arrived-destination-error", error.message);
      } else {
        socket.emit(
          "order-arrived-destination-error",
          "An unknown error occurred",
        );
      }
    }
  });

  socket.on("order-delivered", async (message) => {
    try {
      const order = await ordersService.delivered(message.orderId);
      socket.emit("order-delivered-to-customer", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("order-delivered-error", error.message);
      } else {
        socket.emit("order-delivered-error", "An unknown error occurred");
      }
    }
  });

  socket.on("cancel-order", async (message) => {
    try {
      const order = await ordersService.cancelled(message.orderId);
      socket.emit("order-cancelled", order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("cancel-order-error", error.message);
      } else {
        socket.emit("cancel-order-error", "An unknown error occurred");
      }
    }
  });
}

export { listenToOrderevents };
