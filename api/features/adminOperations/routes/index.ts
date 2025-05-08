import { Router } from "express";
import { AdminOpsVendorsRoutes } from "./vendors.routes";
import { AdminOpsProductsRoutes } from "./products.routes";
import { AdminOpsRidersRoutes } from "./riders.routes";
import { AdminOpsWalletRoutes } from "./wallet.routes";
import { AdminOpsWorkAreaRoutes } from "./workArea.routes";
import { AdminOpsTransactionsRoutes } from "./transanctions.routes";
import { AdminOpsCustomersRoutes } from "./customers.routes";
import { AdminOpsOrdersRoutes } from "./orders.routes";
import { AdminOpsErrandsRoutes } from "./errands.routes";
import { AdminOpsDashboardRoutes } from "./dashboard.routes";

export class AdminOpsRoutes {
  public router: Router;

  private adminOpsVendorsRoutes: AdminOpsVendorsRoutes;
  private adminOpsProductsRoutes: AdminOpsProductsRoutes;
  private adminOpsRidersRoutes: AdminOpsRidersRoutes;
  private adminOpsWalletRoutes: AdminOpsWalletRoutes;
  private adminOpsWorkAreaRoutes: AdminOpsWorkAreaRoutes;
  private adminOpsTransactionsRoutes: AdminOpsTransactionsRoutes;
  private adminOpsCustomersRoutes: AdminOpsCustomersRoutes;
  private adminOpsOrdersRoutes: AdminOpsOrdersRoutes;
  private adminOpsErrandsRoutes: AdminOpsErrandsRoutes;
  private adminOpsDashboardRoutes: AdminOpsDashboardRoutes;

  constructor() {
    this.adminOpsVendorsRoutes = new AdminOpsVendorsRoutes();
    this.adminOpsRidersRoutes = new AdminOpsRidersRoutes();
    this.adminOpsProductsRoutes = new AdminOpsProductsRoutes();
    this.adminOpsRidersRoutes = new AdminOpsRidersRoutes();
    this.adminOpsWalletRoutes = new AdminOpsWalletRoutes();
    this.adminOpsWorkAreaRoutes = new AdminOpsWorkAreaRoutes();
    this.adminOpsTransactionsRoutes = new AdminOpsTransactionsRoutes();
    this.adminOpsCustomersRoutes = new AdminOpsCustomersRoutes();
    this.adminOpsOrdersRoutes = new AdminOpsOrdersRoutes();
    this.adminOpsErrandsRoutes = new AdminOpsErrandsRoutes();
    this.adminOpsDashboardRoutes = new AdminOpsDashboardRoutes();

    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use("/vendors", this.adminOpsVendorsRoutes.router);
    this.router.use("/riders", this.adminOpsRidersRoutes.router);
    this.router.use("/products", this.adminOpsProductsRoutes.router);
    this.router.use("/riders", this.adminOpsRidersRoutes.router);
    this.router.use("/wallet", this.adminOpsWalletRoutes.router);
    this.router.use("/work-areas", this.adminOpsWorkAreaRoutes.router);
    this.router.use("/transactions", this.adminOpsTransactionsRoutes.router);
    this.router.use("/customers", this.adminOpsCustomersRoutes.router);
    this.router.use("/orders", this.adminOpsOrdersRoutes.router);
    this.router.use("/errands", this.adminOpsErrandsRoutes.router);
    this.router.use("/dashboard", this.adminOpsDashboardRoutes.router);
  }
}
