import { Router } from "express";
import { AdminOpsVendorsCategoryController } from "../controllers/vendorsCategory.controllers";

export class AdminOpsVendorsRoutes {
  public router: Router;
  private adminOpsVendorCategoryController: AdminOpsVendorsCategoryController

  constructor() {
    this.adminOpsVendorCategoryController = new AdminOpsVendorsCategoryController() 

    this.router = Router();
    this.initializeRoutes();


  }

  async initializeRoutes() {
    this.router
      .route("/category")
      .post(this.adminOpsVendorCategoryController.createCategory);
    this.router
      .route("/sub-category")
      .post(this.adminOpsVendorCategoryController.createSubCategory);
  }
}