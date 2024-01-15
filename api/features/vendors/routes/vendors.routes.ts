import { Router } from "express";
import { vendorsController } from "../controllers/vendors.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";
import { vendorsCategoryController } from "../controllers/category.controller";

class VendorsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.route("/register").post(vendorsController.signup);
    this.router.route("/login").post(vendorsController.login);

    this.router.use(verifyAuthTokenMiddleware);

    this.router.route("/me").get(vendorsController.getMe);

    this.router.route("/category").get(vendorsCategoryController.getCategories)
    this.router.route("/category/:categoryId/sub-category").get(vendorsCategoryController.getSubCategoriesByCategory)
  }
}

export const vendorsRoutes = new VendorsRoutes()
