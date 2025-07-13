import { Router } from "express";
import { MetricsController } from "../controllers/metrics.controllers";

export class AdminOpsMetricsRoutes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router
      .route("/vendors/summary")
      .get(MetricsController.getVendorsSummary);

    this.router.route("/vendors/top").get(MetricsController.getTopVendors);

    this.router
      .route("/vendors/categories/top")
      .get(MetricsController.getTopVendorCategories);
    this.router
      .route("/riders/summary")
      .get(MetricsController.getRidersSummary);
    this.router.route("/riders/top").get(MetricsController.getTopRiders);
    this.router
      .route("/products/summary")
      .get(MetricsController.getProductsSummary);
    this.router.route("/products/top").get(MetricsController.getTopProducts);
    this.router
      .route("/products/categories/top")
      .get(MetricsController.getTopProductCategories);
  }
}
