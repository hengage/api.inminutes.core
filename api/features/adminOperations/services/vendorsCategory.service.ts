import { HandleException, STATUS_CODES } from "../../../utils";
import { VendorCategory, VendorSubCategory } from "../../vendors";

class AdminOpsVendorsCategoryService {
  async createCategory(payload: any) {
    const categoryExists = await VendorCategory.findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "The category name already exists"
      );
    }

    const category = await VendorCategory.create({
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
    const categoryExists = await VendorSubCategory.findOne({ name: payload.name })
    .select("name")
    .lean()
    .exec();

  if (categoryExists) {
    throw new HandleException(
      STATUS_CODES.CONFLICT,
      "The sub category name already exists"
    );
  }

    const subCategory = await VendorSubCategory.create({
      name: payload.name,
      category: payload.category,
    });

    return {
      _id: subCategory._id,
      name: subCategory.name,
    };
  }
}

export const adminOpsVendorsCategoryService =
  new AdminOpsVendorsCategoryService();
