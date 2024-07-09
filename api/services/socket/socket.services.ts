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
  public socket: Socket;

  constructor(server: Server) {
    this.io = socketIO(server);
    this.socket = {} as Socket;
  }

  public static getInstance(server?: Server): SocketServer {
    if (!SocketServer.instance && server) {
      SocketServer.instance = new SocketServer(server);
    }
    return SocketServer.instance;
  }

  public connectSocket() {
    this.io.use(socketGuard);
    this.io.on("connection", (socket: Socket) => {
      console.log(`User connected with socket ID: ${socket.id}`);
      console.log({ socketUser: socket.data.user });
      this.listenToEvents(socket);
      this.socket = socket;

      socket.on("disconnect", async () => {
        console.log("User disconnected");
      });
    });
  }

  public emitEvent(eventName: string, data: any, socket?: Socket) {
    this.socket.emit(eventName, data);
    console.log(
      `Emitted event '${eventName}' from server. Data: ${JSON.stringify(data)}`
    );
  }

  private listenToEvents(socket: Socket) {
    listenToCustomerEvents(socket);
    listenToOrderevents(socket);
    listenToRiderEvents(socket);
    listenForProductEvents(socket);
    listenToWalletEvents(socket);
    this.disconnectOnLogOut(socket)
  }

  private disconnectOnLogOut(socket: Socket) {
    socket.on("logout", () => {
      // Remove user data from socket
      delete socket.data.user;
      // Disconnect the socket
      socket.disconnect();
      console.log("User disconnected on logout");
    });
  }
}
