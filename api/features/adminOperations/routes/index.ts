import { Router } from "express";
import { AdminOpsVendorsRoutes } from "./vendors.routes";
import { AdminOpsProductsRoutes } from "./products.routes";

export class AdminOpsRoutes {
  public router: Router;
  public adminOpsVendorsRoutes: AdminOpsVendorsRoutes
  public adminOpsProductsRoutes: AdminOpsProductsRoutes

  constructor() {
    this.adminOpsVendorsRoutes = new AdminOpsVendorsRoutes()
    this.adminOpsProductsRoutes = new AdminOpsProductsRoutes()

    this.router = Router();
    this.initializeRoutes();

  }

  private initializeRoutes() {
    this.router.use("/vendors", this.adminOpsVendorsRoutes.router);
    this.router.use("/products", this.adminOpsProductsRoutes.router);
  }
}

