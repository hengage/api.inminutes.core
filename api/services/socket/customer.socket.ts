import { Socket } from "socket.io";

function listenToCustomerEvents(socket: Socket) {
  socket.on("test-customer-socket", async (message) => {
    console.log({ message });
  });
}

export { listenToCustomerEvents };
