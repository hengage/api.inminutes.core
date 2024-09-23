import { capitalize, HandleException, HTTP_STATUS_CODES } from "../../../utils";
import { VendorCategory, VendorSubCategory } from "../../vendors";
import { IVendorCategoryDocument, IVendorSubCategoryDocument } from "../../vendors/vendors.interface";

export class AdminOpsVendorsCategoryService {
  private vendorCategoryModel = VendorCategory;
  private vendorSubCategoryModel = VendorSubCategory;

  async createCategory(payload: { name: string; image: string })
    : Promise<IVendorCategoryDocument> {
    const categoryExists = await this.vendorCategoryModel
      .findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        `${capitalize(payload.name)} is an existing vendor category`
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

  async createSubCategory(payload: { name: string; category: string })
    : Promise<Omit<IVendorSubCategoryDocument, 'category'>> {
    const subCategoryExists = await this.vendorSubCategoryModel
      .findOne({ name: payload.name, category: payload.category })
      .select("name")
      .lean()
      .exec();

    if (subCategoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        `${capitalize(payload.name)} is an existing sub-category for this category`
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
