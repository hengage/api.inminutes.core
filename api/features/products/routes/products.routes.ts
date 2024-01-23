import { Router } from "express";
import { productsController } from "../controllers/products.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";

class ProductsRoutes {
  router = Router();
  constructor() {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.use(verifyAuthTokenMiddleware);
    this.router.route("/").post(productsController.addProduct);
    this.router.route("/:productId").delete(productsController.deleteProduct);
    this.router.route("/category").get(productsController.getCategories);
  }
}

export const productsRoutes = new ProductsRoutes();
