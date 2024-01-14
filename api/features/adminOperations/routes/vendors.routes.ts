import { Router } from "express";
import { adminOpsVendorCategoryController } from "../controllers/vendorsCategory.controllers";

class AdminOpsVendorsRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  async initializeRoutes() {
    this.router
      .route("/category")
      .post(adminOpsVendorCategoryController.createCategory);
    this.router
      .route("/sub-category")
      .post(adminOpsVendorCategoryController.createSubCategory);
  }
}

export const adminOpsVendorsRoutes = new AdminOpsVendorsRoutes();
