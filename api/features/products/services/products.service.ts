import { ProductsRepository } from "../repository/products.repo";

class ProductsService {
  private productsRepo: ProductsRepository

  constructor() {
    this.productsRepo = new ProductsRepository
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
    const isInWishList = await this.productsRepo.checkProductIsInCustomerWishList(
      params
    );
    return isInWishList;
  }
}

export const productsService = new ProductsService();
