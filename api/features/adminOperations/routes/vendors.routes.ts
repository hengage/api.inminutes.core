import { Router } from "express";
import { AdminOpsVendorsCategoryController } from "../controllers/vendorsCategory.controllers";
import { AdminOpsVendorsController } from "../controllers/vendors.controller";

export class AdminOpsVendorsRoutes {
  public router: Router;
  private adminOpsVendorCategoryController: AdminOpsVendorsCategoryController
  private adminOpsVendorsController: AdminOpsVendorsController

  constructor() {
    this.adminOpsVendorCategoryController = new AdminOpsVendorsCategoryController()
    this.adminOpsVendorsController = new AdminOpsVendorsController

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
    this.router
      .route('/')
      .get(this.adminOpsVendorsController.getAllVendors)
    this.router
      .route('/:vendorId')
      .get(this.adminOpsVendorsController.getVendor)
    this.router
      .route('/:vendorId/status')
      .put(this.adminOpsVendorsController.setAccountStatus)
    this.router
      .route("/:vendorId/approval")
      .put(this.adminOpsVendorsController.approveOrDisapproveVendor);
    this.router
      .route("/:vendorId/products-metrics")
      .get(this.adminOpsVendorsController.productMetrics);
  }
}