import { productsRepo } from "../repository/products.repo";

class ProductsService {
    async addToWishList (params: {customerId: string, productId: string}){
        const wishList = await productsRepo.addToWishList(params)
        return wishList
    }
  
    async removeFromWishList (params: {customerId: string, productId: string}){
        const wishList = await productsRepo.removeFromWishList(params)
        return wishList
    }
}

export const productsService = new ProductsService()