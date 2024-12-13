import { Socket } from "socket.io";
import { errandService } from "../../features/errand";

function listenToErrandEvents(socket: Socket) {
  socket.on("assign-rider-to-errand", async (message) => {
    try {
      await errandService.assignRider({
        errandId: message.errandId,
        riderId: message.riderId,
      });
      socket.emit(
        "assigned-rider-to-errand",
        "You have been assigned to this errand",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("assign-rider-to-errand-error", error.message);
      } else {
        socket.emit(
          "assign-rider-to-errand-error",
          "An unknown error occurred",
        );
      }
    }
  });

  socket.on("pick-up-errand-package", async (message) => {
    try {
      const errand = await errandService.pickedUpPackage(message.errandId);
      socket.emit("picked-up-errand-package", errand);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("pick-up-errand-package-error", error.message);
      } else {
        socket.emit(
          "pick-up-errand-package-error",
          "An unknown error occurred",
        );
      }
    }
  });

  socket.on("errand-package-in-transit", async (message) => {
    try {
      const errand = await errandService.inTransit(message.errandId);
      socket.emit("in-transit-errand", errand);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("errand-package-in-transit-error", error.message);
      } else {
        socket.emit(
          "errand-package-in-transit-error",
          "An unknown error occurred",
        );
      }
    }
  });

  socket.on("errand-package-nearby", async (message) => {
    try {
      await errandService.nearby(message.errandId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("errand-package-nearby-error", error.message);
      } else {
        socket.emit("errand-package-nearby-error", "An unknown error occurred");
      }
    }
  });

  socket.on("errand-arrived-delivery-location", async (message) => {
    try {
      await errandService.arrivedDeliveryLocation(message.errandId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("errand-arrived-delivery-location-error", error.message);
      } else {
        socket.emit(
          "errand-arrived-delivery-location-error",
          "An unknown error occurred",
        );
      }
    }
  });

  socket.on("errand-delivered", async (message) => {
    try {
      await errandService.delivered(message.errandId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("errand-delivered-error", error.message);
      } else {
        socket.emit("errand-delivered-error", "An unknown error occurred");
      }
    }
  });

  socket.on("cancel-errand", async (message) => {
    try {
      await errandService.cancel(message.errandId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("cancel-errand-error", error.message);
      } else {
        socket.emit("cancel-errand-error", "An unknown error occurred");
      }
    }
  });
}

export { listenToErrandEvents };
