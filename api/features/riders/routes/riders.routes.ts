import { Router } from "express";
import {
  errandHistoryMiddleware,
  verifyAuthTokenMiddleware,
} from "../../../middleware";
import { ridersController } from "../controllers/riders.controllers";
import { timeSlotController } from "../controllers/timeSlot.controller";
import { RiderErrandController } from "../controllers/ridersErrand.controller";
import { authLimiter } from "../../../middleware/auth.middleware";

class RidersRoutes {
  private riderErrandController: RiderErrandController;
  router = Router();

  constructor() {
    this.riderErrandController = new RiderErrandController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/signup").post(authLimiter, ridersController.signup);
    this.router.route("/login").post(authLimiter, ridersController.login);

    this.router.use(verifyAuthTokenMiddleware);

    this.router.route("/me").get(ridersController.getMe);
    this.router.route("/book-slot").post(timeSlotController.bookSlot);
    this.router.route("/cancel-slot").post(timeSlotController.cancelSlot);

    this.router
      .route("/errand")
      .get(errandHistoryMiddleware, this.riderErrandController.getHistory);
  }
}

export const ridersRoutes = new RidersRoutes();
