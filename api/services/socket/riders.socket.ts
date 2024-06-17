import { Socket } from "socket.io";
import { ridersService } from "../../features/riders";
// const ridersService = new RidersService()

function listenToRiderEvents(socket: Socket) {
  socket.on("update-rider-location", async (message) => {
    const { riderId, coordinates } = message;
    console.log({ message });

    try {
      await ridersService.updateLocation({ riderId, coordinates });
      console.log("updated location");
    } catch (error: any) {
      socket.emit("update-rider-location-error", error.message);
    }
  });
}

export { listenToRiderEvents };
