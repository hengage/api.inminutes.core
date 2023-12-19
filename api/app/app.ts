import express, { Express } from "express";
import { Server } from "http";

class App {
  public app: Express;
  public router: express.Router;
  constructor() {
    this.app = express();
    this.router = express.Router();
  }

  public listenToPort(port: string | number, node_env: string): Server {
    return this.app.listen(`${port}`, () => {
      console.log(`Server started at port ${port}. Current ENV is ${node_env}`);
    });
  }
}

export { App };
