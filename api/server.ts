import { App } from "./app/app";
import { NODE_ENV, PORT } from "./config";

const app = new App();

app.listenToPort(PORT, NODE_ENV)