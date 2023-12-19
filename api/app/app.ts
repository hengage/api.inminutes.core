import express, { Express } from "express";
import { Server } from "http";
import { dbConfig } from "../config";

class App {
  public app: Express;
  public router: express.Router;
  constructor() {
    this.app = express();
    this.router = express.Router();

    this.connectDb()
  }

  private async connectDb() {
    try {
      await dbConfig.connect();
      console.log("Connected to database")
    } catch (error: any) {
      console.error(error.message);
    }
  }

  listenToPort(port: string | number, node_env: string): Server {
    return this.app.listen(`${port}`, () => {
      console.log(`Server started at port ${port}. Current ENV is ${node_env}`);
    });
  }
}

export { App };
