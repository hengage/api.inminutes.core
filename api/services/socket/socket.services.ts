import { Server } from "http";

const socketIO = require("socket.io");

import { Socket } from "socket.io";
import { listenToCustomerEvents } from "./customer.socket";
import { listenToOrderevents } from "./orders.socket";
import { listenToRiderEvents } from "./riders.socket";
import { listenForProductEvents } from "./products.socket";
import { listenToWalletEvents } from "./wallet.socket";
import { socketGuard } from "../../middleware";
import { listenToVendorEvents } from "./vendors.socket";

export class SocketServer {
  private io: Socket;
  private static instance: SocketServer;
  // public socket: Socket;
  public sockets: Map<string, Socket> = new Map();

  constructor(server: Server) {
    this.io = socketIO(server);
    // this.socket = {} as Socket;
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
      // this.socket = socket;
      const userId =
        socket.handshake.auth.userid || socket.handshake.headers.userid;

      console.log({ userIdFromSocketConnection: userId });
      // Store user ID and socket in the Map
      this.sockets.set(userId, socket);
      console.log({ "socket map on connection": this.sockets });

      socket.on("disconnect", async (reason, details) => {
        console.log(`User disconnected. Reason: ${reason}`);

         // Remove user ID and socket from the Map when disconnected.
        this.sockets.delete(userId);
        console.log({ "socket map on disconnection": this.sockets });
      });
    });
  }

  /**
   * Emits an event to a specific user or all users.
   * @param {string} eventName - The name of the event to emit.
   * @param {any} data - The data to send with the event.
   * @param {string} [userId] - The user ID to emit the event to.
   */
  public emitEvent = (eventName: string, data: any, userId?: string) => {
    if (userId) {
      console.log({ "user id from emitting event": userId });
      // this.socket.emit(eventName, data);
      const socket = this.sockets.get(userId);
      if (socket) {
        socket.emit(eventName, data);
        console.log(
          `Emitted event '${eventName}' from server. Data: ${JSON.stringify(
            data
          )}`
        );
      } else {
        console.log(`Socket not found`);
      }
    } else {
      this.io.emit(eventName, data);
      console.log(`Broadcasted event '${eventName}' to all sockets`);
    }
  };

  private listenToEvents(socket: Socket) {
    listenToCustomerEvents(socket);
    listenToOrderevents(socket);
    listenToRiderEvents(socket);
    listenForProductEvents(socket);
    listenToWalletEvents(socket);
    listenToVendorEvents(socket);
    this.disconnectOnLogOut(socket);
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
