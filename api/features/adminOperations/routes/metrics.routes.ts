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

    this.router.route("/vendors/chart").get(MetricsController.getVendorsChart);

    this.router
      .route("/riders/summary")
      .get(MetricsController.getRidersSummary);
    this.router.route("/riders/top").get(MetricsController.getTopRiders);
    this.router.route("/riders/chart").get(MetricsController.getRidersChart);

    this.router
      .route("/products/summary")
      .get(MetricsController.getProductsSummary);
    this.router.route("/products/top").get(MetricsController.getTopProducts);
    this.router
      .route("/products/categories/top")
      .get(MetricsController.getTopProductCategories);
    this.router
      .route("/products/chart")
      .get(MetricsController.getProductsChart);

    this.router
      .route("/customers/summary")
      .get(MetricsController.getCustomersSummary);
    this.router.route("/customers/top").get(MetricsController.getTopCustomers);
    this.router
      .route("/customers/chart")
      .get(MetricsController.getCustomersChart);
  }
}
