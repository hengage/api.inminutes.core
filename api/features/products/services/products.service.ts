import { ProductsRepository } from "../repository/products.repo";
import { RedisClient } from "../../../services";

class ProductsService {
  private productsRepo: ProductsRepository;
  private redisClient: RedisClient;

  constructor() {
    this.productsRepo = new ProductsRepository();
    this.redisClient = new RedisClient();
  }

  async details(productId: string) {
    const cacheKey = `product:${productId}`;
    const cachedProduct = await this.redisClient.get(cacheKey);
    console.log({ cachedProduct });
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }

    const product = await this.productsRepo.details(productId);

    this.redisClient
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
