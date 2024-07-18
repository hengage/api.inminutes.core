import { Router } from "express";
import { ErrandController } from "../controllers/errand.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";

export class ErrandRoutes {
  private errandController: ErrandController;
  public router: Router;

  constructor() {
    this.errandController = new ErrandController();

    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/").post(this.errandController.create);
  }
}
