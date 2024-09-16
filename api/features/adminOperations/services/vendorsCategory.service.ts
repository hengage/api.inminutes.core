import { HandleException, HTTP_STATUS_CODES } from "../../../utils";
import { VendorCategory, VendorSubCategory } from "../../vendors";

export class AdminOpsVendorsCategoryService {
  private vendorCategoryModel = VendorCategory;
  private vendorSubCategoryModel = VendorSubCategory;

  async createCategory(payload: any) {
    const categoryExists = await this.vendorCategoryModel
      .findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        "The category name already exists"
      );
    }

    const category = await this.vendorCategoryModel.create({
      name: payload.name,
      image: payload.image,
    });

    return {
      _id: category._id,
      name: category.name,
      image: category.image,
    };
  }

  async createSubCategory(payload: any) {
    const subCategoryExists = await this.vendorSubCategoryModel
      .findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (subCategoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        "The sub category name already exists"
      );
    }

    const subCategory = await this.vendorSubCategoryModel.create({
      name: payload.name,
      category: payload.category,
    });

    return {
      _id: subCategory._id,
      name: subCategory.name,
    };
  }
}
