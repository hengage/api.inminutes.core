import {
  VendorCategory,
  VendorSubCategory,
} from "../models/vendorsCategory.model";
import {
  IVendorCategoryDocument,
  IVendorSubCategoryDocument,
} from "../vendors.interface";

class VendorsCategoryService {
  async getCategories(): Promise<IVendorCategoryDocument[]> {
    const catgories = await VendorCategory.find()
      .select("name image")
      .lean()
      .exec();

    return catgories;
  }

  async getSubCategoriesByCategory(
    categoryId: string
  ): Promise<IVendorSubCategoryDocument[]> {
    const catgories = await VendorSubCategory.find({ category: categoryId })
      .select("name")
      .lean()
      .exec();

    return catgories;
  }

  async getLocalMarketSubcategories() {
    const subCatgories = await VendorSubCategory.find({ category: "447c0000" })
      .select("name")
      .lean()
      .exec();

    return subCatgories;
  }
}

export const vendorsCategoryService = new VendorsCategoryService();
