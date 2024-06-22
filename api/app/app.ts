import express, { Express, Request, Response, Router } from "express";
import { Server } from "http";
import fileUpload from "express-fileupload";
import passport from "passport";
import session from "express-session"

import { DBConfig, passportStrategySetup, serializeUser } from "../config";
import { centralErrorHandler } from "../middleware";
import { Routes } from "../routes";
import { redisClient } from "../services";

class App {
  public app: Express;
  public router: Router;
  public apiRoutes
  private dbConfig: DBConfig

  constructor() {
    this.app = express();
    this.router = Router();
    this.apiRoutes = new Routes

    this.dbConfig = new DBConfig
    this.connectDb();
    this.initializeMiddleware();
    this.initializePassport();
    this.initializeRoutes();
    this.initializeCentralErrorMiddleware();
    this.connectRedis()
  }

  private async connectDb() {
    try {
      await this.dbConfig.connect();
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

    this.app.use("/api", this.apiRoutes.router);
  }

  private initializeCentralErrorMiddleware() {
    this.app.use(
      centralErrorHandler.handle404Error,
      centralErrorHandler.handle404OrServerError
    );
  }

  private async connectRedis() {
    await redisClient.connect();
  }

  listenToPort(port: string | number, node_env: string): Server {
    return this.app.listen(`${port}`, () => {
      console.log(`Server started at port ${port}. Current ENV is ${node_env}`);
    });
  }
}

export { App };
