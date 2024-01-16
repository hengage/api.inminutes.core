import { HandleException, STATUS_CODES } from "../../../utils";
import { ProductCategory } from "../../products";

class AdminOpsForProductsService {
  async createCategory(payload: any) {
    const categoryExists = await ProductCategory.findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "The category name already exists"
      );
    }

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
