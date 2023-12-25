import express, { Express } from "express";
import { Server } from "http";
import fileUpload from "express-fileupload";

import { dbConfig } from "../config";

class App {
  public app: Express;
  public router: express.Router;
  constructor() {
    this.app = express();
    this.router = express.Router();

    this.connectDb()
    this.initializeMiddleware()
  }

  private async connectDb() {
    try {
      await dbConfig.connect();
      console.log("Connected to database")
    } catch (error: any) {
      console.error(error.message);
    }
  }

  private initializeMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(fileUpload({ useTempFiles: true }));
  }

  listenToPort(port: string | number, node_env: string): Server {
    return this.app.listen(`${port}`, () => {
      console.log(`Server started at port ${port}. Current ENV is ${node_env}`);
    });
  }
}

export { App };
