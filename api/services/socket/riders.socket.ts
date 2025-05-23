import { Socket } from "socket.io";
import { ridersService } from "../../features/riders";

function listenToRiderEvents(socket: Socket) {
  socket.on("update-rider-location", async (message) => {
    const { coordinates } = message;
    console.log({ message });

    try {
      await ridersService.updateLocation({
        riderId: socket.data.user?._id,
        coordinates,
      });
      console.log("updated location");
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("update-rider-location-error", error.message);
      } else {
        socket.emit("update-rider-location-error", "An unknown error occurred");
      }
    }
  });
}

export { listenToRiderEvents };
