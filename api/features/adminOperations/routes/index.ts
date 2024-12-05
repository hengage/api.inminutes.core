import { Router } from "express";
import { AdminOpsVendorsRoutes } from "./vendors.routes";
import { AdminOpsProductsRoutes } from "./products.routes";
import { AdminOpsWalletRoutes } from "./wallet.routes";
import { AdminOpsRidersRoutes } from "./riders.routes";

export class AdminOpsRoutes {
  public router: Router;
  public adminOpsVendorsRoutes: AdminOpsVendorsRoutes
  private adminOpsRidersRoutes: AdminOpsRidersRoutes;
  public adminOpsProductsRoutes: AdminOpsProductsRoutes
  public adminOpsWalletRoutes: AdminOpsWalletRoutes;

  constructor() {
    this.adminOpsVendorsRoutes = new AdminOpsVendorsRoutes()
    this.adminOpsRidersRoutes = new AdminOpsRidersRoutes();
    this.adminOpsProductsRoutes = new AdminOpsProductsRoutes()
    this.adminOpsWalletRoutes = new AdminOpsWalletRoutes();

    this.router = Router();
    this.initializeRoutes();

  }

  private initializeRoutes() {
    this.router.use("/vendors", this.adminOpsVendorsRoutes.router);
    this.router.use("/riders", this.adminOpsRidersRoutes.router);
    this.router.use("/products", this.adminOpsProductsRoutes.router);
    this.router.use("/wallet", this.adminOpsWalletRoutes.router);
  }
}

