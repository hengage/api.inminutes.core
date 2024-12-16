import dotenv from "dotenv";
dotenv.config();

import { App } from "./app/app";
import { NODE_ENV, PORT } from "./config";
import "./config/datetime.cofig";
import { SocketServer } from "./services/socket/socket.services";

const app = new App();

const server = app.listenToPort(PORT, NODE_ENV);

const socket = SocketServer.getInstance(server);

socket.connectSocket();
