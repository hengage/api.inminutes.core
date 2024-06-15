import { HandleException, PRODUCT_STATUS, STATUS_CODES } from "../../../utils";
import { Product, ProductCategory } from "../../products";

export class AdminOpsForProductsService {
  private productCategoryModel = ProductCategory;
  private productModel = Product;

  async createCategory(payload: any) {
    const categoryExists = await this.productCategoryModel
      .findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "The category name already exists"
      );
    }

    const category = await this.productCategoryModel.create({
      name: payload.name,
    });

    return {
      _id: category._id,
      name: category.name,
    };
  }

  async approveProduct(productId: string) {
    await this.productModel.findByIdAndUpdate(
      productId,
      {
        $set: { status: PRODUCT_STATUS.APPROVED },
      },
      { new: true }
    );
  }

  async rejectProduct(productId: string) {
    await this.productModel.findByIdAndUpdate(
      productId,
      {
        $set: { status: PRODUCT_STATUS.REJECTED },
      },
      { new: true }
    );
  }
}
