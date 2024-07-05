import { Server } from "http";

const socketIO = require("socket.io");

import { Socket } from "socket.io";
import { listenToCustomerEvents } from "./customer.socket";
import { listenToOrderevents } from "./orders.socket";
import { listenToRiderEvents } from "./riders.socket";
import { listenForProductEvents } from "./products.socket";
import { listenToWalletEvents } from "./wallet.socket";
import { socketGuard } from "../../middleware";

export class SocketServer {
  private io: Socket;
  private static instance: SocketServer;

  constructor(server: Server) {
    this.io = socketIO(server);
  }

  public static getInstance(server?: Server): SocketServer {
    if (!SocketServer.instance && server) {
      SocketServer.instance = new SocketServer(server);
    }
    return SocketServer.instance;
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

  public emitEvent(eventName: string, data: any) {
    this.io.emit(eventName, data);
    console.log(`Emitted event '${eventName}' from server`)
  }

  private listenToEvents(socket: Socket) {
    listenToCustomerEvents(socket)
    listenToOrderevents(socket)
    listenToRiderEvents(socket)
    listenForProductEvents(socket)
    listenToWalletEvents(socket)
  }
}
