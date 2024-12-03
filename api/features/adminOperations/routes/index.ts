import { Router } from "express";
import { AdminOpsVendorsRoutes } from "./vendors.routes";
import { AdminOpsProductsRoutes } from "./products.routes";
import { AdminOpsWalletRoutes } from "./wallet.routes";

export class AdminOpsRoutes {
  public router: Router;
  public adminOpsVendorsRoutes: AdminOpsVendorsRoutes
  public adminOpsProductsRoutes: AdminOpsProductsRoutes
  public adminOpsWalletRoutes: AdminOpsWalletRoutes;

  constructor() {
    this.adminOpsVendorsRoutes = new AdminOpsVendorsRoutes()
    this.adminOpsProductsRoutes = new AdminOpsProductsRoutes()
    this.adminOpsWalletRoutes = new AdminOpsWalletRoutes();

    this.router = Router();
    this.initializeRoutes();

  }

  private initializeRoutes() {
    this.router.use("/vendors", this.adminOpsVendorsRoutes.router);
    this.router.use("/products", this.adminOpsProductsRoutes.router);
    this.router.use("/wallet", this.adminOpsWalletRoutes.router);
  }
}

