import { Router } from "express";
import { adminOpsForRidersController } from "../controllers/riders.controllers";

export class AdminOpsRidersRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.route("/work-area").post(adminOpsForRidersController.createWorkArea);
  }
}
