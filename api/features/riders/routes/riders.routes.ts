import { Router } from "express";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { ridersController } from "../controllers/riders.controllers";

class RidersRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/signup").post(ridersController.signup);
    this.router.route("/login").post(ridersController.login);

    this.router.use(verifyAuthTokenMiddleware);

    this.router.route("/me").get(ridersController.getMe);
  }
}

export const ridersRoutes = new RidersRoutes()
