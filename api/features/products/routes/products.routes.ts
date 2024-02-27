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

    this.router.route("/category").get(productsController.getCategories);
    this.router
      .route("/category/:categoryId/get-products/")
      .get(productsController.getProductsByCategory);

    this.router.route("/").post(productsController.addProduct);
    this.router.route("/search").get(productsController.searchProducts);
    this.router.route("/:productId").get(productsController.productDetails);
    this.router.route("/:productId").delete(productsController.deleteProduct);
  }
}

export const productsRoutes = new ProductsRoutes();
