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
      .route("/register/:vendorId")
      .post(this.adminOpsForProductsController.createProduct);
    this.router
      .route("/category")
      .post(this.adminOpsForProductsController.createCategory);
    this.router
      .route("/sub-category")
      .post(this.adminOpsForProductsController.createSubCategory);
    this.router
      .route("/categories")
      .get(this.adminOpsForProductsController.listProductCategories);
    this.router
      .route("/category/:categoryId/sub-categories")
      .get(this.adminOpsForProductsController.getCategorySubCategories);
    this.router
      .route("/:productId/approve")
      .patch(this.adminOpsForProductsController.approveProduct);

    this.router
      .route("/:productId/reject")
      .patch(this.adminOpsForProductsController.rejectProduct);

    this.router.route("/").get(this.adminOpsForProductsController.getList);

    this.router
      .route("/metrics")
      .get(this.adminOpsForProductsController.metrics);

    this.router
      .route("/top")
      .get(this.adminOpsForProductsController.getTopProducts);

    this.router
      .route("/summary")
      .get(this.adminOpsForProductsController.getProductSummary);

    this.router
      .route("/metrics")
      .get(this.adminOpsForProductsController.getProductMetrics);

    this.router
      .route("/:productId")
      .get(this.adminOpsForProductsController.getProductDetails);

    this.router
      .route("/:productId")
      .delete(this.adminOpsForProductsController.deleteProduct);

    this.router
      .route("/top-categories")
      .get(this.adminOpsForProductsController.getTopCategories);
  }
}
