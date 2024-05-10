import { Router } from "express";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { ridersController } from "../controllers/riders.controllers";
import { timeSlotController } from "../controllers/timeSlot.controller";

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
    this.router.route("/book-slot").post(timeSlotController.bookSlot);
    this.router.route("/cancel-slot").post(timeSlotController.cancelSlot);
  }
}

export const ridersRoutes = new RidersRoutes();
