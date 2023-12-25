import express, { Express, Request, Response, Router } from "express";
import { Server } from "http";
import fileUpload from "express-fileupload";
import passport from "passport";
import session from "express-session"

import { dbConfig, passportStrategySetup, serializeUser } from "../config";
import { centralErrorHandler } from "../middleware";
import { routes } from "../routes";

class App {
  public app: Express;
  public router: express.Router;
  constructor() {
    this.app = express();
    this.router = express.Router();

    this.connectDb();
    this.initializeMiddleware();
    this.initializePassport();
    this.initializeRoutes();
    this.initializeCentralErrorMiddleware();
  }

  private async connectDb() {
    try {
      await dbConfig.connect();
      console.log("Connected to database");
    } catch (error: any) {
      console.error(error.message);
    }
  }

  private initializeMiddleware() {
    this.app.use(
      session({
        secret: "my-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        },
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(fileUpload({ useTempFiles: true }));
  }

  private initializePassport() {
    serializeUser(); // Initialize the serializeUser function
    passportStrategySetup(); // Initialize the passport strategy
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private initializeRoutes() {
    this.app.get("/", (req: Request, res: Response) => {
      res.send("Express typeScript app is set");
    });

    this.app.use("/api", routes.router);
  }

  private initializeCentralErrorMiddleware() {
    this.app.use(
      centralErrorHandler.handle404Error,
      centralErrorHandler.handle404OrServerError
    );
  }

  listenToPort(port: string | number, node_env: string): Server {
    return this.app.listen(`${port}`, () => {
      console.log(`Server started at port ${port}. Current ENV is ${node_env}`);
    });
  }
}

export { App };
