import { Router } from "express";
import { adminOpsForProductsController } from "../controllers/products.controller";

class AdminOpsProductsRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  async initializeRoutes() {
    this.router
      .route("/category")
      .post(adminOpsForProductsController.createCategory);
  }
}

export const adminOpsProductsRoutes = new AdminOpsProductsRoutes();
