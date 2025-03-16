import { Router } from "express";
import { AdminOpsVendorsCategoryController } from "../controllers/vendorsCategory.controllers";
import { AdminOpsVendorsController } from "../controllers/vendors.controller";

export class AdminOpsVendorsRoutes {
  public router: Router;
  private adminOpsVendorCategoryController: AdminOpsVendorsCategoryController;
  private adminOpsVendorsController: AdminOpsVendorsController;

  constructor() {
    this.adminOpsVendorCategoryController =
      new AdminOpsVendorsCategoryController();
    this.adminOpsVendorsController = new AdminOpsVendorsController();

    this.router = Router();
    this.initializeRoutes();
  }

  async initializeRoutes() {
    this.router
      .route("/category")
      .post(this.adminOpsVendorCategoryController.createCategory);
    this.router
      .route("/category")
      .get(this.adminOpsVendorCategoryController.getCategories);
    this.router
      .route("/sub-category")
      .post(this.adminOpsVendorCategoryController.createSubCategory);
    this.router.route("/").get(this.adminOpsVendorsController.getAllVendors);
    this.router.route("/top").get(this.adminOpsVendorsController.getTopList);
    this.router.route("/summary").get(this.adminOpsVendorsController.getVendorSummary);
    this.router.route("/metrics").get(this.adminOpsVendorsController.getVendorMetrics);
    this.router
      .route("/:vendorId")
      .get(this.adminOpsVendorsController.getVendor);
    this.router
      .route("/:vendorId/status")
      .put(this.adminOpsVendorsController.setAccountStatus);
    this.router
      .route("/:vendorId/approval")
      .put(this.adminOpsVendorsController.setApprovalStatus);
    this.router
      .route("/:vendorId/products-metrics")
      .get(this.adminOpsVendorsController.productMetrics);
    this.router.route("/").post(this.adminOpsVendorsController.registerVendor);
    this.router.route("/update/:vendorId").put(this.adminOpsVendorsController.updateVendor);
    this.router.route("/:vendorId").delete(this.adminOpsVendorsController.deleteVendor);
  }
}
