import { Router } from "express";
import { vendorsController } from "../controllers/vendors.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { vendorsCategoryController } from "../controllers/category.controller";
import { vendorsOrdersController } from "../controllers/vendorsOrders.controller";

class VendorsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/register").post(vendorsController.signup);
    this.router.route("/login").post(vendorsController.login);

    this.router.route("/category").get(vendorsCategoryController.getCategories);
    this.router
      .route("/category/:categoryId/sub-category")
      .get(vendorsCategoryController.getSubCategoriesByCategory);

    this.router.use(verifyAuthTokenMiddleware);

    this.router.route("/me").get(vendorsController.getMe);
    this.router.route("/products").get(vendorsController.getProducts);

    this.router.route("/nearby").get(vendorsController.getNearByVendors);

    this.router
      .route("/category/:categoryId/vendors")
      .get(vendorsController.getVendorsByCategory);
    this.router
      .route("/:vendorId/products/")
      .get(vendorsController.getProductsAndGroupByCategory);

    this.router
      .route("/order-metrics")
      .get(vendorsOrdersController.orderMetrics);
  }
}

export const vendorsRoutes = new VendorsRoutes();
