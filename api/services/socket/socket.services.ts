import { Server } from "http";

const socketIO = require("socket.io");

import { Socket } from "socket.io";
import { listenToCustomerEvents } from "./customer.socket";
import { listenToOrderevents } from "./orders.socket";
import { listenToRiderEvents } from "./riders.socket";
import { listenForProductEvents } from "./products.socket";
import { listenToWalletEvents } from "./wallet.socket";
import { socketGuard } from "../../middleware";

class SocketIO {
  private io: Socket;

  constructor(server: Server) {
    this.io = socketIO(server);
  }

  public connectSocket() {
    this.io.use(socketGuard)
    this.io.on("connection", (socket: Socket) => {
      console.log("User connected");
      this.listenToEvents(socket)

      socket.on("disconnect", async () => {
        console.log("User disconnected");
      });
    });
  }

  // private

  private listenToEvents(socket: Socket) {
    listenToCustomerEvents(socket)
    listenToOrderevents(socket)
    listenToRiderEvents(socket)
    listenForProductEvents(socket)
    listenToWalletEvents(socket)

  }
}

export { SocketIO };
