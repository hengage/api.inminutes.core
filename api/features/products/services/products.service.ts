import { redisClient } from "../../../services/";
import { ProductsRepository } from "../repository/products.repo";

class ProductsService {
  private productsRepo: ProductsRepository;

  constructor() {
    this.productsRepo = new ProductsRepository();
  }

  async details(productId: string) {
    const cacheKey = `product:${productId}`;
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const product = await this.productsRepo.details(productId);

    redisClient
      .setWithExpiry(cacheKey, JSON.stringify(product), 3600)
      .catch((error) => console.error("Error caching product:", error));

    return product;
  }

  async addToWishList(params: { customerId: string; productId: string }) {
    const wishList = await this.productsRepo.addToWishList(params);
    return wishList;
  }

  async removeFromWishList(params: { customerId: string; productId: string }) {
    const wishList = await this.productsRepo.removeFromWishList(params);
    return wishList;
  }

  async checkProductIsInCustomerWishList(params: {
    customerId: string;
    productId: string;
  }) {
    const isInWishList =
      await this.productsRepo.checkProductIsInCustomerWishList(params);
    return isInWishList;
  }
}

export const productsService = new ProductsService();
