import { Server } from "http";

import { Socket } from "socket.io";
import { listenToCustomerEvents } from "./customer.socket";
const socketIO = require("socket.io");

class SocketIO {
  private io: Socket;

  constructor(server: Server) {
    this.io = socketIO(server);
  }

  public connectSocket() {
    this.io.on("connection", (socket: Socket) => {
      console.log("User connected");
      listenToCustomerEvents(socket)

      socket.on("disconnect", async () => {
        console.log("User disconnected");
      });
    });
  }
}

export { SocketIO };
