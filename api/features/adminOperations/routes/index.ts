import { Router } from "express";
import { AdminOpsVendorsRoutes } from "./vendors.routes";
import { AdminOpsProductsRoutes } from "./products.routes";
import { AdminOpsRidersRoutes } from "./riders.routes";
import { AdminOpsWalletRoutes } from "./wallet.routes";
import { AdminOpsWorkAreaRoutes } from "./workArea.routes";

export class AdminOpsRoutes {
  public router: Router;
  public adminOpsVendorsRoutes: AdminOpsVendorsRoutes
  public adminOpsProductsRoutes: AdminOpsProductsRoutes
  public adminOpsRidersRoutes: AdminOpsRidersRoutes;
  public adminOpsWalletRoutes: AdminOpsWalletRoutes;
  public adminOpsWorkAreaRoutes: AdminOpsWorkAreaRoutes;

  constructor() {
    this.adminOpsVendorsRoutes = new AdminOpsVendorsRoutes()
    this.adminOpsRidersRoutes = new AdminOpsRidersRoutes();
    this.adminOpsProductsRoutes = new AdminOpsProductsRoutes()
    this.adminOpsRidersRoutes = new AdminOpsRidersRoutes();
    this.adminOpsWalletRoutes = new AdminOpsWalletRoutes();
    this.adminOpsWorkAreaRoutes = new AdminOpsWorkAreaRoutes();

    this.router = Router();
    this.initializeRoutes();

  }

  private initializeRoutes() {
    this.router.use("/vendors", this.adminOpsVendorsRoutes.router);
    this.router.use("/riders", this.adminOpsRidersRoutes.router);
    this.router.use("/products", this.adminOpsProductsRoutes.router);
    this.router.use("/riders", this.adminOpsRidersRoutes.router);
    this.router.use("/wallet", this.adminOpsWalletRoutes.router);
    this.router.use("/work-area", this.adminOpsWorkAreaRoutes.router);
  }
}

