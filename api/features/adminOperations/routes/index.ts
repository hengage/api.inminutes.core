import { Router } from "express";
import { adminOpsVendorsRoutes } from "./vendors.routes";
import { adminOpsProductsRoutes } from "./products.routes";

class AdminOpsRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use("/vendors", adminOpsVendorsRoutes.router);
    this.router.use("/products", adminOpsProductsRoutes.router);
  }
}

export const adminOpsRoutes = new AdminOpsRoutes();
