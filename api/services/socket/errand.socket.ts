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
        "You have been assigned to this errand"
      );
    } catch (error: any) {
      socket.emit("assign-rider-to-errand-error", error.message);
    }
  });

  socket.on("pick-up-errand-package", async (message) => {
    try {
      const errand = await errandService.pickedUpPackage(message.errandId);
      socket.emit("picked-up-errand-package", errand);
    } catch (error: any) {
      socket.emit("pick-up-errand-package-error", error.message);
    }
  });

  socket.on("errand-arrived-delivery-location", async (message) => {
    try {
      await errandService.arrivedDeliveryLocation(message.errandId);
    } catch (error: any) {
      socket.emit("errand-arrived-delivery-location-error", error.message);
    }
  });

  socket.on("errand-delivered", async (message) => {
    try {
      await errandService.delivered(message.errandId);
    } catch (error: any) {
      socket.emit("errand-delivered-error", error.message);
    }
  });

  socket.on("cancel-errand", async (message) => {
    try {
      await errandService.cancel(message.errandId);
    } catch (error: any) {
      socket.emit("cancel-errand-error", error.message);
    }
  });
}

export { listenToErrandEvents };
