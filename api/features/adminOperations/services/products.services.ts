import { ProductCategory } from "../../products";

class AdminOpsForProductsService {
  async createCategory(payload: any) {
    const category = await ProductCategory.create({
      name: payload.name,
    });

    return {
      _id: category._id,
      name: category.name,
    };
  }
}

export const adminOpsForProductsService = new AdminOpsForProductsService();
