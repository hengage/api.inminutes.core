import { Router } from "express";
import { customersRoutes } from "./features/customers";
import { authRoutes } from "./features/authentication";
import { vendorsRoutes } from "./features/vendors";
import { MediaRoutes } from "./features/media";
import { ridersRoutes } from "./features/riders";
import { AdminOpsRoutes } from "./features/adminOperations";
import { ProductsRoutes } from "./features/products";
import { OrdersRoutes } from "./features/orders";
import { transactionRoutes } from "./features/transactions";
import { ErrandRoutes } from "./features/errand";

export class Routes {
  /*
        Imports and sets up all the necessary routes classes for use in the application.
        The main purpose of this class is to provide a centralized location to manage
        the routing configuration for the application, making it easier  to add, modify, or remove routes as needed.
    */
  private mediaRoutes: MediaRoutes
  private adminOpsRoutes: AdminOpsRoutes
  private ordersRoutes: OrdersRoutes
  private productsRoutes: ProductsRoutes
  private errandRoutes: ErrandRoutes
  public router: Router;

  constructor() {
    this.mediaRoutes = new MediaRoutes();
    this.adminOpsRoutes = new AdminOpsRoutes()
    this.productsRoutes = new ProductsRoutes();
    this.ordersRoutes = new OrdersRoutes();
    this.errandRoutes = new ErrandRoutes();

    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use("/auth", authRoutes.router);
    this.router.use("/customers", customersRoutes.router);
    this.router.use("/vendors", vendorsRoutes.router);
    this.router.use("/riders", ridersRoutes.router);
    this.router.use("/products", this.productsRoutes.router);
    this.router.use("/orders", this.ordersRoutes.router);
    this.router.use("/transaction", transactionRoutes.router);
    this.router.use("/admin", this.adminOpsRoutes.router)
    this.router.use("/media", this.mediaRoutes.router);
    this.router.use('/errand', this.errandRoutes.router);
  }
}