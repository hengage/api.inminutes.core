import { Server } from "http";

import { Socket } from "socket.io";
const socketIO = require("socket.io");

class SocketIo {
  private io: Socket;

  constructor(server: Server) {
    this.io = socketIO(server);
  }

  public connectSocket() {
    this.io.on("connection", (socket: Socket) => {
      console.log("User connected");

      socket.on("disconnect", async () => {
        console.log("User disconnected");
      });
    });
  }
}

export { SocketIo };
