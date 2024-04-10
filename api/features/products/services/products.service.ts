import { productsRepo } from "../repository/products.repo";

class ProductsService {
  async addToWishList(params: { customerId: string; productId: string }) {
    const wishList = await productsRepo.addToWishList(params);
    return wishList;
  }

  async removeFromWishList(params: { customerId: string; productId: string }) {
    const wishList = await productsRepo.removeFromWishList(params);
    return wishList;
  }

  async checkProductIsInCustomerWishList(params: {
    customerId: string;
    productId: string;
  }) {
    const isInWishList = await productsRepo.checkProductIsInCustomerWishList(
      params
    );
    return isInWishList;
  }
}

export const productsService = new ProductsService();
