import { Router } from "express";
import { AdminOpsForProductsController } from "../controllers/products.controller";

export class AdminOpsProductsRoutes {
  public router: Router;
  private adminOpsForProductsController: AdminOpsForProductsController;

  constructor() {
    this.adminOpsForProductsController = new AdminOpsForProductsController();

    this.router = Router();
    this.initializeRoutes();
  }
  async initializeRoutes() {
    this.router
      .route("/category")
      .post(this.adminOpsForProductsController.createCategory);

    this.router
      .route("/:productId/approve")
      .patch(this.adminOpsForProductsController.approveProduct);

    this.router
      .route("/:productId/reject")
      .patch(this.adminOpsForProductsController.rejectProduct);

    this.router
      .route("/")
      .get(this.adminOpsForProductsController.getProductList);

    this.router
      .route('/metrics')
      .get(this.adminOpsForProductsController.metrics)
    this.router
      .route('/pending')
      .get(this.adminOpsForProductsController.pendingProducts);

  }
}
