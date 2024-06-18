import { Router } from "express";
import { ProductsController } from "../controllers/products.controller";
import { verifyAuthTokenMiddleware } from "../../../middleware";

export class ProductsRoutes {
  private productsController: ProductsController
  router = Router();
  constructor() {
    this.productsController = new ProductsController();
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.use(verifyAuthTokenMiddleware);

    this.router.route("/category").get(this.productsController.getCategories);
    this.router
      .route("/category/:categoryId/get-products/")
      .get(this.productsController.getProductsByCategory);

    this.router.route("/").post(this.productsController.addProduct);
    this.router.route("/search").get(this.productsController.searchProducts);
    this.router.route("/:productId").get(this.productsController.productDetails);
    this.router.route("/:productId").delete(this.productsController.deleteProduct);
  }
}