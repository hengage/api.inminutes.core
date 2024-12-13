import { Router } from "express";
import { adminOpsRidersController } from "../controllers/riders.controller";

export class AdminOpsRidersRoutes {
  public router: Router;
  private adminOpsForRidersController: typeof adminOpsRidersController;

  constructor() {
    this.adminOpsForRidersController = adminOpsRidersController;

    this.router = Router();
    this.initializeRoutes();
  }

  async initializeRoutes() {
    this.router.route("/").get(this.adminOpsForRidersController.getRiders);

    this.router
      .route("/:riderId")
      .get(this.adminOpsForRidersController.riderDetails);
    this.router
      .route("/:riderId/account-status")
      .patch(this.adminOpsForRidersController.setAccountStatus);
    this.router
      .route("/:riderId/approval")
      .patch(this.adminOpsForRidersController.setApprovalStatus);
  }
}
